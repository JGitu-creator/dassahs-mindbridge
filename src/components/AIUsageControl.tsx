'use client';

import { Coins, Sparkles } from 'lucide-react';
import type { ProviderPreference } from '@/lib/ai-usage';

type Usage = {
  totalTokens: number;
  provider: string;
  model: string;
};

export function AIUsageControl({
  preference,
  onPreferenceChange,
  usage,
}: {
  preference: ProviderPreference;
  onPreferenceChange: (value: ProviderPreference) => void;
  usage: Usage;
}) {
  const isLocalFallback = usage.provider === 'local';
  const providerLabel = isLocalFallback
    ? 'Local'
    : usage.provider === 'gemini'
      ? 'Gemini'
      : usage.provider === 'openrouter'
        ? 'Router'
        : '';

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-glass)] px-2 py-1.5 text-[var(--fg)] shadow-lg backdrop-blur-xl">
      <Sparkles size={14} className={isLocalFallback ? 'text-amber-400' : 'text-blue-400'} />
      <select
        aria-label="AI route preference"
        value={preference}
        onChange={(event) => onPreferenceChange(event.target.value as ProviderPreference)}
        className="max-w-[100px] sm:max-w-[136px] cursor-pointer truncate bg-transparent text-[10px] font-black uppercase tracking-wider text-[var(--fg)] outline-none"
      >
        <option value="auto" className="bg-[var(--bg)] text-[var(--fg)]">Auto · best fit</option>
        <option value="openrouter" className="bg-[var(--bg)] text-[var(--fg)]">OpenRouter · free models</option>
        <option value="gemini" className="bg-[var(--bg)] text-[var(--fg)]">Gemini · director</option>
      </select>
      <div
        className="flex min-w-0 items-center gap-1 border-l border-[var(--color-border)] pl-2"
        title={isLocalFallback ? 'Local structural fallback used (0 credits spent)' : `${usage.provider || 'automatic'} · ${usage.model || 'not used yet'}`}
      >
        <Coins size={12} className="text-amber-400 shrink-0" />
        <span className="text-[8px] font-black tabular-nums sm:text-[9px]">
          {usage.totalTokens.toLocaleString()} <span className="hidden sm:inline">tokens</span><span className="sm:hidden">tok</span>
        </span>
        {providerLabel && (
          <span className={`hidden sm:inline rounded px-1 py-0.5 text-[8px] font-bold uppercase ${isLocalFallback ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/15 text-blue-300'}`}>
            {providerLabel}
          </span>
        )}
      </div>
    </div>
  );
}
