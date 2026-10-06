import OpenAI from 'openai';

export type Provider = 'openrouter' | 'abacus';

export function getAIClient(provider: Provider): OpenAI {
  if (provider === 'abacus') {
    return new OpenAI({
      apiKey: process.env.ABACUS_API_KEY ?? '',
      baseURL: process.env.ABACUS_API_BASE_URL ?? 'https://routellm.abacus.ai/v1',
    });
  }
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
  if (provider === 'abacus') {
    return 'claude-3-5-sonnet';
  }
  return 'meta-llama/llama-3.3-70b-instruct:free';
}
