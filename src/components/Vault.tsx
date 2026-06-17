import React from 'react';
import { Gem } from 'lucide-react';

export const Vault = () => {
  const artifacts = ['Summary A', 'Summary B'];

  return (
    <div className="bg-[var(--color-glass)] p-6 rounded-[2rem] border border-[var(--color-border)] shadow-2xl">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-4 flex items-center gap-2">
        <Gem size={12} /> Vault of Artifacts
      </p>
      <div className="grid grid-cols-2 gap-3">
        {artifacts.map((a, i) => (
          <div key={i} className="aspect-square bg-white/5 rounded-xl border border-white/5 p-3 text-[10px] text-[var(--fg)] font-bold flex items-center justify-center text-center">
            {a}
          </div>
        ))}
      </div>
    </div>
  );
};
