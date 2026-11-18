'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';

type WeaverState = 'idle' | 'engaged' | 'completion';

export const PrismWeaver = ({
  completedPulse = 0,
  focusMode = 'dastastic',
}: {
  completedPulse?: number;
  focusMode?: string;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 380 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const [mode, setMode] = useState<WeaverState>('idle');
  const [trail, setTrail] = useState<{ id: number; x: number; y: number }[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trailIdRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion || focusMode === 'sovereign') return;

    const pushPoint = (x: number, y: number) => {
      mouseX.set(x);
      mouseY.set(y);
      const id = ++trailIdRef.current;
      setTrail((prev) => [...prev.slice(-4), { id, x, y }]);

      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);

      pauseTimerRef.current = setTimeout(() => {
        setMode((curr) => (curr === 'completion' ? curr : 'engaged'));
        settleTimerRef.current = setTimeout(() => {
          setMode('idle');
          setTrail([]);
        }, 1800);
      }, 240);
    };

    const handleMouseMove = (e: MouseEvent) => pushPoint(e.clientX, e.clientY);
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) pushPoint(touch.clientX, touch.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('touchmove', handleTouch);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [mouseX, mouseY, reducedMotion, focusMode]);

  useEffect(() => {
    if (!completedPulse || reducedMotion || focusMode === 'sovereign') return;
    setMode('completion');
    const timer = setTimeout(() => setMode('idle'), 1200);
    return () => clearTimeout(timer);
  }, [completedPulse, reducedMotion, focusMode]);

  if (reducedMotion || focusMode === 'sovereign') return null;

  const shardColors = ['#60a5fa', '#c084fc', '#fbbf24'];

  return (
    <div className="fixed inset-0 z-[500] pointer-events-none" aria-hidden="true">
      {/* Short Fading Trail */}
      <AnimatePresence>
        {trail.map((pt, idx) => (
          <motion.div
            key={pt.id}
            initial={{ opacity: 0.35, scale: 0.8 }}
            animate={{ opacity: 0, scale: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="fixed w-2.5 h-2.5 rounded-full"
            style={{
              left: pt.x - 5,
              top: pt.y - 5,
              backgroundColor: shardColors[idx % shardColors.length],
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main Prism Companion */}
      <motion.div
        style={{ x: springX, y: springY, marginLeft: -22, marginTop: -22 }}
        className="relative w-11 h-11 flex items-center justify-center"
      >
        <motion.div
          animate={{
            scale: mode === 'completion' ? 1.28 : mode === 'engaged' ? 1.12 : 0.92,
            rotate: mode === 'completion' ? 180 : mode === 'engaged' ? 45 : 0,
          }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className={`w-9 h-9 rounded-xl backdrop-blur-md border transition-colors ${
            mode === 'completion'
              ? 'bg-emerald-400/25 border-emerald-300/60 shadow-[0_0_32px_rgba(52,211,153,0.65)]'
              : mode === 'engaged'
                ? 'bg-purple-500/20 border-purple-300/40 shadow-[0_0_26px_rgba(168,85,247,0.45)]'
                : 'bg-blue-500/15 border-white/20 shadow-[0_0_20px_rgba(59,130,246,0.35)]'
          }`}
        />

        {/* Orbiting Light Shards in Engaged / Completion State */}
        {(mode === 'engaged' || mode === 'completion') &&
          shardColors.map((color, i) => {
            const angle = (i * 120 * Math.PI) / 180;
            const radius = mode === 'completion' ? 10 : 20;
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{
                  opacity: [0.6, 1, 0.7],
                  scale: mode === 'completion' ? 1.2 : 1,
                  x: Math.cos(angle) * radius,
                  y: Math.sin(angle) * radius,
                }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
                className="absolute w-2 h-2 rounded-sm rotate-45"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}`,
                }}
              />
            );
          })}
      </motion.div>
    </div>
  );
};
