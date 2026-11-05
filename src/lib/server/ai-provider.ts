import OpenAI from 'openai';
import { getOpenRouterApiBaseUrl } from '@/lib/server/openrouter';

export type Provider = 'openrouter';

export function getAIClient(provider: Provider): OpenAI {
  // Default: OpenRouter (falls back to the legacy ROUTER_API_KEY so existing deployments keep working)
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY ?? process.env.ROUTER_API_KEY ?? '',
    baseURL: getOpenRouterApiBaseUrl(),
    defaultHeaders: {
      'HTTP-Referer': 'https://dassahs-mindbridge.vercel.app',
      'X-Title': "Dassah's Prism",
    },
  });
}

export function getModelForProvider(provider: Provider): string {
  return 'meta-llama/llama-3.3-70b-instruct:free';
}
