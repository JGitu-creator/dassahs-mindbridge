import type { AiUsage } from '@/lib/ai-usage';

type ShadowInput = {
  userId?: string;
  text: string;
  goal?: string;
  cognitiveMode?: string;
  simplicityLevel?: string;
  baselineUsage?: AiUsage;
};

type ShadowTelemetry = {
  enabled: boolean;
  eligible: boolean;
  candidateAttempted: boolean;
  candidateAccepted: boolean;
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

function allowlisted(userId: string) {
  const configured = (process.env.PRISM_SHADOW_USER_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return configured.length > 0 && configured.includes(userId);
}

const emptyTelemetry = (reason: string, enabled = shadowEnabled()): ShadowTelemetry => ({
  enabled,
  eligible: false,
  candidateAttempted: false,
  candidateAccepted: false,
  reason,
  durationMs: 0,
  provider: null,
  model: null,
  totalTokens: null,
  reportedCost: null,
});

export async function runShadowProbe(input: ShadowInput): Promise<ShadowTelemetry> {
  if (!shadowEnabled()) return emptyTelemetry('disabled');
  if (!input.userId) return emptyTelemetry('no_authenticated_user');
  if (!allowlisted(input.userId)) return emptyTelemetry('user_not_allowlisted');
  if (input.text.length > maxChars()) return emptyTelemetry('input_over_shadow_limit');
  const url = candidateUrl();
  if (!url || !/^https:\/\//i.test(url)) return emptyTelemetry('candidate_endpoint_not_configured');

  const started = Date.now();
  const baseTelemetry = {
    enabled: true,
    eligible: true,
    candidateAttempted: true,
    candidateAccepted: false,
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
        baseline: input.baselineUsage || null,
      }),
      signal: AbortSignal.timeout(timeoutMs()),
    });
    const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
    const usage = payload?.usage as Record<string, unknown> | undefined;
    return {
      ...baseTelemetry,
      candidateAccepted: response.ok && payload?.ok !== false,
      reason: response.ok ? 'candidate_observed' : 'candidate_http_error',
      durationMs: Date.now() - started,
      provider: typeof usage?.provider === 'string' ? usage.provider : null,
      model: typeof usage?.model === 'string' ? usage.model : null,
      totalTokens: Number.isFinite(Number(usage?.totalTokens)) ? Number(usage?.totalTokens) : null,
      reportedCost: Number.isFinite(Number(usage?.cost)) ? Number(usage?.cost) : null,
    };
  } catch (error) {
    return {
      ...baseTelemetry,
      reason: error instanceof Error && error.name === 'TimeoutError' ? 'candidate_timeout' : 'candidate_request_failed',
      durationMs: Date.now() - started,
    };
  }
}

export function logShadowTelemetry(telemetry: ShadowTelemetry) {
  // Never include user IDs, document text, prompts, embeddings, or candidate output.
  if (telemetry.enabled && telemetry.eligible) console.info('Prism shadow telemetry', telemetry);
}
