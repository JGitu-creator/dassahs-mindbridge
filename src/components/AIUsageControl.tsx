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
  isPaid,
}: {
  preference: ProviderPreference;
  onPreferenceChange: (value: ProviderPreference) => void;
  usage: Usage;
  isPaid: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-glass)] px-2 py-1.5 text-[var(--fg)] shadow-lg backdrop-blur-xl">
      <Sparkles size={14} className="text-blue-400" />
      <select
        aria-label="AI route preference"
        value={preference}
        onChange={(event) => onPreferenceChange(event.target.value as ProviderPreference)}
        className="max-w-[112px] bg-transparent text-[9px] font-black uppercase tracking-wider outline-none"
      >
        <option value="auto">Auto · best fit</option>
        <option value="openrouter">OpenRouter · free first</option>
        <option value="gemini">Gemini · director</option>
        <option value="gpt" disabled={!isPaid}>GPT {isPaid ? '· paid' : '· sign in'}</option>
        <option value="claude" disabled={!isPaid}>Claude {isPaid ? '· paid' : '· sign in'}</option>
        <option value="deepseek" disabled={!isPaid}>DeepSeek {isPaid ? '· paid' : '· sign in'}</option>
      </select>
      <div className="hidden items-center gap-1 border-l border-[var(--color-border)] pl-2 sm:flex" title={`${usage.provider || 'automatic'} · ${usage.model || 'not used yet'}`}>
        <Coins size={12} className="text-amber-400" />
        <span className="text-[9px] font-black tabular-nums">{usage.totalTokens.toLocaleString()} tok</span>
      </div>
    </div>
  );
}
