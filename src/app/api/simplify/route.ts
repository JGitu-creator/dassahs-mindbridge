import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { tokenLogger } from '@/lib/tokenLogger';
import { emptyUsage, mergeUsage, usageFromOpenRouter, type AiUsage, type ProviderPreference } from '@/lib/ai-usage';
import { recordUsage, refundCredits, reserveCredits, type QuotaReservation } from '@/lib/ai-quota';

const apiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const deepseekKey = process.env.DEEPSEEK_API_KEY;
// Preserve compatibility with the existing deployment variable while preferring the explicit name.
const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.ROUTER_API_KEY;
const openrouterModel = process.env.OPENROUTER_MODEL || 'openrouter/free';

export const dynamic = 'force-dynamic';

type ProviderResult = { text: string; usage: AiUsage };
type ImageInput = { data: string; mimeType: string };

export async function POST(req: Request) {
  let reservation: QuotaReservation | null = null;
  try {
    const {
      text = '', mode, question, context, isScenic, cognitiveMode, missionGoal,
      isStory, simplicityLevel, preferredProvider = 'auto', imageData, imageMimeType,
    } = await req.json();
    const absoluteMaxChars = 150000;
    const chunkSize = 25000;

    if (text.length > absoluteMaxChars) {
      return NextResponse.json({ error: 'Neural Link Overload: Document exceeds maximum sovereign bandwidth (150k chars). Please split your noise into smaller volumes.' }, { status: 413 });
    }
    const image = typeof imageData === 'string' && imageData.length <= 14_000_000 && typeof imageMimeType === 'string' && /^image\/(png|jpeg|jpg|webp|gif)$/i.test(imageMimeType)
      ? { data: imageData.replace(/^data:image\/[^;]+;base64,/, ''), mimeType: imageMimeType } satisfies ImageInput
      : undefined;
    if (!text && !image && mode !== 'chat') return NextResponse.json({ error: 'Valid text or image input is required.' }, { status: 400 });
    const quota = await reserveCredits(req);
    if (!quota.ok) return NextResponse.json({ error: quota.error }, { status: quota.status });
    reservation = quota.reservation;

    if (mode === 'chat') {
      const chatPrompt = `You are "Ask DJ," a Sovereign Guide. Answer the following question based on the context provided.\n\nContext: ${context}\n\nQuestion: ${question}`;
      const result = await callProvider(chatPrompt, preferredProvider, image);
      return NextResponse.json({ answer: result.text, usage: result.usage });
    }

    const chunksOfText: string[] = [];
    if (image) chunksOfText.push('Image input');
    else for (let i = 0; i < text.length; i += chunkSize) chunksOfText.push(text.substring(i, i + chunkSize));
    const settledResults = await Promise.allSettled(chunksOfText.map(async (chunkText) => {
      const generationPrompt = `
        You are "Ask DJ," a Sovereign Guide. Your mission is to perform a Deep Neural Refraction on the provided Noise.
        GOAL: ${missionGoal || 'Discovery'}
        TARGET COGNITIVE MODE: ${cognitiveMode}
        SIMPLICITY LEVEL: ${simplicityLevel || 'Standard'}
        ${isScenic ? 'Use a vivid, memorable metaphor where helpful.' : ''}
        ${isStory ? 'Preserve the narrative arc while keeping the facts clear.' : ''}

        Perform a silent analysis to identify Signal vs Noise, Logic Roots, Dopamine Hooks, and Structural Anchors.
        Output ONLY a valid JSON object with this structure:
        {
          "tldr": ["string"], "whyCare": "string", "readingTime": "string",
          "chunks": [{"heading":"string","content":"string","summary":"string","keyTerms":["string"],"metaphor":"string","dopamineHook":"string","logicRoot":"string","citations":"string"}],
          "actions": [{"task":"string","priority":"high"|"medium"|"low","estimatedMinutes":"number"}], "chartData": null
        }
        INPUT NOISE:\n${chunkText}
      `;
      const result = await callProvider(generationPrompt, preferredProvider, image);
      if (!result.text) throw new Error('No response from providers');
      return { data: extractJSON(result.text), usage: result.usage };
    }));

    const refractionResults = settledResults.filter((res): res is PromiseFulfilledResult<{ data: any; usage: AiUsage }> => res.status === 'fulfilled').map(res => res.value);
    const usage = mergeUsage(refractionResults.map(result => result.usage));
    if (refractionResults.length === 0) {
      const local = createLocalRefraction(text, simplicityLevel, cognitiveMode);
      await refundCredits(reservation);
      return NextResponse.json({ ...local, usage: { provider: 'local', model: 'structural-refraction', promptTokens: 0, completionTokens: 0, totalTokens: 0 } }, { status: 200 });
    }

    const mergedData = { tldr: [] as string[], whyCare: refractionResults[0]?.data?.whyCare || 'Focus was interrupted.', readingTime: `${Math.round(text.split(/\s+/).length / 200)}m`, chunks: [] as any[], actions: [] as any[], chartData: null as any };
    refractionResults.forEach(({ data: result }) => {
      if (result.tldr) mergedData.tldr.push(...result.tldr);
      if (result.chunks) mergedData.chunks.push(...result.chunks);
      if (result.actions) mergedData.actions.push(...result.actions);
      if (result.chartData) mergedData.chartData = result.chartData;
    });
    mergedData.tldr = [...new Set(mergedData.tldr)].slice(0, 6);
    mergedData.actions = Array.from(new Map(mergedData.actions.map(action => [action.task, action])).values());
    await recordUsage(reservation, usage);
    return NextResponse.json({
      tldr: mergedData.tldr.length ? mergedData.tldr : ['No summary generated'], whyCare: mergedData.whyCare, readingTime: mergedData.readingTime,
      chunks: mergedData.chunks.map(chunk => ({ heading: chunk.heading || 'Neural Fragment', content: chunk.content || '', summary: chunk.summary || 'Segment analyzed.', keyTerms: chunk.keyTerms || [], metaphor: chunk.metaphor || '', dopamineHook: chunk.dopamineHook || '', logicRoot: chunk.logicRoot || 'Foundational principle established.', citations: chunk.citations || 'Contextual anchor secured.' })),
      actions: mergedData.actions, chartData: mergedData.chartData, usage,
    });
  } catch (error: any) {
    await refundCredits(reservation);
    return NextResponse.json({ error: error.message || 'The Neural Engine is unavailable.' }, { status: 500 });
  }
}

