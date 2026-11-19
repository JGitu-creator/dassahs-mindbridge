import { NextResponse } from 'next/server';
import { recordUsage, refundCredits, reserveCredits, type QuotaReservation } from '@/lib/ai-quota';
import {
  callPrismChat,
  createLocalChatReply,
  providerErrorCategory,
} from '@/lib/server/prism-ai-cascade';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let reservation: QuotaReservation | null = null;
  let guestUses: number | null = null;
  try {
    const { message = '', history = [], data, preferredProvider = 'auto' } = await req.json();
    if (!message.trim()) return NextResponse.json({ error: 'A message is required.' }, { status: 400 });
    const quota = await reserveCredits(req);
    if (!quota.ok) return NextResponse.json({ error: quota.error, code: quota.code }, { status: quota.status });
    reservation = quota.reservation;
    guestUses = quota.reservation.guestUses ?? null;
    const respond = (body: unknown, init?: ResponseInit) => {
      const response = NextResponse.json(body, init);
      if (guestUses !== null) {
        response.cookies.set('prism-guest-uses', String(guestUses), {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
      }
      return response;
    };

    const systemInstruction = `You are an ADHD-friendly assistant called "Ask DJ" inside Dassah's Prism. Help the user navigate their Refracted Noise. Be simple, encouraging, and clear. Use bullet points for lists. If asked to do a task based on the document context, perform it fully. Respond only with clean plain text. CONTEXT OF CURRENT REFRACTION: ${JSON.stringify(data)}`;
    const result = await callPrismChat(message, history, systemInstruction, preferredProvider);
    if (!result.text) {
      await refundCredits(reservation);
      return respond({
        text: createLocalChatReply(message, data),
        usage: { provider: 'local', model: 'local-ask-dj', promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        mode: 'local',
      });
    }
    await recordUsage(reservation, result.usage);
    return respond({ text: result.text, usage: result.usage });
  } catch (error) {
    await refundCredits(reservation);
    console.error('[AskDJ] request_failed', { reason: providerErrorCategory(error) });
    return NextResponse.json({ error: 'Ask DJ is currently unavailable.' }, { status: 500 });
  }
}
