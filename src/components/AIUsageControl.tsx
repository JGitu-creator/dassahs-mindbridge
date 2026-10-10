'use client';

import { Coins, Sparkles } from 'lucide-react';

type ProviderPreference = 'auto' | 'openrouter' | 'gemini' | 'gpt' | 'claude' | 'deepseek';

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
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-glass)] px-2 py-1.5 text-[var(--fg)] shadow-lg backdrop-blur-xl">
      <Sparkles size={14} className="text-blue-400" />
      <select
        aria-label="AI route preference"
        value={preference}
        onChange={(event) => onPreferenceChange(event.target.value as ProviderPreference)}
        className="max-w-[76px] sm:max-w-[112px] truncate bg-transparent text-[9px] font-black uppercase tracking-wider outline-none"
      >
        <option value="auto">Auto · best fit</option>
        <option value="openrouter">OpenRouter · free models</option>
        <option value="gemini">Gemini · director</option>
      </select>
      <div className="flex min-w-0 items-center gap-1 border-l border-[var(--color-border)] pl-2" title={`${usage.provider || 'automatic'} · ${usage.model || 'not used yet'}`}>
        <Coins size={12} className="text-amber-400" />
        <span className="text-[8px] font-black tabular-nums sm:text-[9px]">{usage.totalTokens.toLocaleString()} <span className="hidden xs:inline">tokens</span><span className="xs:hidden">tok</span></span>
      </div>
    </div>
  );
}
