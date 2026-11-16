import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { tokenLogger } from '@/lib/tokenLogger';
import { getOpenRouterChatCompletionsUrl } from '@/lib/server/openrouter';
import { usageFromOpenRouter, type AiUsage, type ProviderPreference } from '@/lib/ai-usage';
import { recordUsage, refundCredits, reserveCredits, type QuotaReservation } from '@/lib/ai-quota';

const geminiKey = process.env.GEMINI_API_KEY;
// Preserve compatibility with the existing deployment variable while preferring the explicit name.
const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.ROUTER_API_KEY;

export const dynamic = 'force-dynamic';

type ProviderResult = { text: string; usage: AiUsage };

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
    const result = await callProvider(message, history, systemInstruction, preferredProvider);
    if (!result.text) {
      await refundCredits(reservation);
      return respond({ error: 'Ask DJ is currently unavailable.' }, { status: 500 });
    }
    await recordUsage(reservation, result.usage);
    return respond({ text: result.text, usage: result.usage });
  } catch (error) {
    await refundCredits(reservation);
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Ask DJ is currently unavailable.' }, { status: 500 });
  }
}

async function callProvider(message: string, history: any[], systemInstruction: string, preferredProvider: ProviderPreference): Promise<ProviderResult> {
  const tryGemini = async (): Promise<ProviderResult> => {
    if (!geminiKey) throw new Error('No Gemini key');
    const model = 'gemini-2.0-flash';
    const chat = new GoogleGenerativeAI(geminiKey).getGenerativeModel({ model, safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ] }).startChat({ history: history.map((item: any) => ({ role: item.role === 'user' ? 'user' : 'model', parts: [{ text: item.text }] })), systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] } });
    const response = await (await chat.sendMessage(message)).response;
    const metadata: any = response.usageMetadata;
    const promptTokens = Number(metadata?.promptTokenCount || 0);
    const completionTokens = Number(metadata?.candidatesTokenCount || 0);
    const usage = { provider: 'gemini', model, promptTokens, completionTokens, totalTokens: Number(metadata?.totalTokenCount || promptTokens + completionTokens) };
    tokenLogger(model, usage.totalTokens);
    return { text: response.text(), usage };
  };
  const tryOpenRouter = async (model = process.env.OPENROUTER_MODEL || 'openrouter/free'): Promise<ProviderResult> => {
    if (!openrouterKey) throw new Error('No OpenRouter key');
    const messages = [{ role: 'system', content: systemInstruction }, ...history.map((item: any) => ({ role: item.role === 'user' ? 'user' : 'assistant', content: item.text })), { role: 'user', content: message }];
    const response = await fetch(getOpenRouterChatCompletionsUrl(), { method: 'POST', headers: { Authorization: `Bearer ${openrouterKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://dassahs-prism.vercel.app', 'X-OpenRouter-Title': "Dassah's Prism" }, body: JSON.stringify({ model, messages, temperature: 0.4 }) });
    if (!response.ok) throw new Error(`OpenRouter returned ${response.status}`);
    const result = await response.json();
    const usage = usageFromOpenRouter(result.usage, result.model || model);
    tokenLogger(usage.model, usage.totalTokens);
    return { text: result.choices?.[0]?.message?.content || '', usage };
  };
  const openRouterModelFor = (provider: ProviderPreference) => ({ gpt: 'openai/gpt-4o-mini', claude: 'anthropic/claude-3.5-sonnet', deepseek: 'deepseek/deepseek-chat' } as Record<string, string>)[provider];
  const model = openRouterModelFor(preferredProvider);
  const providers: (() => Promise<ProviderResult>)[] =
    preferredProvider === 'openrouter'
      ? [() => tryOpenRouter(), tryGemini]
      : model
        ? [() => tryOpenRouter(model), tryGemini]
        : [tryGemini, () => tryOpenRouter()];
  for (const provider of providers) {
    try { const result = await provider(); if (result.text) return result; } catch (error) { console.error('Chat provider failed:', error); }
  }
  return { text: '', usage: { provider: 'none', model: 'none', promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
}
