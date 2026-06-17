import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

export const MissionLog = () => {
  const missions = [
    { title: 'Stabilize 3 chunks', progress: 2, total: 3 },
    { title: 'Simplify 5 paragraphs', progress: 1, total: 5 },
  ];

  return (
    <div className="bg-[var(--color-glass)] p-6 rounded-[2rem] border border-[var(--color-border)] shadow-2xl">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Neural Mission Log</p>
      {missions.map((m, i) => (
        <div key={i} className="mb-3 flex items-center justify-between text-sm text-[var(--fg)]">
          <span>{m.title}</span>
          <span className="font-bold tabular-nums">{m.progress}/{m.total}</span>
        </div>
      ))}
    </div>
  );
};
