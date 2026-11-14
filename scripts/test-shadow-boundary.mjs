import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { evaluateCandidateResponse, shadowEligibility, safelyRunShadow } from '../src/lib/server/shadow-contract.mjs';

const route = await readFile(new URL('../src/app/api/simplify/route.ts', import.meta.url), 'utf8');
const helper = await readFile(new URL('../src/lib/server/shadow-mode.ts', import.meta.url), 'utf8');
const contract = await readFile(new URL('../src/lib/server/shadow-contract.mjs', import.meta.url), 'utf8');
assert.match(route, /after\(async \(\) =>/);
assert.match(route, /x-prism-shadow-fixture/);
assert.doesNotMatch(helper, /candidate_primary/);
assert.doesNotMatch(contract, /candidate_primary/);
assert.doesNotMatch(route, /shadowTelemetry.*return/);

const afterCalls = [];
const mockedAfter = (task) => { afterCalls.push(task); };
function scheduleShadow(task) {
  mockedAfter(async () => { await safelyRunShadow(task); });
}

assert.equal(shadowEligibility({ enabled: false }).reason, 'disabled');
assert.equal(shadowEligibility({ enabled: true, userId: undefined }).reason, 'no_authenticated_user');
assert.equal(shadowEligibility({ enabled: true, userId: 'u1', allowlisted: false }).reason, 'user_not_allowlisted');
assert.equal(shadowEligibility({ enabled: true, userId: 'u1', allowlisted: true, fixtureApproved: false }).reason, 'synthetic_fixture_not_approved');
assert.equal(shadowEligibility({ enabled: true, userId: 'u1', allowlisted: true, fixtureApproved: true, url: 'http://candidate', budget: 0.01 }).reason, 'candidate_endpoint_not_configured');
assert.equal(shadowEligibility({ enabled: true, userId: 'u1', allowlisted: true, fixtureApproved: true, url: 'https://candidate', budget: 0 }).reason, 'candidate_budget_not_configured');
assert.equal(shadowEligibility({ enabled: true, userId: 'u1', allowlisted: true, fixtureApproved: true, url: 'https://candidate', budget: 0.01 }).eligible, true);

const valid = evaluateCandidateResponse({ responseOk: true, payload: { ok: true, budgetEnforced: true, usage: { totalTokens: 20, cost: 0.001 } }, maxCostUsd: 0.01, maxOutputTokens: 100 });
assert.equal(valid.accepted, true);
assert.equal(valid.fallbackState, 'candidate_observed');
assert.equal(valid.reason, 'candidate_observed');

const missingUsage = evaluateCandidateResponse({ responseOk: true, payload: { ok: true }, maxCostUsd: 0.01, maxOutputTokens: 100 });
assert.equal(missingUsage.accepted, false);
assert.equal(missingUsage.reason, 'candidate_usage_unverified');
assert.equal(missingUsage.fallbackState, 'candidate_failed');

const untrustedBudget = evaluateCandidateResponse({ responseOk: true, payload: { ok: true, budgetEnforced: false, usage: { totalTokens: 20, cost: 0.001 } }, maxCostUsd: 0.01, maxOutputTokens: 100 });
assert.equal(untrustedBudget.accepted, false);
assert.equal(untrustedBudget.fallbackState, 'candidate_failed');

const overBudget = evaluateCandidateResponse({ responseOk: true, payload: { ok: true, budgetEnforced: true, usage: { totalTokens: 101, cost: 0.02 }, output: 'candidate text' }, maxCostUsd: 0.01, maxOutputTokens: 100 });
assert.equal(overBudget.accepted, false);
assert.equal(overBudget.fallbackState, 'candidate_failed');
assert.equal(overBudget.output, undefined);

for (const invalidValue of [null, '', false, undefined, Number.NaN, Number.POSITIVE_INFINITY, -1]) {
  const badTokens = evaluateCandidateResponse({
    responseOk: true,
    payload: { ok: true, budgetEnforced: true, usage: { totalTokens: invalidValue, cost: 0.001 }, output: 'hidden' },
    maxCostUsd: 0.01,
    maxOutputTokens: 100,
  });
  assert.equal(badTokens.accepted, false);
  assert.equal(badTokens.fallbackState, 'candidate_failed');
  assert.equal(badTokens.reason, 'candidate_usage_unverified');
  assert.equal(badTokens.output, undefined);

  const badCost = evaluateCandidateResponse({
    responseOk: true,
    payload: { ok: true, budgetEnforced: true, usage: { totalTokens: 10, cost: invalidValue }, output: 'hidden' },
    maxCostUsd: 0.01,
    maxOutputTokens: 100,
  });
  assert.equal(badCost.accepted, false);
  assert.equal(badCost.fallbackState, 'candidate_failed');
  assert.equal(badCost.reason, 'candidate_usage_unverified');
  assert.equal(badCost.output, undefined);
}

let fetchCalls = 0;
globalThis.fetch = async () => {
  fetchCalls += 1;
  return { ok: false, json: async () => ({ ok: false }) };
};
scheduleShadow(async () => {
  const response = await fetch('https://candidate');
  return evaluateCandidateResponse({ responseOk: response.ok, payload: await response.json(), maxCostUsd: 0.01, maxOutputTokens: 100 });
});
assert.equal(afterCalls.length, 1);
await afterCalls[0]();
assert.equal(fetchCalls, 1);

const guardedFailure = await safelyRunShadow(async () => { throw new Error('timeout'); });
assert.equal(guardedFailure.fallbackState, 'candidate_failed');
assert.equal(guardedFailure.reason, 'shadow_guard_error');

console.log('shadow behavioral checks: 20 passed');
