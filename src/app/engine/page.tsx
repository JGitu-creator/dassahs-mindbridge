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
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100;
    setMouse({ x, y });
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
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${pageBg}`}
    >
      {/* Interactive Antigravity / GitHub-inspired Mouse-Reactive Light Mesh */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: darkMode
              ? `radial-gradient(720px circle at ${mouse.x}% ${mouse.y}%, rgba(59,130,246,0.22), rgba(168,85,247,0.10) 35%, transparent 70%)`
              : `radial-gradient(680px circle at ${mouse.x}% ${mouse.y}%, rgba(37,99,235,0.14), rgba(16,185,129,0.08) 38%, transparent 70%)`,
          }}
        />

        {/* Subtle Architectural Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Kinetic Orbital Prism Light Ribbons */}
        {!reducedMotion && (
          <>
            <motion.div
              animate={{ x: [0, 120, -80, 0], y: [0, 90, -50, 0], scale: [1, 1.18, 0.92, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-24 -left-24 h-[30rem] w-[30rem] rounded-full blur-3xl"
              style={{
                background: darkMode
                  ? 'radial-gradient(circle, rgba(37,99,235,0.42) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 70%)',
              }}
            />
            <motion.div
              animate={{ x: [0, -130, 80, 0], y: [0, -100, 70, 0], scale: [1, 0.92, 1.2, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-24 -right-24 h-[32rem] w-[32rem] rounded-full blur-3xl"
              style={{
                background: darkMode
                  ? 'radial-gradient(circle, rgba(16,185,129,0.34) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(16,185,129,0.24) 0%, transparent 70%)',
              }}
            />
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className={`hidden md:block absolute top-24 right-14 h-52 w-52 rounded-[3rem] border ${
                darkMode ? 'border-cyan-400/20 bg-cyan-400/[0.03]' : 'border-blue-500/20 bg-blue-500/[0.03]'
              }`}
            />
            <motion.div
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
              className={`hidden md:block absolute bottom-24 left-14 h-44 w-44 rounded-full border ${
                darkMode ? 'border-purple-400/20 bg-purple-400/[0.03]' : 'border-emerald-500/20 bg-emerald-500/[0.03]'
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
        <section className="mx-auto max-w-3xl text-center space-y-6">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-400"
          >
            <Zap size={13} className="text-amber-400" /> Choose Your Cognitive Mode
          </motion.div>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.06]"
          >
            The{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Prism Engine
            </span>
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className={`mx-auto max-w-2xl text-base sm:text-xl leading-relaxed font-medium ${muted}`}
          >
            One refractive intelligence built for ADHD and neurodivergent minds. Pick whether you want to
            decode heavy documents in <strong className={darkMode ? 'text-white' : 'text-slate-900'}>Dassah&apos;s Prism</strong> or
            turn intimidating coursework into a cozy game in <strong className={darkMode ? 'text-white' : 'text-slate-900'}>Prism Play</strong>.
          </motion.p>
        </section>

        {/* Interactive Dual Portal Cards */}
        <section aria-label="Prism Engine workspaces" className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Portal 1: Dassah's Prism */}
          <motion.div
            whileHover={reducedMotion ? undefined : { y: -6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className={`group relative overflow-hidden rounded-[2.25rem] border p-7 sm:p-10 backdrop-blur-2xl transition-all flex flex-col justify-between gap-8 ${cardSurface}`}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl transition-opacity group-hover:opacity-100 opacity-60" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Brain size={24} />
                </span>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${pillSurface}`}>
                  Document Studio
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight italic">
                  Dassah&apos;s <span className="text-blue-500">Prism</span>
                </h2>
                <p className="text-sm sm:text-base font-bold text-blue-400">
                  Turn overwhelming text into clarity.
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
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${pillSurface}`}
                  >
                    <tag.icon size={13} className="text-blue-400" /> {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/"
              className="relative z-10 inline-flex items-center justify-between rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/25 transition-all hover:bg-blue-500 active:scale-[0.98]"
            >
              <span>Launch Dassah&apos;s Prism</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Portal 2: Prism Play */}
          <motion.div
            whileHover={reducedMotion ? undefined : { y: -6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className={`group relative overflow-hidden rounded-[2.25rem] border p-7 sm:p-10 backdrop-blur-2xl transition-all flex flex-col justify-between gap-8 ${cardSurface}`}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl transition-opacity group-hover:opacity-100 opacity-60" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <Gamepad2 size={24} />
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  Canvas &amp; Study Quests
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight italic">
                  Prism <span className="text-emerald-400">Play</span>
                </h2>
                <p className="text-sm sm:text-base font-bold text-emerald-400">
                  Turning Dread into Play.
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
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${pillSurface}`}
                  >
                    <tag.icon size={13} className="text-emerald-400" /> {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/canvas"
              className="relative z-10 inline-flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98]"
            >
              <span>Launch Prism Play</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
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
