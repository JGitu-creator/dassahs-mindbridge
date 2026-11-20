'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Cpu,
  Gamepad2,
  Headphones,
  Layers,
  Lock,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Swords,
  Zap,
} from 'lucide-react';

export default function PrismEnginePortalPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [mouse, setMouse] = useState({ x: 50, y: 35 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const updateCoordinates = (clientX: number, clientY: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const x = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((clientY - rect.top) / Math.max(1, rect.height)) * 100;
    setMouse({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    setHasInteracted(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    updateCoordinates(e.clientX, e.clientY, e.currentTarget);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const touch = e.touches[0];
    if (touch) updateCoordinates(touch.clientX, touch.clientY, e.currentTarget);
  };

  const pageBg = darkMode
    ? 'bg-[#040712] text-slate-100'
    : 'bg-[#f4f0e7] text-[#172133]';
  const muted = darkMode ? 'text-slate-400' : 'text-[#526071]';
  const cardSurface = darkMode
    ? 'bg-[#0b1224]/75 border-white/12 hover:border-blue-400/50 shadow-[0_30px_90px_rgba(0,0,0,0.55)]'
    : 'bg-[#faf7f0]/90 border-[#d6ccb9] hover:border-blue-500/60 shadow-[0_24px_70px_rgba(23,33,51,0.09)]';
  const pillSurface = darkMode
    ? 'bg-white/[0.06] border-white/12 text-slate-200'
    : 'bg-[#ece5d8] border-[#d6ccb9] text-[#243040]';

  return (
    <div
      onPointerMove={handlePointerMove}
      onTouchStart={handleTouchMove}
      onTouchMove={handleTouchMove}
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${pageBg}`}
    >
      {/* Active Living Prism Universe Background (Optimized for Mobile & Desktop) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* 1. Autonomous Kinetic Gliding Ambient Aurora (Drifts constantly even on phones without mouse interaction!) */}
        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  x: [0, 60, -50, 40, 0],
                  y: [0, -40, 50, -30, 0],
                  scale: [1, 1.18, 0.94, 1.12, 1],
                }
          }
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{
            background: darkMode
              ? 'radial-gradient(760px circle at 50% 36%, rgba(56,189,248,0.26), rgba(168,85,247,0.18) 36%, rgba(16,185,129,0.12) 58%, transparent 74%)'
              : 'radial-gradient(700px circle at 50% 36%, rgba(37,99,235,0.18), rgba(168,85,247,0.12) 36%, rgba(16,185,129,0.09) 58%, transparent 74%)',
          }}
        />

        {/* 2. Interactive Prismatic Cursor / Touch Spotlight (Reacts dynamically to touch on phone or mouse on desktop) */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: darkMode
              ? `radial-gradient(560px circle at ${mouse.x}% ${mouse.y}%, rgba(56,189,248,0.36), rgba(168,85,247,0.22) 32%, rgba(16,185,129,0.10) 55%, transparent 72%)`
              : `radial-gradient(540px circle at ${mouse.x}% ${mouse.y}%, rgba(37,99,235,0.24), rgba(168,85,247,0.15) 34%, rgba(16,185,129,0.08) 55%, transparent 72%)`,
            opacity: hasInteracted ? 1 : 0.65,
          }}
        />

        {/* Subtle Architectural Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        {/* 3. Real Full-Viewport Sweeping Kinetic Refraction Beams (Travels across the whole phone & screen) */}
        {!reducedMotion && (
          <>
            {/* Left-to-Right Prismatic Laser Sweep */}
            <motion.div
              animate={{ x: ['-100vw', '100vw'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
              className="absolute -top-1/4 h-[150%] w-72 sm:w-96 rotate-[24deg] blur-3xl opacity-75 sm:opacity-90 pointer-events-none"
              style={{
                background: darkMode
                  ? 'linear-gradient(90deg, transparent, rgba(56,189,248,0.35), rgba(168,85,247,0.40), rgba(16,185,129,0.28), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(37,99,235,0.24), rgba(168,85,247,0.26), rgba(16,185,129,0.20), transparent)'
              }}
            />
            {/* Right-to-Left Amber & Rose Secondary Sweep */}
            <motion.div
              animate={{ x: ['100vw', '-100vw'] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3, repeatDelay: 1.5 }}
              className="absolute -top-1/4 h-[150%] w-60 sm:w-80 -rotate-[20deg] blur-3xl opacity-60 sm:opacity-80 pointer-events-none"
              style={{
                background: darkMode
                  ? 'linear-gradient(90deg, transparent, rgba(245,158,11,0.24), rgba(236,72,153,0.30), rgba(59,130,246,0.25), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(245,158,11,0.16), rgba(236,72,153,0.20), rgba(59,130,246,0.18), transparent)',
              }}
            />

            {/* Pulsing Luminous Color Orbs */}
            <motion.div
              animate={{ x: [0, 110, -70, 0], y: [0, 80, -50, 0], scale: [1, 1.25, 0.9, 1] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-20 -left-20 h-72 w-72 sm:h-[32rem] sm:w-[32rem] rounded-full blur-3xl"
              style={{
                background: darkMode
                  ? 'radial-gradient(circle, rgba(37,99,235,0.58) 0%, rgba(168,85,247,0.28) 45%, transparent 72%)'
                  : 'radial-gradient(circle, rgba(59,130,246,0.38) 0%, rgba(168,85,247,0.20) 45%, transparent 72%)',
              }}
            />
            <motion.div
              animate={{ x: [0, -110, 75, 0], y: [0, -80, 60, 0], scale: [1, 0.92, 1.24, 1] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-20 -right-20 h-72 w-72 sm:h-[34rem] sm:w-[34rem] rounded-full blur-3xl"
              style={{
                background: darkMode
                  ? 'radial-gradient(circle, rgba(16,185,129,0.50) 0%, rgba(56,189,248,0.26) 48%, transparent 72%)'
                  : 'radial-gradient(circle, rgba(16,185,129,0.32) 0%, rgba(56,189,248,0.20) 48%, transparent 72%)',
              }}
            />

            {/* 4. Visible Floating Luminous Prism Sparkles (Positioned along visible viewport edges for mobile & desktop) */}
            {[
              { top: '8%', left: '15%', size: 9, color: 'bg-cyan-400', dy: -20, dur: 4.8 },
              { top: '16%', left: '82%', size: 11, color: 'bg-purple-400', dy: 24, dur: 5.6 },
              { top: '48%', left: '4%', size: 8, color: 'bg-emerald-400', dy: -18, dur: 6.2 },
              { top: '52%', left: '92%', size: 10, color: 'bg-blue-400', dy: 22, dur: 5.2 },
              { top: '34%', left: '88%', size: 8, color: 'bg-pink-400', dy: -16, dur: 5.9 },
              { top: '68%', left: '6%', size: 9, color: 'bg-amber-400', dy: 20, dur: 6.5 },
              { top: '88%', left: '20%', size: 10, color: 'bg-cyan-300', dy: -22, dur: 5.5 },
              { top: '92%', left: '78%', size: 9, color: 'bg-emerald-300', dy: 18, dur: 6.8 },
            ].map((node, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, node.dy, 0], opacity: [0.4, 1, 0.4], scale: [0.85, 1.4, 0.85] }}
                transition={{ duration: node.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
                style={{ top: node.top, left: node.left, width: node.size, height: node.size }}
                className={`absolute rounded-full ${node.color} shadow-[0_0_18px_currentColor]`}
              />
            ))}

            {/* 5. Kinetic Rotating Orbital Rings (Visible on mobile and desktop, scaled for mobile screens!) */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
              className={`absolute top-16 -right-6 sm:top-20 sm:right-12 h-32 w-32 sm:h-56 sm:w-56 rounded-[2rem] sm:rounded-[3.25rem] border ${
                darkMode ? 'border-cyan-400/35 bg-cyan-400/[0.05] shadow-[0_0_30px_rgba(34,211,238,0.15)]' : 'border-blue-500/30 bg-blue-500/[0.05]'
              }`}
            />
            <motion.div
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              className={`absolute bottom-16 -left-6 sm:bottom-20 sm:left-12 h-28 w-28 sm:h-48 sm:w-48 rounded-full border ${
                darkMode ? 'border-purple-400/35 bg-purple-400/[0.05] shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'border-emerald-500/30 bg-emerald-500/[0.05]'
              }`}
            />
          </>
        )}
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-slate-950 shadow-lg shadow-blue-500/30">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="text-sm font-black tracking-tight">The Prism Engine</p>
            <p className={`text-[11px] font-semibold ${muted}`}>Neurodivergent Cognitive Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold ${pillSurface}`}>
            <Lock size={12} className="text-emerald-500" /> 100% Browser-Private Notes
          </span>
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label={darkMode ? 'Switch to Soft Paper Light Mode' : 'Switch to Dark Mode'}
            className={`rounded-2xl border p-2.5 transition-colors ${pillSurface}`}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main Hero & Dual Portal Stage */}
      <main className="relative z-10 mx-auto max-w-6xl px-5 pt-6 pb-20 sm:px-8 sm:pt-12 space-y-12">
        {/* Refractive Hero Centerpiece */}
        <section className="mx-auto max-w-4xl text-center space-y-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/35 bg-blue-500/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.25)]"
          >
            <Zap size={13} className="text-amber-400" /> Choose Your Cognitive Mode
          </motion.div>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="prism-brand text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-black italic tracking-tight leading-[1.06]"
          >
            <span className={darkMode ? 'text-white/90 drop-shadow-[0_0_18px_rgba(255,255,255,0.2)]' : 'text-slate-900'}>
              The{' '}
            </span>
            <span
              className={`inline-block pr-2 bg-clip-text text-transparent ${
                darkMode
                  ? 'bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400 drop-shadow-[0_0_32px_rgba(59,130,246,0.55)]'
                  : 'bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600'
              }`}
            >
              Prism
            </span>{' '}
            <span className="prism-text">
              Engine
            </span>
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className={`mx-auto max-w-2xl text-base sm:text-xl leading-relaxed font-medium ${muted}`}
          >
            One refractive intelligence built for ADHD and neurodivergent minds. Pick whether you want to
            decode heavy documents in <strong className={darkMode ? 'text-sky-300' : 'text-blue-700'}>Dassah&apos;s Prism</strong> or
            turn intimidating coursework into a cozy game in <strong className={darkMode ? 'text-emerald-300' : 'text-emerald-700'}>Prism Play</strong>.
          </motion.p>
        </section>

        {/* Interactive Dual Portal Cards */}
        <section aria-label="Prism Engine workspaces" className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-9">
          {/* Portal 1: Dassah's Prism (Signature Blue / Indigo) */}
          <motion.div
            whileHover={reducedMotion ? undefined : { y: -8, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className={`group relative overflow-hidden rounded-[2.5rem] border p-8 sm:p-10 backdrop-blur-3xl transition-all duration-300 flex flex-col justify-between gap-8 ${
              darkMode
                ? 'bg-gradient-to-br from-[#0e1936]/90 via-[#0a1228]/85 to-[#070d1f]/90 border-blue-400/25 hover:border-blue-400/60 shadow-[0_30px_90px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14)] hover:shadow-[0_36px_110px_rgba(37,99,235,0.28),inset_0_1px_0_rgba(147,197,253,0.3)]'
                : 'bg-gradient-to-br from-white/95 via-[#f6f9ff]/95 to-[#edf3ff]/90 border-blue-300/60 hover:border-blue-500/70 shadow-[0_24px_70px_rgba(37,99,235,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]'
            }`}
          >
            {/* Liquid Glass Specular Edge & Ambient Blue Halo */}
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
            <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-blue-500/25 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-100 opacity-70" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-indigo-500/15 blur-3xl opacity-60 group-hover:opacity-90 transition-opacity" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/25 to-indigo-500/20 text-blue-400 border border-blue-400/35 shadow-[0_0_24px_rgba(59,130,246,0.25)]">
                  <Brain size={25} />
                </span>
                <span className={`rounded-full border px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${
                  darkMode
                    ? 'bg-blue-500/15 border-blue-400/30 text-blue-300'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  Document Studio
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h2 className="prism-brand text-4xl sm:text-5xl font-black tracking-tight italic leading-[1.1]">
                    Dassah&apos;s{' '}
                    <span
                      className={`inline-block pr-2 bg-clip-text text-transparent ${
                        darkMode
                          ? 'bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.45)]'
                          : 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600'
                      }`}
                    >
                      Prism
                    </span>
                  </h2>
                  <div className="mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-transparent" />
                </div>
                <p className={`text-sm sm:text-base font-bold italic ${darkMode ? 'text-sky-300' : 'text-blue-700'}`}>
                  &ldquo;Turn overwhelming noise into clear focus in seconds.&rdquo;
                </p>
                <p className={`text-sm leading-relaxed ${muted}`}>
                  Paste articles, upload PDFs or lecture slides, and refract dense walls of text into executive summaries, metaphors, visual diagrams, and Ask DJ insights.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { icon: BookOpen, label: 'PDF & Doc Upload' },
                  { icon: Layers, label: 'Deep Refractions' },
                  { icon: Sparkles, label: 'Ask DJ Chat' },
                ].map((tag) => (
                  <span
                    key={tag.label}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                      darkMode
                        ? 'bg-blue-500/[0.08] border-blue-400/20 text-slate-200 group-hover:border-blue-400/35'
                        : 'bg-white/80 border-blue-200/80 text-slate-700'
                    }`}
                  >
                    <tag.icon size={13} className="text-blue-400" /> {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/"
              className="relative z-10 inline-flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-6 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(37,99,235,0.38),inset_0_1px_0_rgba(255,255,255,0.28)] transition-all hover:from-blue-500 hover:via-sky-500 hover:to-indigo-500 active:scale-[0.98]"
            >
              <span>Launch Dassah&apos;s Prism</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </Link>
          </motion.div>

          {/* Portal 2: Prism Play (Signature Emerald / Teal) */}
          <motion.div
            whileHover={reducedMotion ? undefined : { y: -8, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className={`group relative overflow-hidden rounded-[2.5rem] border p-8 sm:p-10 backdrop-blur-3xl transition-all duration-300 flex flex-col justify-between gap-8 ${
              darkMode
                ? 'bg-gradient-to-br from-[#082221]/90 via-[#07181d]/85 to-[#061119]/90 border-emerald-400/25 hover:border-emerald-400/60 shadow-[0_30px_90px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14)] hover:shadow-[0_36px_110px_rgba(16,185,129,0.26),inset_0_1px_0_rgba(110,231,183,0.3)]'
                : 'bg-gradient-to-br from-white/95 via-[#f2fcf8]/95 to-[#e8f8f2]/90 border-emerald-300/60 hover:border-emerald-500/70 shadow-[0_24px_70px_rgba(16,185,129,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]'
            }`}
          >
            {/* Liquid Glass Specular Edge & Ambient Emerald Halo */}
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
            <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-100 opacity-70" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-teal-400/15 blur-3xl opacity-60 group-hover:opacity-90 transition-opacity" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/20 text-emerald-400 border border-emerald-400/35 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                  <Gamepad2 size={25} />
                </span>
                <span className={`rounded-full border px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${
                  darkMode
                    ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  Canvas &amp; Study Quests
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h2 className="prism-brand text-4xl sm:text-5xl font-black tracking-tight italic leading-[1.1]">
                    Prism{' '}
                    <span
                      className={`inline-block pr-2 bg-clip-text text-transparent ${
                        darkMode
                          ? 'bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.45)]'
                          : 'bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600'
                      }`}
                    >
                      Play
                    </span>
                  </h2>
                  <div className="mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-transparent" />
                </div>
                <p className={`text-sm sm:text-base font-bold italic ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  &ldquo;Turning Dread into Play.&rdquo;
                </p>
                <p className={`text-sm leading-relaxed ${muted}`}>
                  Connect your Canvas LMS course or paste class notes. Read one calm card at a time with Soundscapes, Kinetic Glow, Beat-the-Clock sprints, Boss Fights, and your Neural Identity.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { icon: Headphones, label: 'Soundscape Studio' },
                  { icon: Swords, label: 'Boss Fights & XP' },
                  { icon: Zap, label: 'ADHD Superpowers' },
                ].map((tag) => (
                  <span
                    key={tag.label}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                      darkMode
                        ? 'bg-emerald-500/[0.08] border-emerald-400/20 text-slate-200 group-hover:border-emerald-400/35'
                        : 'bg-white/80 border-emerald-200/80 text-slate-700'
                    }`}
                  >
                    <tag.icon size={13} className="text-emerald-400" /> {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/canvas"
              className="relative z-10 inline-flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.28)] transition-all hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 active:scale-[0.98]"
            >
              <span>Launch Prism Play</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </Link>
          </motion.div>
        </section>

        {/* Live 4-Tier Engine Reliability Strip */}
        <section
          aria-label="Prism Engine 4-tier resilience"
          className={`rounded-3xl border p-5 sm:p-6 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-4 ${cardSurface}`}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 shrink-0">
              <Cpu size={20} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                4-Tier Unbreakable Fallback Engine
              </p>
              <p className={`text-xs sm:text-sm ${muted}`}>
                Powered by <strong>Groq LPU</strong> → <strong>OpenRouter Free Cascade</strong> → <strong>Gemini</strong> → <strong>Unlimited Local Prism</strong> (0 tokens, never locks you out).
              </p>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold ${pillSurface}`}>
            <ShieldCheck size={14} className="text-emerald-500" /> Zero Secret Leaks · Free Forever
          </span>
        </section>
      </main>
    </div>
  );
}
