import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export const ranks = [
  { name: 'Novice Observer', threshold: 0 },
  { name: 'Pattern Discernor', threshold: 100 },
  { name: 'Complexity Architect', threshold: 500 },
  { name: 'Sovereign Mind', threshold: 1000 },
];

export const CognitiveAscension = ({ experience }: { experience: number }) => {
  const currentRank = ranks.slice().reverse().find(r => experience >= r.threshold) || ranks[0];
  const nextRank = ranks[ranks.indexOf(currentRank) + 1] || currentRank;
  
  const progress = currentRank === nextRank 
    ? 100 
    : ((experience - currentRank.threshold) / (nextRank.threshold - currentRank.threshold)) * 100;

  return (
    <div className="apple-glass p-6 rounded-[2rem] border border-[var(--color-border)] shadow-2xl flex items-center gap-6">
      <div className="w-16 h-16 bg-[var(--color-shadow)] rounded-3xl flex items-center justify-center border border-[var(--color-border)] shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--prism-3)] to-[var(--prism-4)] opacity-20" />
        <Trophy className="text-[var(--prism-3)] relative z-10" size={32} />
      </div>
      <div className="flex-grow">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--prism-3)] mb-1">Cognitive Rank</p>
        <p className="text-lg font-black text-[var(--fg)] italic tracking-tight">{currentRank.name}</p>
        <div className="w-full h-2 bg-[var(--color-shadow)] rounded-full mt-3 overflow-hidden border border-[var(--color-border)]">
          <motion.div 
            className="h-full bg-gradient-to-r from-[var(--prism-1)] to-[var(--prism-3)]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="text-[8px] font-bold text-[var(--fg)]/50 mt-1 uppercase tracking-wider">{Math.round(progress)}% to {nextRank.name}</p>
      </div>
    </div>
  );
};
