const toFiniteNumber = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

export function evaluateCandidateResponse({ responseOk, payload, maxCostUsd, maxOutputTokens }) {
  const usage = payload?.usage;
  const totalTokens = toFiniteNumber(usage?.totalTokens);
  const reportedCost = toFiniteNumber(usage?.cost);
  const authoritative =
    payload?.budgetEnforced === true &&
    Boolean(usage) &&
    totalTokens !== null &&
    totalTokens >= 0 &&
    reportedCost !== null &&
    reportedCost >= 0;
  const overBudget = !authoritative || reportedCost > maxCostUsd || totalTokens > maxOutputTokens;
  const accepted = responseOk && payload?.ok !== false && !overBudget;
  return {
    accepted,
    fallbackState: accepted ? 'candidate_observed' : 'candidate_failed',
    reason: !authoritative ? 'candidate_usage_unverified' : overBudget ? 'candidate_budget_exceeded' : accepted ? 'candidate_observed' : 'candidate_http_error',
    totalTokens,
    reportedCost,
  };
}

export function shadowEligibility({ enabled, userId, allowlisted, fixtureApproved, url, budget }) {
  if (!enabled) return { eligible: false, reason: 'disabled' };
  if (!userId) return { eligible: false, reason: 'no_authenticated_user' };
  if (!allowlisted) return { eligible: false, reason: 'user_not_allowlisted' };
  if (!fixtureApproved) return { eligible: false, reason: 'synthetic_fixture_not_approved' };
  if (!/^https:\/\//i.test(url || '')) return { eligible: false, reason: 'candidate_endpoint_not_configured' };
  if (!(budget > 0)) return { eligible: false, reason: 'candidate_budget_not_configured' };
  return { eligible: true, reason: 'eligible' };
}

export async function safelyRunShadow(task) {
  try {
    return await task();
  } catch {
    return { candidateAccepted: false, fallbackState: 'candidate_failed', reason: 'shadow_guard_error' };
  }
}
