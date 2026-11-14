import { createHash } from 'node:crypto';
import type { AiUsage } from '@/lib/ai-usage';
import { evaluateCandidateResponse, shadowEligibility } from './shadow-contract.mjs';

type ShadowInput = {
  userId?: string;
  text: string;
  goal?: string;
  cognitiveMode?: string;
  simplicityLevel?: string;
  baselineUsage?: AiUsage;
  syntheticToken?: string | null;
};

type ShadowTelemetry = {
  enabled: boolean;
  eligible: boolean;
  candidateAttempted: boolean;
  candidateAccepted: boolean;
  fallbackState: 'not_attempted' | 'candidate_primary' | 'candidate_failed';
  reason: string;
  durationMs: number;
  provider: string | null;
  model: string | null;
  totalTokens: number | null;
  reportedCost: number | null;
};

const shadowEnabled = () => process.env.PRISM_SHADOW_MODE === 'true';
const candidateUrl = () => process.env.PRISM_SHADOW_CANDIDATE_URL?.trim() || '';
const maxChars = () => Math.max(1000, Number.parseInt(process.env.PRISM_SHADOW_MAX_CHARS ?? '12000', 10) || 12000);
const timeoutMs = () => Math.min(15_000, Math.max(500, Number.parseInt(process.env.PRISM_SHADOW_TIMEOUT_MS ?? '8000', 10) || 8000));
const maxOutputTokens = () => Math.min(2048, Math.max(1, Number.parseInt(process.env.PRISM_SHADOW_MAX_OUTPUT_TOKENS ?? '512', 10) || 512));
const maxCostUsd = () => Math.max(0, Number.parseFloat(process.env.PRISM_SHADOW_MAX_COST_USD ?? '0') || 0);

function allowlisted(userId: string) {
  const configured = (process.env.PRISM_SHADOW_USER_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return configured.length > 0 && configured.includes(userId);
}

function approvedFixture(text: string, syntheticToken: string | null | undefined) {
  const configuredToken = process.env.PRISM_SHADOW_SYNTHETIC_TOKEN?.trim();
  const configuredHashes = (process.env.PRISM_SHADOW_FIXTURE_SHA256 || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (!configuredToken || !syntheticToken || syntheticToken !== configuredToken || configuredHashes.length === 0) return false;
  const digest = createHash('sha256').update(text, 'utf8').digest('hex');
  return configuredHashes.includes(digest);
}

const emptyTelemetry = (reason: string, enabled = shadowEnabled()): ShadowTelemetry => ({
  enabled,
  eligible: false,
  candidateAttempted: false,
  candidateAccepted: false,
  fallbackState: 'not_attempted',
  reason,
  durationMs: 0,
  provider: null,
  model: null,
  totalTokens: null,
  reportedCost: null,
});

export async function runShadowProbe(input: ShadowInput): Promise<ShadowTelemetry> {
  try {
    if (!shadowEnabled()) return emptyTelemetry('disabled');
    if (!input.userId) return emptyTelemetry('no_authenticated_user');
    if (!allowlisted(input.userId)) return emptyTelemetry('user_not_allowlisted');
    if (!approvedFixture(input.text, input.syntheticToken)) return emptyTelemetry('synthetic_fixture_not_approved');
    if (input.text.length > maxChars()) return emptyTelemetry('input_over_shadow_limit');
    const url = candidateUrl();
    const budget = maxCostUsd();
    const eligibility = shadowEligibility({ enabled: true, userId: input.userId, allowlisted: true, fixtureApproved: true, url, budget });
    if (!eligibility.eligible) return emptyTelemetry(eligibility.reason);

    const started = Date.now();
    const baseTelemetry = {
      enabled: true,
      eligible: true,
      candidateAttempted: true,
      candidateAccepted: false,
      fallbackState: 'candidate_failed' as const,
      reason: 'candidate_unavailable',
      durationMs: 0,
      provider: null,
      model: null,
      totalTokens: null,
      reportedCost: null,
    } satisfies ShadowTelemetry;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.PRISM_SHADOW_CANDIDATE_TOKEN
            ? { authorization: `Bearer ${process.env.PRISM_SHADOW_CANDIDATE_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          text: input.text,
          goal: input.goal || 'Understand the main point and next action.',
          cognitiveMode: input.cognitiveMode || 'adhd-friendly',
          simplicity: input.simplicityLevel || 'standard',
          maxOutputTokens: maxOutputTokens(),
          budgetUsd: budget,
          baseline: input.baselineUsage || null,
        }),
        signal: AbortSignal.timeout(timeoutMs()),
      });
      const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
      const usage = payload?.usage as Record<string, unknown> | undefined;
      const evaluation = evaluateCandidateResponse({ responseOk: response.ok, payload, maxCostUsd: budget, maxOutputTokens: maxOutputTokens() });
      return {
        ...baseTelemetry,
        candidateAccepted: evaluation.accepted,
        fallbackState: evaluation.fallbackState as ShadowTelemetry['fallbackState'],
        reason: evaluation.reason,
        durationMs: Date.now() - started,
        provider: typeof usage?.provider === 'string' ? usage.provider : null,
        model: typeof usage?.model === 'string' ? usage.model : null,
        totalTokens: evaluation.totalTokens,
        reportedCost: evaluation.reportedCost,
      };
    } catch (error) {
      return {
        ...baseTelemetry,
        reason: error instanceof Error && error.name === 'TimeoutError' ? 'candidate_timeout' : 'candidate_request_failed',
        durationMs: Date.now() - started,
      };
    }
  } catch {
    return emptyTelemetry('shadow_guard_error');
  }
}

export function logShadowTelemetry(telemetry: ShadowTelemetry) {
  // Never include user IDs, document text, prompts, embeddings, or candidate output.
  if (telemetry.enabled && telemetry.eligible) console.info('Prism shadow telemetry', telemetry);
}
