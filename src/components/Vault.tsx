import React from 'react';
import { Gem } from 'lucide-react';

export const Vault = () => {
  const artifacts = ['Summary A', 'Summary B'];

  return (
    <div className="apple-glass p-6 rounded-[2rem] border border-[var(--color-border)] shadow-2xl">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--prism-3)] mb-6 flex items-center gap-2">
        <Gem size={14} /> Vault of Artifacts
      </p>
      <div className="grid grid-cols-2 gap-4">
        {artifacts.map((a, i) => (
          <div key={i} className="aspect-square bg-[var(--color-shadow)] rounded-2xl border border-[var(--color-border)] p-4 text-[9px] text-[var(--fg)] font-black flex items-center justify-center text-center italic tracking-wider hover:border-[var(--prism-3)] transition-all cursor-pointer">
            {a}
          </div>
        ))}
      </div>
    </div>
  );
};
