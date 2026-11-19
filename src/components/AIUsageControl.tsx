'use client';

import { Coins, Sparkles } from 'lucide-react';
import type { ProviderPreference } from '@/lib/ai-usage';

type Usage = {
  totalTokens: number;
  provider: string;
  model: string;
};

export function AIUsageControl({
  usage,
}: {
  preference?: ProviderPreference;
  onPreferenceChange?: (value: ProviderPreference) => void;
  usage: Usage;
}) {
  const isLocalFallback = usage.provider === 'local';
  const providerLabel =
    usage.provider === 'groq'
      ? 'Groq'
      : usage.provider === 'openrouter'
        ? 'OpenRouter'
        : usage.provider === 'gemini'
          ? 'Gemini'
          : isLocalFallback
            ? 'Local'
            : 'Auto';

  const badgeClass = isLocalFallback
    ? 'bg-emerald-500/20 text-emerald-300'
    : usage.provider === 'groq'
      ? 'bg-cyan-500/20 text-cyan-300'
      : 'bg-blue-500/15 text-blue-300';

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-glass)] px-2.5 py-1.5 text-[var(--fg)] shadow-lg backdrop-blur-xl">
      <a
        href="/engine"
        title="Open The Prism Engine Hub (Auto-Cascade: Groq → OpenRouter → Gemini → Local)"
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--fg)] hover:text-blue-400 transition-colors"
      >
        <Sparkles size={14} className={isLocalFallback ? 'text-emerald-400' : 'text-blue-400'} />
        <span className="hidden sm:inline">Prism Engine</span>
        <span className={`rounded px-1.5 py-0.5 text-[8px] font-black uppercase ${badgeClass}`}>
          {providerLabel}
        </span>
      </a>
      <div
        className="flex min-w-0 items-center gap-1 border-l border-[var(--color-border)] pl-2"
        title={isLocalFallback ? 'Unlimited Local Prism used (0 tokens spent)' : `${providerLabel} · ${usage.model || 'auto cascade ready'}`}
      >
        <Coins size={12} className="text-amber-400 shrink-0" />
        <span className="text-[8px] font-black tabular-nums sm:text-[9px]">
          {usage.totalTokens.toLocaleString()} <span className="hidden sm:inline">tokens</span><span className="sm:hidden">tok</span>
        </span>
      </div>
    </div>
  );
}
