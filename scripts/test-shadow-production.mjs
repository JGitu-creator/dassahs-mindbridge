import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { runShadowProbe } from '../src/lib/server/shadow-mode.ts';

const fixture = 'Synthetic Prism fixture: summarize this safe test passage.';
const fixtureHash = createHash('sha256').update(fixture).digest('hex');
const originalEnv = { ...process.env };
let fetchCalls = 0;

function configure(overrides = {}) {
  Object.assign(process.env, {
    PRISM_SHADOW_MODE: 'true',
    PRISM_SHADOW_USER_IDS: 'test-user',
    PRISM_SHADOW_SYNTHETIC_TOKEN: 'synthetic-secret',
    PRISM_SHADOW_FIXTURE_SHA256: fixtureHash,
    PRISM_SHADOW_CANDIDATE_URL: 'https://candidate.test/shadow',
    PRISM_SHADOW_MAX_COST_USD: '0.01',
    PRISM_SHADOW_MAX_OUTPUT_TOKENS: '100',
    ...overrides,
  });
}

function response(payload, ok = true) {
  return { ok, json: async () => payload };
}

try {
  configure();
  globalThis.fetch = async () => { fetchCalls += 1; return response({ ok: true, budgetEnforced: true, usage: { totalTokens: 10, cost: 0.001 } }); };
  let result = await runShadowProbe({ userId: 'test-user', text: fixture, syntheticToken: 'wrong' });
  assert.equal(result.reason, 'synthetic_fixture_not_approved');
  assert.equal(fetchCalls, 0);

  result = await runShadowProbe({ userId: 'other-user', text: fixture, syntheticToken: 'synthetic-secret' });
  assert.equal(result.reason, 'user_not_allowlisted');

  result = await runShadowProbe({ userId: 'test-user', text: 'private text', syntheticToken: 'synthetic-secret' });
  assert.equal(result.reason, 'synthetic_fixture_not_approved');

  globalThis.fetch = async () => response({ ok: true });
  result = await runShadowProbe({ userId: 'test-user', text: fixture, syntheticToken: 'synthetic-secret' });
  assert.equal(result.reason, 'candidate_usage_unverified');
  assert.equal(result.fallbackState, 'candidate_failed');

  globalThis.fetch = async () => response({ ok: true, budgetEnforced: false, usage: { totalTokens: 10, cost: 0.001 } });
  result = await runShadowProbe({ userId: 'test-user', text: fixture, syntheticToken: 'synthetic-secret' });
  assert.equal(result.reason, 'candidate_usage_unverified');

  globalThis.fetch = async () => response({ ok: true, budgetEnforced: true, usage: { totalTokens: 101, cost: 0.02 }, output: 'hidden' });
  result = await runShadowProbe({ userId: 'test-user', text: fixture, syntheticToken: 'synthetic-secret' });
  assert.equal(result.reason, 'candidate_budget_exceeded');
  assert.equal(result.candidateAccepted, false);

  globalThis.fetch = async () => response({ ok: true, budgetEnforced: true, usage: { totalTokens: 10, cost: 0.001 }, output: 'hidden' });
  result = await runShadowProbe({ userId: 'test-user', text: fixture, syntheticToken: 'synthetic-secret' });
  assert.equal(result.reason, 'candidate_observed');
  assert.equal(result.fallbackState, 'candidate_observed');
  assert.equal(result.output, undefined);

  configure({ PRISM_SHADOW_CANDIDATE_URL: 'http://candidate.test/shadow' });
  result = await runShadowProbe({ userId: 'test-user', text: fixture, syntheticToken: 'synthetic-secret' });
  assert.equal(result.reason, 'candidate_endpoint_not_configured');

  console.log('production runShadowProbe checks: 9 passed');
} finally {
  process.env = originalEnv;
}
