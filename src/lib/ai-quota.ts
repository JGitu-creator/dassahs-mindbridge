import { createServiceClient } from '@/lib/supabase-server';
import type { AiUsage } from '@/lib/ai-usage';

export type QuotaReservation = {
  enabled: boolean;
  userId?: string;
  amount: number;
};

export type QuotaResult =
  | { ok: true; reservation: QuotaReservation; balance?: number }
  | { ok: false; status: number; error: string };

const isEnabled = () => process.env.PRISM_ENFORCE_USER_CREDITS === 'true';
const requestCost = () => Math.max(1, Number.parseInt(process.env.PRISM_CREDITS_PER_REQUEST ?? '10', 10) || 10);

async function getUserId(req: Request): Promise<string | null> {
  const token = req.headers.get('cookie')?.match(/(?:^|;\s*)sb-access-token=([^;]+)/)?.[1];
  if (!token) return null;
  const { data, error } = await createServiceClient().auth.getUser(token);
  return error || !data.user ? null : data.user.id;
}

export async function reserveCredits(req: Request): Promise<QuotaResult> {
  if (!isEnabled()) return { ok: true, reservation: { enabled: false, amount: 0 } };
  const userId = await getUserId(req);
  if (!userId) {
    return { ok: false, status: 401, error: 'Please sign in before using the fair-use AI allowance.' };
  }
  const amount = requestCost();
  const { data, error } = await createServiceClient().rpc('deduct_credits', { p_user_id: userId, p_amount: amount });
  if (error) {
    if (error.message.includes('insufficient_credits')) {
      return { ok: false, status: 402, error: 'Your daily Prism allowance is used. Please try again tomorrow or add credits when paid plans are enabled.' };
    }
    console.error('Quota reservation failed:', error.message);
    return { ok: false, status: 503, error: 'The fair-use allowance is temporarily unavailable. Please try again shortly.' };
  }
  return { ok: true, reservation: { enabled: true, userId, amount }, balance: Number(data ?? 0) };
}

export async function refundCredits(reservation: QuotaReservation | null) {
  if (!reservation?.enabled || !reservation.userId) return;
  const { error } = await createServiceClient().rpc('refund_credits', { p_user_id: reservation.userId, p_amount: reservation.amount });
  if (error) console.error('Quota refund failed:', error.message);
}

export async function recordUsage(reservation: QuotaReservation | null, usage: AiUsage) {
  if (!reservation?.enabled || !reservation.userId || !usage.totalTokens) return;
  const { error } = await createServiceClient().rpc('record_ai_usage', {
    p_user_id: reservation.userId,
    p_provider: usage.provider,
    p_model: usage.model,
    p_prompt_tokens: usage.promptTokens,
    p_completion_tokens: usage.completionTokens,
    p_total_tokens: usage.totalTokens,
  });
  if (error) console.error('Usage record failed:', error.message);
}
