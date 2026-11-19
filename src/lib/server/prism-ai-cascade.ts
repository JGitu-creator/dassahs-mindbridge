import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { tokenLogger } from '../tokenLogger';
import { getOpenRouterChatCompletionsUrl } from './openrouter';
import {
  emptyUsage,
  usageFromGroq,
  usageFromOpenRouter,
  type AiUsage,
  type ProviderPreference,
} from '../ai-usage';

export type ProviderResult = { text: string; usage: AiUsage };
export type ImageInput = { data: string; mimeType: string };
export type ChatTurn = { role: string; text: string };

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const GROQ_FALLBACK_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
] as const;

export const OPENROUTER_FREE_FALLBACK_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-chat:free',
  'openrouter/free',
] as const;

export function getGroqModelList(): string[] {
  const configured = process.env.GROQ_MODEL?.trim();
  return Array.from(new Set([
    ...(configured ? [configured] : []),
    ...GROQ_FALLBACK_MODELS,
  ]));
}

export function getOpenRouterModelList(explicitModel?: string): string[] {
  const configured = process.env.OPENROUTER_MODEL?.trim();
  return Array.from(new Set([
    ...(explicitModel ? [explicitModel] : []),
    ...(configured ? [configured] : []),
    ...OPENROUTER_FREE_FALLBACK_MODELS,
  ]));
}

export function providerErrorCategory(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  if (message.includes('key_missing') || message.includes('no groq') || message.includes('no gemini') || message.includes('no openrouter')) return 'key_missing';
  if (/401|403|unauthori|forbidden|api key|permission/.test(message)) return 'key_or_permission';
  if (/404|not found|model/.test(message)) return 'model_unavailable';
  if (/429|quota|rate limit|resource exhausted/.test(message)) return 'quota_or_rate_limit';
  if (/timeout|timed out|abort/.test(message)) return 'timeout';
  return 'provider_error';
}

async function runGroqChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  temperature: number,
): Promise<ProviderResult> {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (!groqKey) throw new Error('groq_key_missing');

  let lastError: unknown = new Error('groq_unavailable');
  for (const model of getGroqModelList()) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        signal: AbortSignal.timeout(20000),
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages, temperature }),
      });
      if (!response.ok) throw new Error(`Groq returned ${response.status} for ${model}`);
      const data = await response.json();
      const text = String(data?.choices?.[0]?.message?.content || '').trim();
      if (!text) throw new Error(`Groq returned empty text for ${model}`);
      const usage = usageFromGroq(data?.usage, data?.model || model);
      tokenLogger(usage.model, usage.totalTokens);
      return { text, usage };
    } catch (err) {
      lastError = err;
      console.warn('[PrismEngine] groq_model_failed', { model, reason: providerErrorCategory(err) });
    }
  }
  throw lastError;
}

async function runOpenRouterChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: unknown }>,
  temperature: number,
  explicitModel?: string,
): Promise<ProviderResult> {
  const openrouterKey = (process.env.OPENROUTER_API_KEY || process.env.ROUTER_API_KEY)?.trim();
  if (!openrouterKey) throw new Error('openrouter_key_missing');

  let lastError: unknown = new Error('openrouter_unavailable');
  for (const model of getOpenRouterModelList(explicitModel)) {
    try {
      const response = await fetch(getOpenRouterChatCompletionsUrl(), {
        method: 'POST',
        signal: AbortSignal.timeout(25000),
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://dassahs-prism.vercel.app',
          'X-OpenRouter-Title': "Dassah's Prism",
        },
        body: JSON.stringify({ model, messages, temperature }),
      });
      if (!response.ok) throw new Error(`OpenRouter returned ${response.status} for ${model}`);
      const data = await response.json();
      const text = String(data?.choices?.[0]?.message?.content || '').trim();
      if (!text) throw new Error(`OpenRouter returned empty text for ${model}`);
      const usage = usageFromOpenRouter(data?.usage, data?.model || model);
      tokenLogger(usage.model, usage.totalTokens);
      return { text, usage };
    } catch (err) {
      lastError = err;
      console.warn('[PrismEngine] openrouter_model_failed', { model, reason: providerErrorCategory(err) });
    }
  }
  throw lastError;
}