async function callProvider(prompt: string, preferredProvider: ProviderPreference = 'auto', image?: ImageInput): Promise<ProviderResult> {
  const tryGemini = async (): Promise<ProviderResult> => {
    if (!apiKey) throw new Error('No Gemini Key');
    const model = 'gemini-2.0-flash';
    const content = image ? [{ text: prompt }, { inlineData: { data: image.data, mimeType: image.mimeType } }] : prompt;
    const result = await new GoogleGenerativeAI(apiKey).getGenerativeModel({ model }).generateContent(content);
    const metadata: any = result.response.usageMetadata;
    const promptTokens = Number(metadata?.promptTokenCount || 0);
    const completionTokens = Number(metadata?.candidatesTokenCount || 0);
    const usage = { provider: 'gemini', model, promptTokens, completionTokens, totalTokens: Number(metadata?.totalTokenCount || promptTokens + completionTokens) };
    tokenLogger(model, usage.totalTokens);
    return { text: result.response.text(), usage };
  };
  const tryOpenRouter = async (model = openrouterModel): Promise<ProviderResult> => {
    if (!openrouterKey) throw new Error('No OpenRouter Key');
    const content = image ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: `data:${image.mimeType};base64,${image.data}` } }] : prompt;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${openrouterKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://dassahs-mindbridge.vercel.app', 'X-OpenRouter-Title': "Dassah's Prism" }, body: JSON.stringify({ model, messages: [{ role: 'user', content }], temperature: 0.2 }) });
    if (!response.ok) throw new Error(`OpenRouter returned ${response.status}`);
    const data = await response.json();
    const usage = usageFromOpenRouter(data.usage, data.model || model);
    tokenLogger(usage.model, usage.totalTokens);
    return { text: data.choices?.[0]?.message?.content || '', usage };
  };
  const tryOpenAI = async (): Promise<ProviderResult> => {
    if (!openaiKey) throw new Error('No OpenAI Key');
    const model = 'gpt-4o-mini';
    const completion = await new OpenAI({ apiKey: openaiKey }).chat.completions.create({ model, messages: [{ role: 'user', content: prompt }] });
    const usage = { provider: 'openai', model, promptTokens: completion.usage?.prompt_tokens || 0, completionTokens: completion.usage?.completion_tokens || 0, totalTokens: completion.usage?.total_tokens || 0 };
    tokenLogger(model, usage.totalTokens);
    return { text: completion.choices[0].message.content || '', usage };
  };
  const tryAnthropic = async (): Promise<ProviderResult> => {
    if (!anthropicKey) throw new Error('No Anthropic Key');
    const model = 'claude-3-5-sonnet-20241022';
    const msg = await new Anthropic({ apiKey: anthropicKey }).messages.create({ model, max_tokens: 2048, messages: [{ role: 'user', content: prompt }] });
    const usage = { provider: 'anthropic', model, promptTokens: msg.usage.input_tokens, completionTokens: msg.usage.output_tokens, totalTokens: msg.usage.input_tokens + msg.usage.output_tokens };
    tokenLogger(model, usage.totalTokens);
    return { text: (msg.content[0] as any).text, usage };
  };
  const tryDeepSeek = async (): Promise<ProviderResult> => {
    if (!deepseekKey) throw new Error('No DeepSeek Key');
    const model = 'deepseek-chat';
    const response = await fetch('https://api.deepseek.com/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${deepseekKey}` }, body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }) });
    if (!response.ok) throw new Error(`DeepSeek returned ${response.status}`);
    const data = await response.json();
    const usage = { provider: 'deepseek', model, promptTokens: data.usage?.prompt_tokens || 0, completionTokens: data.usage?.completion_tokens || 0, totalTokens: data.usage?.total_tokens || 0 };
    tokenLogger(model, usage.totalTokens);
    return { text: data.choices?.[0]?.message?.content || '', usage };
  };

  const openRouterModelFor = (provider: ProviderPreference) => ({ gpt: 'openai/gpt-4o-mini', claude: 'anthropic/claude-3.5-sonnet', deepseek: 'deepseek/deepseek-chat' } as Record<string, string>)[provider];
  const openRouterChoice = openRouterModelFor(preferredProvider);
  const providers: (() => Promise<ProviderResult>)[] = preferredProvider === 'openrouter'
    ? [() => tryOpenRouter(), tryGemini, tryOpenAI, tryAnthropic, tryDeepSeek]
    : preferredProvider === 'gpt'
      ? [tryOpenAI, () => tryOpenRouter(openRouterChoice), tryGemini, tryAnthropic, tryDeepSeek]
      : preferredProvider === 'claude'
        ? [tryAnthropic, () => tryOpenRouter(openRouterChoice), tryGemini, tryOpenAI, tryDeepSeek]
        : preferredProvider === 'deepseek'
          ? [tryDeepSeek, () => tryOpenRouter(openRouterChoice), tryGemini, tryOpenAI, tryAnthropic]
          : [tryGemini, () => tryOpenRouter(), tryOpenAI, tryAnthropic, tryDeepSeek];
  for (const provider of providers) {
    try { const result = await provider(); if (result.text) return result; } catch (error) { console.error('Provider failed:', error); }
  }
  return { text: '', usage: emptyUsage() };
}

