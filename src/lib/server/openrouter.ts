const DEFAULT_OPENROUTER_ORIGIN = 'https://openrouter.ai';

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '');
}

/**
 * Returns the OpenRouter regional origin without an API path.
 * OPENROUTER_BASE_URL is preferred; ROUTER_BASE_URL remains supported.
 * Examples: https://us.openrouter.ai or https://eu.openrouter.ai
 */
export function getOpenRouterOrigin(): string {
  const configured = process.env.OPENROUTER_BASE_URL || process.env.ROUTER_BASE_URL;
  return normalizeOrigin(configured || DEFAULT_OPENROUTER_ORIGIN);
}

export function getOpenRouterApiBaseUrl(): string {
  return `${getOpenRouterOrigin()}/api/v1`;
}

export function getOpenRouterChatCompletionsUrl(): string {
  return `${getOpenRouterApiBaseUrl()}/chat/completions`;
}
