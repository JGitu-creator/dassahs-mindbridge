import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2 } from 'lucide-react';

export const MissionLog = () => {
  const missions = [
    { title: 'Stabilize 3 chunks', progress: 2, total: 3 },
    { title: 'Simplify 5 paragraphs', progress: 1, total: 5 },
  ];

  return (
    <div className="apple-glass p-6 rounded-[2rem] border border-[var(--color-border)] shadow-2xl">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--prism-1)] mb-6 flex items-center gap-2">
        <Zap size={14} className="text-[var(--prism-1)]" /> Neural Mission Log
      </p>
      <div className="space-y-6">
        {missions.map((m, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--fg)]">{m.title}</span>
              <span className="text-[10px] font-black text-[var(--prism-1)] tabular-nums">{m.progress}/{m.total}</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--color-shadow)] rounded-full overflow-hidden border border-[var(--color-border)]">
              <motion.div 
                className="h-full bg-[var(--prism-1)]"
                initial={{ width: 0 }}
                animate={{ width: `${(m.progress / m.total) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
