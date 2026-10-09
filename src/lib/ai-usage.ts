export type ProviderPreference = 'auto' | 'openrouter' | 'gemini' | 'gpt' | 'claude' | 'deepseek';

export type AiUsage = {
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export const emptyUsage = (provider = 'unknown', model = 'unknown'): AiUsage => ({
  provider,
  model,
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
});

export const mergeUsage = (items: AiUsage[]): AiUsage => items.reduce<AiUsage>((total, item) => ({
  provider: item.provider || total.provider,
  model: item.model || total.model,
  promptTokens: total.promptTokens + (item.promptTokens || 0),
  completionTokens: total.completionTokens + (item.completionTokens || 0),
  totalTokens: total.totalTokens + (item.totalTokens || 0),
}), emptyUsage());

export const usageFromOpenRouter = (usage: Record<string, unknown> | undefined, model: string): AiUsage => {
  const promptTokens = Number(usage?.prompt_tokens || usage?.input_tokens || 0);
  const completionTokens = Number(usage?.completion_tokens || usage?.output_tokens || 0);
  return {
    provider: 'openrouter',
    model,
    promptTokens,
    completionTokens,
    totalTokens: Number(usage?.total_tokens || promptTokens + completionTokens),
  };
};