const extractJSON = (text: string) => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('The Neural Engine produced a malformed refraction. Please try again.');
  return JSON.parse(text.slice(start, end + 1));
};

const createLocalRefraction = (text: string, level = 'standard', cognitiveMode = 'adhd') => {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const words = text.match(/[A-Za-z][A-Za-z'-]*/g) || [];
  const keyTerms = Array.from(new Set(words.filter(word => word.length > 4).map(word => word.toLowerCase()))).slice(0, 6);
  const lead = sentences[0] || text.slice(0, 240);
  const detail = level === 'concise' ? 'Keep only the next essential step.' : level === 'detailed' ? 'Break the idea into smaller parts and check each part before moving on.' : 'Find the main point first, then take one clear next step.';
  return {
    tldr: [lead.slice(0, 180)],
    whyCare: `This ${cognitiveMode === 'ceo' ? 'decision or document' : 'piece of information'} becomes easier to act on when the main signal is separated from the surrounding noise.`,
    readingTime: `${Math.max(1, Math.round(words.length / 200))}m`,
    chunks: [{
      heading: 'Local Structural Refraction',
      content: text.slice(0, 1200),
      summary: detail,
      keyTerms,
      metaphor: 'Think of this as a tangled set of earphones: find the one visible end, then loosen one knot at a time.',
      dopamineHook: 'You do not need to solve the whole document now—complete the next small move and let momentum do the rest.',
      logicRoot: `Core signal: ${lead.slice(0, 220)}`,
      citations: 'Generated locally from the supplied text while external AI providers are unavailable.',
    }],
    actions: [{ task: detail, priority: 'high', estimatedMinutes: '5' }],
    chartData: null,
  };
};
