import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { tokenLogger } from '@/lib/tokenLogger';
import { usageFromOpenRouter, type AiUsage, type ProviderPreference } from '@/lib/ai-usage';
import { recordUsage, refundCredits, reserveCredits, type QuotaReservation } from '@/lib/ai-quota';

const geminiKey = process.env.GEMINI_API_KEY;
// Preserve compatibility with the existing deployment variable while preferring the explicit name.
const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.ROUTER_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const deepseekKey = process.env.DEEPSEEK_API_KEY;

export const dynamic = 'force-dynamic';

type ProviderResult = { text: string; usage: AiUsage };

export async function POST(req: Request) {
  let reservation: QuotaReservation | null = null;
  try {
    const { message = '', history = [], data, preferredProvider = 'auto' } = await req.json();
    if (!message.trim()) return NextResponse.json({ error: 'A message is required.' }, { status: 400 });
    const quota = await reserveCredits(req);
    if (!quota.ok) return NextResponse.json({ error: quota.error }, { status: quota.status });
    reservation = quota.reservation;
    const systemInstruction = `You are an ADHD-friendly assistant called "Ask DJ" inside Dassah's Prism. Help the user navigate their Refracted Noise. Be simple, encouraging, and clear. Use bullet points for lists. If asked to do a task based on the document context, perform it fully. Respond only with clean plain text. CONTEXT OF CURRENT REFRACTION: ${JSON.stringify(data)}`;
    const result = await callProvider(message, history, systemInstruction, preferredProvider);
    if (!result.text) {
      await refundCredits(reservation);
      return NextResponse.json({ error: 'Ask DJ is currently unavailable.' }, { status: 500 });
    }
    await recordUsage(reservation, result.usage);
    return NextResponse.json({ text: result.text, usage: result.usage });
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
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${openrouterKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://dassahs-mindbridge.vercel.app', 'X-OpenRouter-Title': "Dassah's Prism" }, body: JSON.stringify({ model, messages, temperature: 0.4 }) });
    if (!response.ok) throw new Error(`OpenRouter returned ${response.status}`);
    const result = await response.json();
    const usage = usageFromOpenRouter(result.usage, result.model || model);
    tokenLogger(usage.model, usage.totalTokens);
    return { text: result.choices?.[0]?.message?.content || '', usage };
  };
  const tryOpenAI = async (): Promise<ProviderResult> => {
    if (!openaiKey) throw new Error('No OpenAI key');
    const model = 'gpt-4o-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages: [{ role: 'system', content: systemInstruction }, ...history.map((item: any) => ({ role: item.role === 'user' ? 'user' : 'assistant', content: item.text })), { role: 'user', content: message }] }) });
    if (!response.ok) throw new Error(`OpenAI returned ${response.status}`);
    const result = await response.json();
    const usage = { provider: 'openai', model, promptTokens: result.usage?.prompt_tokens || 0, completionTokens: result.usage?.completion_tokens || 0, totalTokens: result.usage?.total_tokens || 0 };
    tokenLogger(model, usage.totalTokens);
    return { text: result.choices?.[0]?.message?.content || '', usage };
  };
  const tryAnthropic = async (): Promise<ProviderResult> => {
    if (!anthropicKey) throw new Error('No Anthropic key');
    const model = 'claude-3-5-sonnet-20241022';
    const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }, body: JSON.stringify({ model, max_tokens: 1024, system: systemInstruction, messages: [...history.map((item: any) => ({ role: item.role === 'user' ? 'user' : 'assistant', content: item.text })), { role: 'user', content: message }] }) });
    if (!response.ok) throw new Error(`Anthropic returned ${response.status}`);
    const result = await response.json();
    const usage = { provider: 'anthropic', model, promptTokens: result.usage?.input_tokens || 0, completionTokens: result.usage?.output_tokens || 0, totalTokens: (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0) };
    tokenLogger(model, usage.totalTokens);
    return { text: result.content?.[0]?.text || '', usage };
  };
  const tryDeepSeek = async (): Promise<ProviderResult> => {
    if (!deepseekKey) throw new Error('No DeepSeek key');
    const model = 'deepseek-chat';
    const response = await fetch('https://api.deepseek.com/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${deepseekKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages: [{ role: 'system', content: systemInstruction }, ...history.map((item: any) => ({ role: item.role === 'user' ? 'user' : 'assistant', content: item.text })), { role: 'user', content: message }] }) });
    if (!response.ok) throw new Error(`DeepSeek returned ${response.status}`);
    const result = await response.json();
    const usage = { provider: 'deepseek', model, promptTokens: result.usage?.prompt_tokens || 0, completionTokens: result.usage?.completion_tokens || 0, totalTokens: result.usage?.total_tokens || 0 };
    tokenLogger(model, usage.totalTokens);
    return { text: result.choices?.[0]?.message?.content || '', usage };
  };
  const openRouterModelFor = (provider: ProviderPreference) => ({ gpt: 'openai/gpt-4o-mini', claude: 'anthropic/claude-3.5-sonnet', deepseek: 'deepseek/deepseek-chat' } as Record<string, string>)[provider];
  const model = openRouterModelFor(preferredProvider);
  const providers: (() => Promise<ProviderResult>)[] = preferredProvider === 'openrouter' ? [() => tryOpenRouter(), tryGemini, tryOpenAI, tryAnthropic, tryDeepSeek] : preferredProvider === 'gpt' ? [tryOpenAI, () => tryOpenRouter(model), tryGemini, tryAnthropic, tryDeepSeek] : preferredProvider === 'claude' ? [tryAnthropic, () => tryOpenRouter(model), tryGemini, tryOpenAI, tryDeepSeek] : preferredProvider === 'deepseek' ? [tryDeepSeek, () => tryOpenRouter(model), tryGemini, tryOpenAI, tryAnthropic] : [tryGemini, () => tryOpenRouter(), tryOpenAI, tryAnthropic, tryDeepSeek];
  for (const provider of providers) {
    try { const result = await provider(); if (result.text) return result; } catch (error) { console.error('Chat provider failed:', error); }
  }
  return { text: '', usage: { provider: 'none', model: 'none', promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
}
