import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';

export const ranks = [
  { name: 'Novice Observer', threshold: 0 },
  { name: 'Pattern Discernor', threshold: 100 },
  { name: 'Complexity Architect', threshold: 500 },
  { name: 'Sovereign Mind', threshold: 1000 },
];

export const CognitiveAscension = ({ experience }: { experience: number }) => {
  const currentRank = ranks.slice().reverse().find(r => experience >= r.threshold) || ranks[0];

  return (
    <div className="bg-[var(--color-glass)] p-6 rounded-[2rem] border border-[var(--color-border)] shadow-2xl flex items-center gap-4">
      <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
        <Trophy className="text-amber-400" size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Current Rank</p>
        <p className="text-lg font-bold text-[var(--fg)]">{currentRank.name}</p>
        <div className="w-32 h-1.5 bg-black/20 rounded-full mt-2 overflow-hidden">
          <motion.div 
            className="h-full bg-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((experience / 1000) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
