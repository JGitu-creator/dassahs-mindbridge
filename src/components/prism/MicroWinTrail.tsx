'use client';

import { motion } from 'framer-motion';

export const MicroWinTrail = ({
  progress,
  total,
  message,
}: {
  progress: number;
  total: number;
  message: string | null;
}) => {
  const safeProgress = Math.max(0, Math.min(1, progress));
  const completed = Math.round(safeProgress * total);

  return (
    <div className="mt-4 rounded-2xl border border-blue-400/15 bg-blue-500/5 px-3 py-3 sm:px-4" aria-label="Micro-win progress">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-400">Micro-win trail</p>
        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--fg)]/55">{completed}/{total} steps</p>
      </div>
      <div className="mt-2 flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${index < completed ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.55)]' : 'bg-[var(--fg)]/10'}`}
          />
        ))}
      </div>
      <div className="min-h-5" aria-live="polite">
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="mt-2 text-xs font-bold text-[var(--fg)]/80"
          >
            <span className="mr-1.5 text-emerald-400">+1</span>{message}
          </motion.p>
        )}
      </div>
    </div>
  );
};