async function runGeminiSingle(prompt: string, image?: ImageInput): Promise<ProviderResult> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (!geminiKey) throw new Error('gemini_key_missing');
  const model = 'gemini-2.0-flash';
  const content = image
    ? [{ text: prompt }, { inlineData: { data: image.data, mimeType: image.mimeType } }]
    : prompt;
  const result = await Promise.race([
    new GoogleGenerativeAI(geminiKey).getGenerativeModel({ model }).generateContent(content),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Gemini request timed out')), 25000)),
  ]);
  const metadata = result.response.usageMetadata as {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  } | undefined;
  const promptTokens = Number(metadata?.promptTokenCount || 0);
  const completionTokens = Number(metadata?.candidatesTokenCount || 0);
  const usage: AiUsage = {
    provider: 'gemini',
    model,
    promptTokens,
    completionTokens,
    totalTokens: Number(metadata?.totalTokenCount || promptTokens + completionTokens),
  };
  tokenLogger(model, usage.totalTokens);
  return { text: result.response.text(), usage };
}

async function runGeminiChat(
  message: string,
  history: ChatTurn[],
  systemInstruction: string,
): Promise<ProviderResult> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (!geminiKey) throw new Error('gemini_key_missing');
  const model = 'gemini-2.0-flash';
  const chat = new GoogleGenerativeAI(geminiKey).getGenerativeModel({
    model,
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  }).startChat({
    history: history.map((item) => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }],
    })),
    systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
  });
  const response = await (await chat.sendMessage(message)).response;
  const metadata = response.usageMetadata as {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  } | undefined;
  const promptTokens = Number(metadata?.promptTokenCount || 0);
  const completionTokens = Number(metadata?.candidatesTokenCount || 0);
  const usage: AiUsage = {
    provider: 'gemini',
    model,
    promptTokens,
    completionTokens,
    totalTokens: Number(metadata?.totalTokenCount || promptTokens + completionTokens),
  };
  tokenLogger(model, usage.totalTokens);
  return { text: response.text(), usage };
}

function explicitOpenRouterModel(provider: ProviderPreference): string | undefined {
  const map: Record<string, string> = {
    gpt: 'openai/gpt-4o-mini',
    claude: 'anthropic/claude-3.5-sonnet',
    deepseek: 'deepseek/deepseek-chat:free',
  };
  return map[provider];
}

/**
 * Unified 4-Tier Prism Engine Cascade for single-prompt refractions & Prism Lens lookups:
 * Tier 1: Groq LPU (blazing fast, free tier)
 * Tier 2: OpenRouter free multi-model cascade
 * Tier 3: Google Gemini 2.0 Flash
 * (Tier 4: Caller falls back cleanly to Unlimited Local Prism — 0 tokens, 100% uptime)
 */
export async function callPrismCompletion(
  prompt: string,
  preferredProvider: ProviderPreference = 'auto',
  image?: ImageInput,
): Promise<ProviderResult> {
  const tryGroq = () => runGroqChat([{ role: 'user', content: prompt }], 0.2);
  const tryOpenRouter = (explicitModel?: string) => {
    const content = image
      ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: `data:${image.mimeType};base64,${image.data}` } }]
      : prompt;
    return runOpenRouterChat([{ role: 'user', content }], 0.2, explicitModel);
  };
  const tryGemini = () => runGeminiSingle(prompt, image);

  const namedOpenRouter = explicitOpenRouterModel(preferredProvider);
  let providers: Array<{ name: string; run: () => Promise<ProviderResult> }>;

  if (image) {
    // Vision requests use Gemini & OpenRouter (Groq text models don't accept base64 images)
    providers = preferredProvider === 'openrouter' || namedOpenRouter
      ? [{ name: 'openrouter', run: () => tryOpenRouter(namedOpenRouter) }, { name: 'gemini', run: tryGemini }]
      : [{ name: 'gemini', run: tryGemini }, { name: 'openrouter', run: () => tryOpenRouter() }];
  } else if (preferredProvider === 'gemini') {
    providers = [
      { name: 'gemini', run: tryGemini },
      { name: 'groq', run: tryGroq },
      { name: 'openrouter', run: () => tryOpenRouter() },
    ];
  } else if (preferredProvider === 'openrouter' || namedOpenRouter) {
    providers = [
      { name: 'openrouter', run: () => tryOpenRouter(namedOpenRouter) },
      { name: 'groq', run: tryGroq },
      { name: 'gemini', run: tryGemini },
    ];
  } else {
    // Default 'auto' and 'groq': Groq -> OpenRouter free cascade -> Gemini
    providers = [
      { name: 'groq', run: tryGroq },
      { name: 'openrouter', run: () => tryOpenRouter() },
      { name: 'gemini', run: tryGemini },
    ];
  }

  for (const provider of providers) {
    try {
      const result = await provider.run();
      if (result.text) return result;
    } catch (error) {
      console.warn('[PrismEngine] completion_provider_failed', {
        provider: provider.name,
        reason: providerErrorCategory(error),
      });
    }
  }
  return { text: '', usage: emptyUsage('local', 'local-fallback') };
}

