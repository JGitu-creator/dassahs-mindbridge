'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MorphFish } from '@/components/morphing/MorphIcons';

const GRACE_SPARKS = [
  "Built for minds that feel everything — keep going, winner.",
  "One tiny step beats paralysis. Clarity is yours.",
  "Your cognitive intensity is an engine, not a glitch.",
  "He stepped into the centre of the noise — stay Dastastic!",
  "First tiny step. You do not need to finish it all at once.",
];

const STAGES: ('fish' | 'prism' | 'crown')[] = ['fish', 'prism', 'crown'];

export const LivingIchthysFooter = ({ focusMode = 'dastastic' }: { focusMode?: string }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [activeSchool, setActiveSchool] = useState(false);
  const [shimmering, setShimmering] = useState(false);
  const [sparkIndex, setSparkIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const morphIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      if (morphIntervalRef.current) clearInterval(morphIntervalRef.current);
    };
  }, []);

  const triggerLivingAwakening = (advanceSpark: boolean) => {
    if (advanceSpark) {
      setSparkIndex((prev) => (prev === null ? 0 : (prev + 1) % GRACE_SPARKS.length));
    }
    if (reducedMotion) return;

    setActiveSchool(true);
    setShimmering(true);
    setStageIdx(1);

    if (morphIntervalRef.current) clearInterval(morphIntervalRef.current);
    morphIntervalRef.current = setInterval(() => {
      setStageIdx((prev) => (prev + 1) % STAGES.length);
    }, 850);

    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      if (morphIntervalRef.current) {
        clearInterval(morphIntervalRef.current);
        morphIntervalRef.current = null;
      }
      setStageIdx(0);
      setActiveSchool(false);
      setShimmering(false);
    }, 2800);
  };

  const sparkColors = [
    'bg-blue-400 shadow-[0_0_8px_#60a5fa]',
    'bg-purple-400 shadow-[0_0_8px_#c084fc]',
    'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
    'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    'bg-pink-400 shadow-[0_0_8px_#f472b6]',
  ];

  return (
    <div className="relative flex flex-col items-center gap-2.5">
      <div
        onMouseEnter={() => {
          if (focusMode !== 'sovereign') triggerLivingAwakening(false);
        }}
        className="relative flex flex-wrap items-center justify-center gap-3 text-[var(--fg)] font-black uppercase text-[10px] tracking-[0.35em] px-4 py-1.5 rounded-full transition-all"
      >
        {/* #5 Tactile Glass Refraction Wave */}
        <AnimatePresence>
          {shimmering && !reducedMotion && (
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1.06 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-amber-500/15 blur-sm"
            />
          )}
        </AnimatePresence>

        <span className={shimmering && !reducedMotion ? 'footer-prism-shimmer' : ''}>JG</span>

        {/* #1 Living Ichthys Morph + #3 Magnetic Star-School */}
        <button
          type="button"
          onClick={() => triggerLivingAwakening(true)}
          aria-label="Awaken Ichthys Prism and view a Grace encouragement spark"
          title="Hover or tap the Ichthys to morph into a Prism and flip a Grace Spark"
          className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-glass)] border border-[var(--color-border)] hover:border-blue-400/60 transition-all cursor-pointer"
        >
          <AnimatePresence>
            {activeSchool && !reducedMotion && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                {sparkColors.map((cls, i) => (
                  <motion.span
                    key={i}
                    className={`absolute w-1.5 h-1.5 rounded-full ${cls}`}
                    animate={{
                      x: [0, 22 * (i % 2 === 0 ? 1 : -1), 0, -22 * (i % 2 === 0 ? 1 : -1), 0],
                      y: [0, -9, 0, 9, 0],
                      scale: [0.8, 1.15, 0.9, 1.15, 0.8],
                    }}
                    transition={{
                      duration: 2.2,
                      delay: i * 0.18,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </motion.span>
            )}
          </AnimatePresence>

          <MorphFish
            size={15}
            stage={STAGES[stageIdx]}
            morphing={activeSchool && !reducedMotion}
            className="text-blue-500"
          />
        </button>

        <span className={shimmering && !reducedMotion ? 'footer-prism-shimmer' : ''}>
          | Rooted in Christ | Dedicated to Dchan.
        </span>
      </div>

      {/* #4 Grace Spark Micro-Encouragement Flip */}
      <AnimatePresence mode="wait">
        {sparkIndex !== null && (
          <motion.div
            key={sparkIndex}
            initial={{ opacity: 0, rotateX: -75, y: -4 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="px-4 py-1.5 rounded-full apple-glass border border-blue-500/30 text-[11px] font-semibold italic text-[var(--fg)] flex items-center gap-2 shadow-sm"
          >
            <span>“{GRACE_SPARKS[sparkIndex]}”</span>
            <button
              type="button"
              onClick={() => setSparkIndex(null)}
              aria-label="Dismiss Grace Spark"
              className="text-[10px] not-italic text-[var(--fg)]/60 hover:text-[var(--fg)] px-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
