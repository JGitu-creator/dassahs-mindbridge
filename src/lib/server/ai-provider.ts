import OpenAI from 'openai';

export type Provider = 'openrouter';

export function getAIClient(provider: Provider): OpenAI {
  // Default: OpenRouter (falls back to the legacy ROUTER_API_KEY so existing deployments keep working)
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY ?? process.env.ROUTER_API_KEY ?? '',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://dassahs-mindbridge.vercel.app',
      'X-Title': "Dassah's Prism",
    },
  });
}

export function getModelForProvider(provider: Provider): string {
  return 'meta-llama/llama-3.3-70b-instruct:free';
}