/**
 * Unified 4-Tier Prism Engine Cascade for Ask DJ conversational chat.
 */
export async function callPrismChat(
  message: string,
  history: ChatTurn[],
  systemInstruction: string,
  preferredProvider: ProviderPreference = 'auto',
): Promise<ProviderResult> {
  const openAiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemInstruction },
    ...history.map((item) => ({
      role: (item.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: item.text,
    })),
    { role: 'user', content: message },
  ];

  const tryGroq = () => runGroqChat(openAiMessages, 0.4);
  const tryOpenRouter = (explicitModel?: string) => runOpenRouterChat(openAiMessages, 0.4, explicitModel);
  const tryGemini = () => runGeminiChat(message, history, systemInstruction);

  const namedOpenRouter = explicitOpenRouterModel(preferredProvider);
  let providers: Array<{ name: string; run: () => Promise<ProviderResult> }>;

  if (preferredProvider === 'gemini') {
    providers = [
      { name: 'gemini', run: tryGemini },
      { name: 'groq', run: tryGroq },
      { name: 'openrouter', run: () => tryOpenRouter() },
    ];
  } else if (preferredProvider === 'openrouter' || namedOpenRouter) {
    providers = [
      { name: 'openrouter', run: () => tryOpenRouter(namedOpenRouter) },
      { name: 'groq', run: tryGroq },
      { name: 'gemini', run: tryGemini },
    ];
  } else {
    providers = [
      { name: 'groq', run: tryGroq },
      { name: 'openrouter', run: () => tryOpenRouter() },
      { name: 'gemini', run: tryGemini },
    ];
  }

  for (const provider of providers) {
    try {
      const result = await provider.run();
      if (result.text) return result;
    } catch (error) {
      console.warn('[PrismEngine] chat_provider_failed', {
        provider: provider.name,
        reason: providerErrorCategory(error),
      });
    }
  }
  return { text: '', usage: emptyUsage('local', 'local-ask-dj') };
}

/**
 * Tier 4 Guaranteed Offline/Zero-Key Ask DJ Fallback:
 * Extracts the most relevant lines from the current reading/refraction context
 * so Ask DJ always answers helpfully even when every external API is offline.
 */
export function createLocalChatReply(question: string, rawContext: unknown): string {
  const contextText = typeof rawContext === 'string'
    ? rawContext
    : rawContext
      ? JSON.stringify(rawContext)
      : '';

  const cleanContext = contextText
    .replace(/[{}"[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanContext) {
    return 'Instant Local DJ: I am running in offline fallback mode right now. Focus on one small takeaway from your current card, or try again once a cloud AI key (Groq, OpenRouter, or Gemini) is active.';
  }

  const keywords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !['what', 'does', 'mean', 'this', 'that', 'with', 'from', 'about', 'explain', 'simple', 'short'].includes(w));

  const sentences = cleanContext
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const scored = sentences
    .map((sentence) => {
      const lower = sentence.toLowerCase();
      const score = keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
      return { sentence, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.sentence || cleanContext.slice(0, 220);
  const clipped = best.length > 240 ? `${best.slice(0, 237)}...` : best;

  return `Instant Local DJ (Zero-API Fallback): Based on your current reading — "${clipped}" Break that idea into one tiny example in your own words to lock it in!`;
}
