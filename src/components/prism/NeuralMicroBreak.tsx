'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wind } from 'lucide-react';

const BREAK_PROMPTS = [
  'Drop your shoulders and unclench your jaw.',
  'Take one slow sip of water — your brain loves hydration.',
  'Look 20 feet away for a few seconds to rest your eyes.',
  'Roll your wrists gently — you are doing great.',
];

export const NeuralMicroBreak = ({
  level,
  onComplete,
  durationSeconds = 20,
}: {
  level: number;
  onComplete: () => void;
  durationSeconds?: number;
}) => {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [phase, setPhase] = useState<'Breathe In' | 'Hold' | 'Breathe Out'>('Breathe In');

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cycle = (durationSeconds - secondsLeft) % 8;
    if (cycle < 3) setPhase('Breathe In');
    else if (cycle < 5) setPhase('Hold');
    else setPhase('Breathe Out');
  }, [secondsLeft, durationSeconds]);

  const prompt = BREAK_PROMPTS[(Math.max(1, level) - 1) % BREAK_PROMPTS.length];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Cozy Brain Break"
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md rounded-[2.25rem] border border-white/15 bg-slate-900/90 p-8 text-center text-white shadow-[0_30px_90px_rgba(37,99,235,0.35)] space-y-6"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-300">
          <Sparkles size={14} /> Cozy Brain Break · Level {level}
        </div>

        <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
          <motion.div
            animate={{
              scale: phase === 'Breathe In' ? 1.2 : phase === 'Hold' ? 1.2 : 0.88,
              opacity: phase === 'Breathe Out' ? 0.45 : 0.85,
            }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/40 via-cyan-400/30 to-emerald-400/40 blur-md"
          />
          <div className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-white/25 bg-slate-950/70">
            <Wind size={22} className="text-cyan-300 mb-1" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">{phase}</span>
            <span className="text-lg font-black tabular-nums text-white mt-0.5">{secondsLeft}s</span>
          </div>
        </div>

        <p className="text-base font-medium leading-relaxed text-slate-200">{prompt}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onComplete}
            className="w-full sm:w-auto rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-500 active:scale-95"
          >
            {secondsLeft === 0 ? "I'm Recharged — Next Card!" : "Back to Quest"}
          </button>
          {secondsLeft > 0 && (
            <button
              onClick={onComplete}
              className="w-full sm:w-auto rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10"
            >
              Skip, I&apos;m in flow
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
