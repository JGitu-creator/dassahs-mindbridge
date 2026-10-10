"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Crown, Sparkles, Rocket, ArrowRight, X, Clock, Palette,
  Upload, Volume2, Share2, Download, MessageCircle, Send, CheckCircle2,
  Lock, Trophy, Sparkle, BarChart3, MessageSquare, Loader2, Type, Swords, Sun, Moon, Ghost, Star, Settings, MoreHorizontal,
  Compass, Check, LogOut, Shield, Anchor, Heart, Music, Church, ShieldCheck, Disc, Code, Camera, BookOpen, ChevronRight, MoonStar, Flame, Coins, Gem, Orbit,
  Hexagon, Monitor, Zap, Brain, Fish
} from 'lucide-react';
import { NeuralCore } from '@/components/NeuralCore';
import { CognitiveAscension } from '@/components/CognitiveAscension';
import { MissionLog } from '@/components/MissionLog';
import { Vault } from '@/components/Vault';

const DastasticIcon = ({ ActiveIcon, themeAccent }: { ActiveIcon: any, themeAccent: string }) => (
  <motion.div
    animate="animate"
    className="relative w-6 h-6 flex items-center justify-center"
  >
    <motion.div
      variants={{
        idle: { opacity: 1, scale: 1, rotate: 0 },
        animate: { opacity: [1, 0, 1], scale: [1, 0.8, 1], rotate: [0, 180, 360] }
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <Hexagon size={24} style={{ color: themeAccent }} />
    </motion.div>
    <motion.div variants={{ idle: { opacity: 0, scale: 0.5, rotate: -180 }, hover: { opacity: 1, scale: 1, rotate: 0 } }} className="absolute inset-0 flex items-center justify-center">
      <ActiveIcon size={24} style={{ color: themeAccent }} />
    </motion.div>
  </motion.div>
);

const DastasticShell = ({ children, theme, themeMode }: { children: React.ReactNode, theme: string, themeMode: 'light' | 'dark' | 'system' }) => {
  const effectiveThemeMode = themeMode === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : themeMode;
  return (
    <div className={`theme-${theme} ${effectiveThemeMode === 'dark' ? 'dark' : 'light'} min-h-screen transition-colors duration-700 ease-in-out`}>
      {children}
    </div>
  );
};
import { ContextAnchor } from '@/components/prism/ContextAnchor';
import { ProgressPrism } from '@/components/prism/ProgressPrism';
import { ReadAloud } from '@/components/prism/ReadAloud';
import { AIUsageControl } from '@/components/AIUsageControl';
import type { ProviderPreference } from '@/lib/ai-usage';
import { PrismWeaver } from '@/components/prism/PrismWeaver';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
type ThemeMode = "midnight_sovereign" | "dastastic_neon" | "electric_grace" | "divine_gold" | "hadassah_silk" | "sovereign_pulse";
interface ThemeConfig {
  name: string;
  icon: any;
  light: { background: string; text: string; accent: string; glass: string; border: string; shadow: string; };
  dark: { background: string; text: string; accent: string; glass: string; border: string; shadow: string; };
  prism: string[];
}
const THEMES: Record<string, ThemeConfig> = {
  midnight_sovereign: {
    name: 'Midnight Sovereign',
    icon: Moon,
    light: { background: '#f8fafc', text: '#172554', accent: '#2563eb', glass: 'rgba(255,255,255,0.9)', border: 'rgba(37, 99, 235, 0.28)', shadow: "rgba(15,23,42,0.08)" },
    dark: { background: '#020617', text: '#f8fafc', accent: '#3b82f6', glass: 'rgba(30, 41, 59, 0.5)', border: 'rgba(255, 255, 255, 0.1)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#3b82f6', '#8b5cf6', '#06b6d4']
  },
  electric_grace: {
    name: 'Electric Grace',
    icon: Flame,
    light: { background: '#fff7f8', text: '#881337', accent: '#be123c', glass: 'rgba(255,255,255,0.92)', border: 'rgba(190, 18, 60, 0.28)', shadow: "rgba(76,5,25,0.08)" },
    dark: { background: '#0f0505', text: '#ffe4e6', accent: '#e11d48', glass: 'rgba(20, 5, 5, 0.5)', border: 'rgba(225, 29, 72, 0.3)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#e11d48', '#fbbf24', '#2dd4bf']
  },
  divine_gold: {
    name: 'Divine Gold',
    icon: Coins,
    light: { background: '#fffbeb', text: '#78350f', accent: '#b45309', glass: 'rgba(255,255,255,0.92)', border: 'rgba(180, 83, 9, 0.28)', shadow: "rgba(120,53,15,0.08)" },
    dark: { background: '#000000', text: '#fffbeb', accent: '#fbbf24', glass: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.4)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#fbbf24', '#f59e0b', '#ffffff']
  },
  hadassah_silk: {
    name: 'Hadassah Silk',
    icon: Gem,
    light: { background: '#f0fdf4', text: '#064e3b', accent: '#047857', glass: 'rgba(255,255,255,0.92)', border: 'rgba(4, 120, 87, 0.28)', shadow: "rgba(6,78,59,0.08)" },
    dark: { background: '#022c22', text: '#ecfdf5', accent: '#10b981', glass: 'rgba(6, 78, 59, 0.4)', border: 'rgba(16, 185, 129, 0.2)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#10b981', '#34d399', '#059669']
  },
  sovereign_pulse: {
    name: 'Sovereign Pulse',
    icon: Orbit,
    light: { background: '#faf5ff', text: '#3b0764', accent: '#6d28d9', glass: 'rgba(255,255,255,0.92)', border: 'rgba(109, 40, 217, 0.28)', shadow: "rgba(59,7,100,0.08)" },
    dark: { background: '#2e1065', text: '#f5f3ff', accent: '#8b5cf6', glass: 'rgba(76, 29, 149, 0.4)', border: 'rgba(139, 92, 246, 0.2)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#8b5cf6', '#a78bfa', '#7c3aed']
  }
};
const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];
const SENSORY_PROFILES = [
  { id: 'Calm', label: 'Calm', description: 'Softer motion, gentler glass, and less visual intensity.' },
  { id: 'Vibrant', label: 'Vibrant', description: 'More colour and energy for stimulation and momentum.' },
  { id: 'Contrast', label: 'Contrast', description: 'Sharper edges and clearer separation for easier scanning.' },
] as const;
const NEURAL_GUIDE_STEPS = [
  { title: 'Start with the noise', description: 'Paste text, upload a PDF or document, capture an image, or use the browser extension. Your focus objective is optional but helps Prism aim the refraction.' },
  { title: 'Use the Focus Objective', description: 'Tell Prism what you need from the material—for example, “prepare me for the meeting” or “find the three actions I must take.” It steers the summary and action suggestions without changing the source.' },
  { title: 'Refract, then review', description: 'Prism turns dense material into a short summary, readable segments, metaphors, dopamine hooks, and a next action. AI output is a guide—not guaranteed truth—so verify important facts.' },
  { title: 'Adaptive Refraction', description: 'Concise gives the shortest path, Standard balances context and speed, and Detailed preserves more explanation. This setting changes how much Prism says, not the original document.' },
  { title: 'Bionic Shield and Neural Rhythm', description: 'Bionic Shield bolds useful word patterns to make scanning easier. Neural Rhythm adds gentle pacing and break prompts to support task completion; neither changes the meaning.' },
  { title: 'Choose your sensory feel', description: 'Calm softens motion and colour, Vibrant adds energy, and Contrast sharpens edges. The preview in Neural Identity shows the change immediately so you can choose what feels comfortable.' },
  { title: 'Sound and saved highlights', description: 'Neural Identity lets you choose a device voice and preview it. Brown Noise is an optional focus sound. Star only the metaphor or dopamine hook you truly want to revisit; the Vault can filter or clear saved items.' },
  { title: 'Protect private information', description: 'Private Session prevents new results from being written to history. Leaving the tab does not intentionally sign you out; Prism only uses its inactivity safeguard while the app is visible.' },
  { title: 'Stay in control', description: 'Neural Command changes how Prism presents information. OpenRouter and Gemini are managed by Prism; you are never asked to paste your own provider key into the app. The token meter shows recorded usage.' },
] as const;
interface SimplifiedData {
  id?: string;
  tldr: string[];
  whyCare: string;
  readingTime: string;
  chunks: {
    heading: string;
    content: string;
    summary: string;
    keyTerms: string[];
    metaphor: string;
    dopamineHook: string;
    logicRoot?: string;
    citations?: string;
  }[];
  chartData: { type: 'bar' | 'line' | 'pie'; data: { name: string; value: number }[] } | null;
  actions: { task: string; priority: 'high' | 'medium' | 'low'; completed?: boolean }[];
}
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};
import { StackedThemeSelector } from '@/components/morphing/StackedThemeSelector';
import { MorphFish, MorphBrain, MorphZap, MorphRocket, MorphSettings } from '@/components/morphing/MorphIcons';

const IchthysIcon = ({ size = 24, className = "" }) => <MorphFish className={className} />;
const StarParticles = ({ count, isFinal }: { count: number, isFinal?: boolean }) => {
  const isMobile = useIsMobile();
  const mobileCount = isMobile ? Math.min(count, 20) : count;

  const particlesRef = useRef<any[]>([]);
  if (particlesRef.current.length === 0) {
    particlesRef.current = [...Array(100)].map(() => ({
      initialX: Math.random() * 2000,
      scale: Math.random() * 0.5 + 0.5,
      animateX: Math.random() * 2000,
      offsetX: Math.random() * 100 - 50,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5
    }));
  }
  const activeParticles = particlesRef.current.slice(0, mobileCount);
  return (
    <div className="fixed inset-0 pointer-events-none z-[401]">
      {activeParticles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: p.initialX, opacity: 1, scale: p.scale }}
          animate={{
            y: 1200,
            x: `calc(${p.animateX}px + ${p.offsetX}px)`,
            rotate: 360,
            opacity: 0
          }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
          className="absolute"
        >
          {isFinal ? <Trophy className="text-amber-400" size={isMobile ? 16 : 24} /> : <Sparkle className="text-blue-400" size={isMobile ? 12 : 16} />}
        </motion.div>
      ))}
    </div>
  );
};
const NeuralRefractionSlider = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    setSliderPos(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      className="relative w-full h-[320px] md:h-[400px] rounded-[3rem] overflow-hidden border border-[var(--color-border)] cursor-ew-resize group apple-glass shadow-2xl"
    >
      {/* Noise Side (Left) - Enhanced Contrast and clipped by slider */}
      <div
        className="absolute inset-0 bg-[var(--color-bg)]/80 dark:bg-[var(--color-shadow)]/60 flex flex-col items-center justify-center p-8 md:p-16 text-center select-none grayscale opacity-90 backdrop-blur-md"
        style={{ clipPath: `polygon(0% 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0% 100%)` }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--color-text)]/60 mb-6">The Noise</p>
        <p className="text-xl md:text-3xl text-[var(--color-text)] leading-relaxed blur-[0.2px] font-medium">
          This is a very long and confusing sentence that just keeps going and going and your brain might start to wander off because there is no clear structure or path for your eyes to follow.
        </p>
      </div>

      {/* Clarity Side (Right) - Advanced Apple Liquid Glassmorphism, clipped by slider */}
      <div
        className="absolute inset-0 apple-glass-dark flex flex-col items-center justify-center p-8 md:p-16 text-center select-none z-10"
        style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--prism-1)]/20 via-transparent to-[var(--prism-4)]/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--color-accent)] mb-6 z-20">The Clarity</p>
        <p className="text-xl md:text-3xl text-[var(--fg)] font-black leading-relaxed italic z-20 drop-shadow-lg">
          <span className="text-[var(--prism-1)]">Thi</span>s <span className="text-[var(--prism-2)]">i</span>s <span className="text-[var(--prism-3)]">a</span> <span className="text-[var(--prism-4)]">shor</span>t, <span className="text-[var(--color-accent)]">Bioni</span>c <span className="text-[var(--prism-1)]">pat</span>h. <span className="text-[var(--prism-2)]">You</span>r <span className="text-[var(--prism-3)]">brai</span>n <span className="text-[var(--prism-4)]">lock</span>s <span className="text-[var(--color-accent)]">i</span>n <span className="text-[var(--prism-1)]">instan</span>tly.
        </p>
      </div>

      {/* Slider Divider with Premium Liquid Glow */}
      <motion.div
        className="absolute top-0 bottom-0 w-[6px] bg-white/60 z-20 shadow-[0_0_40px_rgba(255,255,255,0.8)] backdrop-blur-md"
        style={{ left: `${sliderPos}%` }}
        animate={{
          boxShadow: [
            "0 0 20px rgba(59, 130, 246, 0.7)",
            "0 0 50px rgba(168, 85, 247, 0.7)",
            "0 0 20px rgba(236, 72, 153, 0.7)"
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-10 h-10 rounded-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
        </div>
      </motion.div>

      {/* Interaction Hint styled with Premium Glassmorphism */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/50 dark:bg-black/30 border border-white/20 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--fg)] rounded-full z-30 pointer-events-none group-hover:opacity-0 transition-opacity duration-300 backdrop-blur-md">
        Slide to Refract
      </div>
    </motion.div>
  );
};
const SceneRecap = ({ chunk }: { chunk: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] mb-8"
  >
    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-2">
      <MorphZap size={14} /> Previously Refracted
    </p>
    <p className="text-slate-300 italic font-medium">"...{chunk.summary}"</p>
  </motion.div>
);
const BionicText = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <>
      {text.split(' ').map((word, i) => {
        const mid = Math.ceil(word.length / 2);
        const bold = word.slice(0, mid);
        const rest = word.slice(mid);
        return <span key={i} className="inline-block mr-1"><span className="font-black text-[var(--fg)]">{bold}</span><span className="opacity-70">{rest}</span></span>;
      })}
    </>
  );
};
const NeuroMirrorText = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <div className="flex flex-wrap gap-x-1 overflow-hidden p-4">
      {text.split(' ').map((word, i) => (
        <motion.span key={i} animate={{ x: [0, Math.random() * 2 - 1, 0], y: [0, Math.random() * 2 - 1, 0], opacity: [1, 0.7, 1], filter: [`blur(0px)`, `blur(${Math.random() > 0.8 ? '2px' : '0px'})`, `blur(0px)`] }} transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" }} className="inline-block text-lg md:text-xl font-medium text-slate-400 select-none">{word}</motion.span>
      ))}
    </div>
  );
};
const NeuralRhythmBreak = ({ level, onComplete }: { level: number, onComplete: () => void }) => {
  const [seconds, setSeconds] = useState(level === 1 ? 15 : level === 2 ? 30 : 60);
  const [puzzleState, setLazyPuzzle] = useState<number[]>([]);
  const [solvedCount, setSolvedCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => (s <= 1 ? 0 : s - 1));
    }, 1000);
    if (level === 3) {
      setLazyPuzzle([...Array(8)].map((_, i) => i % 4).sort(() => Math.random() - 0.5));
    }
    return () => clearInterval(timer);
  }, [level]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] apple-glass-dark flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center space-y-12">
        <div className="space-y-4">
          <p className="text-blue-400 font-black uppercase tracking-[0.5em] text-[10px]">Neural Rhythm: Level {level}</p>
          <h2 className="text-5xl md:text-7xl font-black italic text-[var(--fg)] tracking-tighter">
            {level === 1 ? "Neural Blink" : level === 2 ? "Sovereign Breath" : "Dopamine Anchor"}
          </h2>
        </div>
        <div className="relative h-48 flex items-center justify-center">
           {level === 1 && (
             <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
           )}
           {level === 2 && (
             <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-32 h-32 border-4 border-blue-500/30 rounded-3xl flex items-center justify-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-xl" />
             </motion.div>
           )}
           {level === 3 && (
             <div className="grid grid-cols-4 gap-3">
               {puzzleState.map((val, i) => (
                 <motion.button whileHover={{ scale: 1.1 }} onClick={() => setSolvedCount(s => s + 1)} key={i} className="w-12 h-12 bg-[var(--bg)]/5 rounded-xl border border-white/10 flex items-center justify-center text-[var(--fg)] font-black">{val}</motion.button>
               ))}
             </div>
           )}
           <div className="absolute text-6xl font-black tabular-nums text-[var(--fg)]/20">{seconds}s</div>
        </div>
        <div className="space-y-6">
          <p className="text-slate-400 text-lg font-medium">
            {level === 1 ? "Look away from the screen. Find a distant object and focus on it for 15 seconds." :
             level === 2 ? "Follow the expanding square. Inhale as it grows, exhale as it shrinks. Regulate your sovereignty." :
             "Refresh your cognitive interest. Tap the numbers in any order to anchor your dopamine."}
          </p>
          {seconds === 0 && (
            <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={onComplete} className="w-full bg-[var(--bg)] text-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all">Resume Mission</motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
const GlassShard = ({ color, mousePos, i }: { color: string, mousePos: { x: number, y: number }, i: number }) => (
  <motion.div
    animate={{
      rotate: [0, 360],
      x: [0, Math.random() * 20 - 10, 0],
      y: [0, Math.random() * 20 - 10, 0],
    }}
    transition={{ duration: 15 + i * 2, repeat: Infinity, ease: "linear" }}
    style={{
      position: 'absolute',
      width: '0',
      height: '0',
      borderLeft: '10px solid transparent',
      borderRight: '10px solid transparent',
      borderBottom: `20px solid ${color}11`,
      left: `${15 + i * 15}%`,
      top: `${20 + (i % 4) * 20}%`,
      filter: 'blur(1px)',
      x: (mousePos.x - 1000) * (0.02 + i * 0.01),
      y: (mousePos.y - 500) * (0.02 + i * 0.01),
      willChange: 'transform',
    }}
  />
);
const NeuralSparks = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 600,
            y: (Math.random() - 0.5) * 600,
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: i * 0.05 }}
          className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"
        />
      ))}
    </div>
  );
};
const RefractiveNeuralCore = ({ loading, inputLength, isVictorious, user, mousePos, focusMode }: { loading: boolean, inputLength: number, isVictorious: boolean, user: any, mousePos: {x:number, y:number}, focusMode: string }) => {
  const isTyping = inputLength > 0;
  const isLong = inputLength > 500;
  const duration = loading ? 0.3 : isTyping ? (isLong ? 0.5 : 1) : 3;
  const scale = loading ? [1, 1.3, 1] : isTyping ? [1, 1.15, 1] : [1, 1.05, 1];
  const glowOpacity = isVictorious && user ? 0.8 : (loading || isTyping ? 0.5 : 0.2);
  const color = isVictorious && user ? "from-amber-400 via-yellow-300 to-amber-500" : (focusMode === 'sovereign' ? "from-slate-700 via-slate-800 to-slate-900" : "from-blue-500 via-purple-600 to-blue-400");

  return (
    <div className="relative">
      <motion.div
        animate={{
          rotate: loading ? [0, 10, -10, 0] : [0, 5, -5, 0],
          scale: scale,
          x: (mousePos.x - (typeof window !== 'undefined' ? window.innerWidth/2 : 0)) * 0.02,
          y: (mousePos.y - (typeof window !== 'undefined' ? window.innerHeight/2 : 0)) * 0.02
        }}
        transition={{ repeat: Infinity, duration: duration, ease: "easeInOut" }}
        className={`relative mx-auto w-28 h-28 md:w-44 md:h-44 bg-gradient-to-br ${color} text-[var(--fg)] rounded-[3rem] md:rounded-[5rem] flex items-center justify-center border-2 border-white/20 shadow-[0_0_100px_rgba(59,130,246,${glowOpacity})] transition-all duration-1000 z-10`}
      >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="cursor-pointer"
      >
        <NeuralCore state={isVictorious && user ? 'success' : 'dormant'} />
      </motion.div>
      {/* Refractive Shards around the core */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            rotate: [i * 45, i * 45 + 360],
            scale: loading ? [1, 1.5, 1] : [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-8 md:w-3 md:h-12 bg-[var(--bg)]/20 blur-[1px] rounded-full"
            style={{
              transform: `translateY(-${isTyping ? 60 : 40}px) rotate(${i * 45}deg)`,
              opacity: focusMode === 'sovereign' ? 0.1 : 0.4
            }}
          />
        </motion.div>
      ))}
      <NeuralSparks active={loading || (isTyping && focusMode === 'dastastic')} />
      {isVictorious && user && (<motion.div animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-amber-400/20 rounded-full blur-3xl -z-10" />)}
    </motion.div>
  </div>
);
};
const DIVINE_INSIGHTS = [
  "Commit your work to the Lord, and your plans will be established. - Proverbs 16:3",
  "For I know the plans I have for you, declares the Lord. - Jeremiah 29:11",
  "I can do all things through Christ who strengthens me. - Philippians 4:13",
  "He gives power to the faint, and to him who has no might he increases strength. - Isaiah 40:29"
];
const getIsSunday = () => new Date().getDay() === 0;
const getDailyInsight = () => DIVINE_INSIGHTS[new Date().getDate() % DIVINE_INSIGHTS.length];
const CerebralRecap = ({ data, onFinish }: { data: any, onFinish: () => void }) => {
  if (!data) return null;
  const wordCount = data.chunks.reduce((acc: number, chunk: any) => acc + (chunk.original?.length || 0), 0) / 5; // Approx
  const isSunday = getIsSunday();
  const dailyInsight = getDailyInsight();

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[1100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-[var(--bg)] border-2 border-amber-500/30 p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_100px_rgba(245,158,11,0.2)] text-center space-y-6 md:space-y-8 max-h-[90dvh] overflow-y-auto no-scrollbar"
      >
        <div className="mx-auto w-16 h-16 md:w-24 md:h-24 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
          <Trophy size={32} />
        </div>

        <div className="space-y-1">
          <p className="text-amber-400 font-black uppercase tracking-[0.4em] text-[8px] md:text-[10px]">Mission Accomplished</p>
          <h2 className="text-2xl md:text-5xl font-black text-[var(--fg)] italic tracking-tighter leading-tight">CEREBRAL RECAP</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-[var(--bg)]/5 p-3 md:p-4 rounded-2xl border border-white/10 text-left">
            <p className="text-[7px] md:text-[8px] font-black uppercase text-[var(--fg)] mb-1">Noise Crushed</p>
            <p className="text-sm md:text-xl font-black text-[var(--fg)] italic">~{Math.round(wordCount)} Words</p>
          </div>
          <div className="bg-[var(--bg)]/5 p-3 md:p-4 rounded-2xl border border-white/10 text-left">
            <p className="text-[7px] md:text-[8px] font-black uppercase text-[var(--fg)] mb-1">Time Saved</p>
            <p className="text-sm md:text-xl font-black text-[var(--fg)] italic">{data.readingTime}</p>
          </div>
        </div>
        <div className="bg-amber-500/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-amber-500/20">
          <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-amber-400 mb-2 md:mb-3 italic">{isSunday ? "Sabbath Mode: Divine Insight" : "Divine Insight"}</p>
          <p className="text-xs md:text-sm text-amber-100 font-bold italic leading-relaxed">
            {isSunday ? dailyInsight : '"Inhale clarity. Your sovereignty is established."'}
          </p>
        </div>
        <button
          onClick={onFinish}
          className="w-full bg-[var(--bg)] text-black py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] md:text-sm hover:scale-105 transition-all active:scale-95 shadow-2xl"
        >
          Reclaim Bandwidth
        </button>
      </motion.div>
    </div>
  );
};
const RefractiveTagline = () => {
  const [phase, setPhase] = useState<'noise' | 'flash' | 'clarity'>('noise');
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('flash'), 1000);
    const timer2 = setTimeout(() => setPhase('clarity'), 1300);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);
  const text = "Turn overwhelming noise into clear focus in seconds.";
  return (
    <div className="relative h-12 flex items-center justify-center overflow-hidden">
      <motion.p
        animate={{
          filter: phase === 'noise' ? 'blur(4px)' : 'blur(0px)',
          opacity: phase === 'noise' ? 0.6 : 1,
          x: phase === 'noise' ? [0, -2, 2, -1, 0] : 0,
          scale: phase === 'flash' ? 1.05 : 1
        }}
        transition={{
          x: phase === 'noise' ? { repeat: Infinity, duration: 0.2 } : { duration: 0.2 },
          filter: { duration: 0.5 },
          scale: { duration: 0.2 }
        }}
        className={`text-lg md:text-xl font-bold italic tracking-tight text-center transition-colors duration-500 ${phase === 'clarity' ? 'text-blue-400' : 'text-[var(--fg)]'}`}
      >
        "{text}"
      </motion.p>

      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '200%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-10 w-40 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
          />
        )}
      </AnimatePresence>
      {phase === 'clarity' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1.5 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"
        />
      )}
    </div>
  );
};
const SnakeLightsBackground = ({ mousePos, theme, themeMode, focusMode }: { mousePos: { x: number, y: number }, theme: ThemeMode, themeMode: 'light' | 'dark' | 'system', focusMode: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef(mousePos);
  useEffect(() => { mousePosRef.current = mousePos; }, [mousePos]);
  const t = THEMES[theme] || THEMES.midnight_sovereign;
  const isDark = themeMode === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    : themeMode === 'dark';
  const colors = isDark
    ? (t.dark || { background: '#000', prism: ['#fff'] })
    : (t.light || { background: '#fff', prism: ['#000'] });
  useEffect(() => {
    if (focusMode === 'sovereign') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();
    const gridSize = 30;
    const cols = Math.ceil(width / gridSize);
    const rows = Math.ceil(height / gridSize);
    class Snake {
      segments!: {x: number, y: number}[];
      color!: string;
      direction!: {x: number, y: number};
      timer!: number;
      speed!: number;
      constructor() {
        this.reset();
      }
      reset() {
        this.segments = [{x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows)}];
        this.color = t.prism[Math.floor(Math.random() * t.prism.length)];
        const dirs = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
        this.direction = dirs[Math.floor(Math.random() * dirs.length)];
        this.timer = 0;
        this.speed = 8 + Math.random() * 12;
      }
      update() {
        this.timer++;
        if (this.timer >= this.speed) {
          this.timer = 0;
          const head = this.segments[0];

          if (Math.random() > 0.85) {
             const dirs = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
             this.direction = dirs[Math.floor(Math.random() * dirs.length)];
          }
          const newHead = {
            x: (head.x + this.direction.x + cols) % cols,
            y: (head.y + this.direction.y + rows) % rows
          };
          this.segments.unshift(newHead);
          if (this.segments.length > 8) {
            this.segments.pop();
          }
          // React to mouse
          const dx = (newHead.x * gridSize) - mousePosRef.current.x;
          const dy = (newHead.y * gridSize) - mousePosRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            this.speed = 3; // Speed up near mouse
          } else {
            this.speed = 8 + Math.random() * 5;
          }
        }
      }
      draw() {
        this.segments.forEach((seg, i) => {
          const alpha = (1 - (i / this.segments.length)) * 0.5;
          ctx!.fillStyle = this.color;
          ctx!.globalAlpha = alpha;
          ctx!.shadowBlur = 20;
          ctx!.shadowColor = this.color;
          ctx!.fillRect(seg.x * gridSize + 4, seg.y * gridSize + 4, gridSize - 8, gridSize - 8);
        });
      }
    }
    const snakes = [...Array(18)].map(() => new Snake());
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      snakes.forEach(s => {
        s.update();
        s.draw();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [focusMode, theme]);
  if (focusMode === 'sovereign') return null;
  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${themeMode === 'light' ? 'opacity-40 mix-blend-multiply' : 'opacity-10'}`}
    />
  );
};
export default function Home() {
  const [input, setInput] = useState('');
  const noiseNodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes while Prism is visible
  const [linkedUsers, setLinkedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SimplifiedData | null>(null);
  const [currentChunk, setCurrentChunk] = useState(-1);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [accountTier, setAccountTier] = useState<'individual' | 'family' | 'team' | 'university'>('individual');
  const [isGuardian, setIsGuardian] = useState(false);
  // --- AUTO-SEVER (AUTO-LOGOUT) ---
  useEffect(() => {
    if (!user) return;
    const checkInactivity = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastActivity > AUTO_LOGOUT_TIME) {
        handleLogout();
        alert("Neural Link Severed: For your sovereignty and safety, you have been logged out due to inactivity.");
      }
    };
    const interval = setInterval(checkInactivity, 60000); // Check every minute
    const updateActivity = () => setLastActivity(Date.now());
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') updateActivity();
    };
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, lastActivity]);
  const [isPaid, setIsPaid] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [providerPreference, setProviderPreference] = useState<ProviderPreference>('auto');
  const [aiUsage, setAiUsage] = useState({ totalTokens: 0, provider: 'automatic', model: 'not used yet' });
  const [pendingImage, setPendingImage] = useState<{ data: string; mime: string } | null>(null);
  const [privateSession, setPrivateSession] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [isBionic, setIsBionic] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Scroll Hide Hook
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setNavVisible(currentScrollY < lastScrollY.current || currentScrollY < 50);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [showNeuroMirror, setShowNeuroMirror] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem('dassahs_theme_mode');
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  });
  const [systemIsDark, setSystemIsDark] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const nextSystemIsDark = mediaQuery.matches;
      setSystemIsDark(nextSystemIsDark);
      document.documentElement.classList.toggle('dark', themeMode === 'dark' || (themeMode === 'system' && nextSystemIsDark));
      document.documentElement.classList.toggle('light', themeMode === 'light' || (themeMode === 'system' && !nextSystemIsDark));
    };
    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    localStorage.setItem('dassahs_theme_mode', themeMode);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [themeMode]);
  const [theme, setTheme] = useState<ThemeMode>('sovereign_pulse');
  const [brownNoisePlaying, setBrownNoisePlaying] = useState(false);
  const [mouseFocus, setMouseFocus] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showAbout, setShowAbout] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showNeuralCommand, setShowNeuralCommand] = useState(false);
  const [showNeuralIdentity, setShowNeuralIdentity] = useState(false);
  const [showTOS, setShowTOS] = useState(false);
  const [acceptedTOS, setAcceptedTOS] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dassahs_prism_tos_accepted') === 'true';
    }
    return false;
  });
  const [linkState, setLinkState] = useState<'pending' | 'syncing' | 'revealing' | 'established' | 'severed'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dassahs_prism_tos_accepted') === 'true' ? 'established' : 'pending';
    }
    return 'pending';
  });
  const [syncProgress, setSyncProgress] = useState(0);
  const [starredItems, setStarredItems] = useState<{heading: string, content: string, type: 'metaphor' | 'hook'}[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = JSON.parse(localStorage.getItem('dassahs_neural_vault') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [vaultFilter, setVaultFilter] = useState<'all' | 'hook' | 'metaphor'>('all');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [missionGoal, setMissionGoal] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [contextAnchorOpen, setContextAnchorOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [rewardType, setRewardType] = useState<'none' | 'step' | 'final'>('none');
  const [isScenic, setIsScenic] = useState(false);
  const [simplicityLevel, setSimplicityLevel] = useState<'concise' | 'standard' | 'detailed'>(() => {
    if (typeof window === 'undefined') return 'standard';
    const saved = localStorage.getItem('dassahs_simplicity_level');
    return saved === 'concise' || saved === 'detailed' ? saved : 'standard';
  });
  const [focusMode, setFocusMode] = useState<'dastastic' | 'sovereign'>(() => {
    if (typeof window === 'undefined') return 'dastastic';
    return localStorage.getItem('dassahs_focus_mode') === 'sovereign' ? 'sovereign' : 'dastastic';
  });
  useEffect(() => { localStorage.setItem('dassahs_simplicity_level', simplicityLevel); }, [simplicityLevel]);
  useEffect(() => { localStorage.setItem('dassahs_focus_mode', focusMode); }, [focusMode]);
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenNeuralGuide');
    if (!hasSeenGuide) {
      setTutorialStep(0);
      setShowTutorial(true);
    }
  }, []);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const brownNoiseRef = useRef<any>(null);
  const premiumAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (brownNoisePlaying) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      void ctx.resume();
      const bufferSize = 4096;
      let lastOut = 0.0;
      const node = ctx.createScriptProcessor(bufferSize, 1, 1);

      node.onaudioprocess = (e: any) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          out[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = out[i];
          out[i] *= 3.5;
        }
      };
      node.connect(ctx.destination);
      brownNoiseRef.current = node;
    } else {
      if (brownNoiseRef.current) {
        brownNoiseRef.current.disconnect();
        brownNoiseRef.current = null;
      }
      // Note: We keep the audioCtx open so it can be reused.
    }
  }, [brownNoisePlaying]);
  const [dassahPoints, setDassahPoints] = useState(0);
  const [totalWordsRefracted, setTotalWordsRefracted] = useState(0);
  const [totalMinutesSaved, setTotalMinutesSaved] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [isZenLocked, setIsZenLocked] = useState(false);
  const [isGreyedOut, setIsGreyedOut] = useState(false);
  const [storyMode, setStoryMode] = useState(false);
  const [showMissionBrief, setShowMissionBrief] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [breakLevel, setBreakLevel] = useState(1);
  const [showRecap, setShowRecap] = useState(false);
  const [sensoryProfile, setSensoryProfile] = useState('Calm');
  const [voiceSetting, setVoiceSetting] = useState('Standard');
  const [voiceMood, setVoiceMood] = useState('focused');
  const selectedVoicePreset = voiceMood === 'encouraging' ? 'Encouraging' : voiceSetting;
  const [oneClickRecap, setOneClickRecap] = useState<string | null>(null);
  const handleOneClickRecap = () => {
    if (!data || currentChunk < 0) return;
    const previousChunks = data.chunks.slice(Math.max(0, currentChunk - 1), currentChunk + 1);
    const recapText = previousChunks.map(c => c.summary).join(' ');
    setOneClickRecap(recapText);
    setTimeout(() => setOneClickRecap(null), 8000);
  };
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // In seconds
  const [streakCount, setStreakCount] = useState(0);
  const [lastRefractDate, setLastRefractDate] = useState<string | null>(null);
  const [neuralRhythm, setNeuralRhythm] = useState(true);
  const [isScholarMode, setIsScholarMode] = useState(false);
  const [isFidgetModeActive, setIsFidgetModeActive] = useState(false);
  const [showGuardianCenter, setShowGuardianCenter] = useState(false);
  const [ltiConnected, setLtiConnected] = useState(false);
  const [showLogicRoot, setShowLogicRoot] = useState<Record<number, boolean>>({});
  const toggleLogicRoot = (idx: number) => {
    setShowLogicRoot(prev => ({ ...prev, [idx]: !prev[idx] }));
  };
  const toggleTask = (taskIndex: number) => {
    const key = `${data?.id || 'current'}-${taskIndex}`;
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
    if (!completedTasks[key]) {
      setDassahPoints(p => p + 5); // Reward for action
    }
  };
  const currentActions = data?.actions ?? [];
  const completedActionCount = currentActions.filter((_, index) => completedTasks[`${data?.id || 'current'}-${index}`]).length;
  const allActionsComplete = currentActions.length > 0 && completedActionCount === currentActions.length;
  const sealMission = () => {
    setRewardType('final');
    setTimeout(() => {
      setShowRecap(true);
      handleReset();
    }, 3000);
  };
  // Neural Streak Logic
  useEffect(() => {
    const savedStreak = parseInt(localStorage.getItem('dassahs_neural_streak') || '0');
    const savedDate = localStorage.getItem('dassahs_last_refract_date');
    setStreakCount(savedStreak);
    setLastRefractDate(savedDate);

    // Check if streak is broken (more than 48 hours)
    if (savedDate) {
      const now = new Date();
      const last = new Date(savedDate);
      const diff = now.getTime() - last.getTime();
      if (diff > 48 * 60 * 60 * 1000) {
        setStreakCount(0);
        localStorage.setItem('dassahs_neural_streak', '0');
      }
    }
  }, []);
  const updateStreak = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (lastRefractDate !== today) {
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      setLastRefractDate(today);
      localStorage.setItem('dassahs_neural_streak', newStreak.toString());
      localStorage.setItem('dassahs_last_refract_date', today);
    }
  };
  // Focus Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      // Optional: Add a gentle end-of-timer sound
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);
  const addTime = (minutes: number) => {
    setTimeLeft(prev => prev + minutes * 60);
    setTimerActive(true);
  };
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key.toLowerCase() === 't') {
        setIsBionic(prev => !prev);
      }
      if (e.key.toLowerCase() === 's') {
        setFocusMode(prev => prev === 'dastastic' ? 'sovereign' : 'dastastic');
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);
  const loadHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setHistory(data);
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  };
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      if (data) {
        setIsPaid(data.is_paid || false);
        setAvatarUrl(data.avatar_url || null);
        setDassahPoints(data.points || 0);
        setTotalWordsRefracted(data.words_refracted || 0);
        setTotalMinutesSaved(data.minutes_saved || 0);
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
  };
  const CATCHPHRASES = [
    "Neural Link Established",
    "Cognitive Clarity Achieved",
    "Executive Function Engaged",
    "Noise Refracted",
    "Divine Focus Locked",
    "Bandwidth Reclaimed",
    "Sovereignty Restored"
  ];
  const currentCatchphrase = useMemo(() => CATCHPHRASES[Math.floor(Math.random() * CATCHPHRASES.length)], [rewardType]);
  // Neural Snapshot - Auto Save
  useEffect(() => {
    if (data && currentChunk >= -1) {
      const snapshot = {
        data,
        currentChunk,
        input,
        missionGoal,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('dassahs_neural_snapshot', JSON.stringify(snapshot));
    }
  }, [data, currentChunk, input, missionGoal]);
  const handleResumeSnapshot = () => {

    const saved = localStorage.getItem('dassahs_neural_snapshot');
    if (saved) {
      const { data: savedData, currentChunk: savedChunk, input: savedInput, missionGoal: savedGoal } = JSON.parse(saved);
      setData(savedData);
      setCurrentChunk(savedChunk);
      setInput(savedInput);
      setMissionGoal(savedGoal);
      setRewardType('step');
      setTimeout(() => setRewardType('none'), 2000);
    }
  };
  const DEFAULT_AVATARS = [
    { id: 'spark', icon: <Sparkles className="text-amber-400" />, label: 'The Spark' },
    { id: 'prism', icon: <Palette className="text-blue-400" />, label: 'The Prism' },
    { id: 'shield', icon: <Shield className="text-emerald-400" />, label: 'The Shield' },
    { id: 'brain', icon: <MorphBrain className="text-[var(--accent)]" />, label: 'The Core' },
    { id: 'crown', icon: <Crown className="text-yellow-500" />, label: 'The Sovereign' },
  ];
  const handleAvatarSelect = async (url: string) => {
    if (!user) return;
    setAvatarUrl(url);
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
  };
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      handleAvatarSelect(publicUrl);
    } catch (err) { alert("Failed to upload neural image."); } finally { setUploadingAvatar(false); }
  };
  const handleToggleStar = (item: {heading: string, content: string, type: 'metaphor' | 'hook'}) => {

    setStarredItems(prev => {
      const exists = prev.find(i => i.content === item.content && i.type === item.type);
      if (exists) return prev.filter(i => !(i.content === item.content && i.type === item.type));
      return [...prev, item];
    });
  };
  const clearDopamineVault = () => {
    if (starredItems.length === 0) return;
    if (window.confirm('Clear all saved metaphors and dopamine hooks from your Dopamine Vault?')) {
      setStarredItems([]);
    }
  };
  const visibleVaultItems = vaultFilter === 'all' ? starredItems : starredItems.filter(item => item.type === vaultFilter);
  const handleEstablishLink = async () => {

    setLinkState('syncing');

    // Animate sync progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(async () => {
          setLinkState('revealing');
          // Wait for PortalReveal animation to play
          setTimeout(async () => {
            localStorage.setItem('dassahs_prism_tos_accepted', 'true');

            // Server-side proof of acceptance for authenticated users
            if (user) {
              await supabase.from('profiles').update({
                terms_accepted_at: new Date().toISOString()
              }).eq('id', user.id);
            }
            setAcceptedTOS(true);
            setLinkState('established');
            setShowTOS(false);
            // High speed celebrate particles
            setRewardType('final');
            setTimeout(() => setRewardType('none'), 3000);
          }, 4000); // Wait for the reveal to complete
        }, 800);
      }
      setSyncProgress(progress);
    }, 200);
  };
  useEffect(() => {
    localStorage.setItem('dassahs_neural_vault', JSON.stringify(starredItems));
  }, [starredItems]);
  useEffect(() => {
    if (linkState === 'established' && !localStorage.getItem('hasSeenNeuralGuide')) {
      setTimeout(() => {
        setShowTutorial(true);
      }, 2000);
    }
  }, [linkState]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && localStorage.getItem('dassahs_prism_tos_accepted') !== 'true') {
        setAcceptedTOS(false);
        setShowTOS(true);
        setLinkState('pending');
      }
      setUser(session?.user ?? null);
      if (session?.user) {
        loadHistory(session.user.id);
        loadProfile(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && localStorage.getItem('dassahs_prism_tos_accepted') !== 'true') {
        setAcceptedTOS(false);
        setShowTOS(true);
        setLinkState('pending');
      }
      setUser(session?.user ?? null);
      if (session?.user) {
        loadHistory(session.user.id);
        loadProfile(session.user.id);
      } else {
        setHistory([]);
        setIsPaid(false);
      }
    });
    setUsageCount(parseInt(localStorage.getItem('dassahs_prism_usage') || '0'));
    setProviderPreference((localStorage.getItem('dassahs_provider_preference') as ProviderPreference) || 'auto');
    setAiUsage({ totalTokens: parseInt(localStorage.getItem('dassahs_ai_tokens') || '0'), provider: localStorage.getItem('dassahs_ai_provider') || 'automatic', model: localStorage.getItem('dassahs_ai_model') || 'not used yet' });
    const urlParams = new URLSearchParams(window.location.search);
    const textParam = urlParams.get('text');
    const shareIdParam = urlParams.get('share_id');
    const extensionText = sessionStorage.getItem('prism_pending_document');
    if (extensionText) {
      sessionStorage.removeItem('prism_pending_document');
      setInput(extensionText);
    } else if (textParam) {
      setInput(decodeURIComponent(textParam));
      handleSimplify(decodeURIComponent(textParam));
      window.history.replaceState({}, document.title, "/");
    } else if (shareIdParam) {
      const fetchShared = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/share?id=${shareIdParam}`);
          const result = await res.json();
          if (result.data) {
            setData(result.data);
            setCurrentChunk(-1);
            setShareId(shareIdParam);
          }
        } catch (e) {
          console.error("Failed to load shared Prism");
        } finally {
          setLoading(false);
        }
      };
      fetchShared();
      window.history.replaceState({}, document.title, "/");
    }
    return () => subscription.unsubscribe();
  }, []);
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInput.trim()) return;

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackInput, userId: user?.id, email: user?.email })
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSuccess(false);
        setFeedbackInput('');
      }, 3000);
    } catch (err) {
      alert("Feedback vault failed. Try again!");
    }
  };
  const handleLoadExample = () => {

    const exampleNoise = "This is a very long and confusing sentence that just keeps going and going and your brain might start to wander off because there is no clear structure or path for your eyes to follow and it just feels like a wall of text. It's filled with unnecessary jargon and complex clauses that are designed to overwhelm the reader rather than provide clarity. By the time you reach the end, you've forgotten how it started, and the 'Sovereign Core' of the message is lost in a sea of cognitive noise.";
    setInput(exampleNoise);
    setRewardType('step');
    setTimeout(() => setRewardType('none'), 2000);
  };
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (data && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [data]);
  const handleSimplify = async (textToSimplify = input) => {
     if (!textToSimplify.trim() && !pendingImage) return;
    // --- SENSITIVITY CHECK ---
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
    const privateKeyPattern = /-----BEGIN [A-Z ]*PRIVATE KEY-----|sk-[a-zA-Z0-9_-]{20,}|AIza[a-zA-Z0-9_-]{20,}/;
    const sensitiveKeyword = /password|secret|api key|access token|bank account|medical record|患者|diagnosis/i;

    if (!pendingImage && (ssnPattern.test(textToSimplify) || privateKeyPattern.test(textToSimplify) || (textToSimplify.length < 120 && sensitiveKeyword.test(textToSimplify)))) {
      if (!confirm("SOVEREIGN PRIVACY WARNING: This text may contain a password, API key, identity number, financial detail, or medical information. It will be sent to the configured AI provider for refraction. Remove secrets first, or choose Cancel.")) {
        return;
      }
    }
    const BILLING_ENABLED = false;
    const limit = user ? 30 : 10;
    if (BILLING_ENABLED && usageCount >= limit && !isPaid) { setShowPaywall(true); return; }

    setLoading(true);
    setData(null); // CLEAR PREVIOUS DATA TO FORCE NEW DISCERNMENT UI
    setShareId(null);

    // --- AUTOMATIC CHUNKING ---
    const MAX_CHUNK_SIZE = 2000;
    const chunks = [];
    if (pendingImage) chunks.push('Image input');
    else for (let i = 0; i < textToSimplify.length; i += MAX_CHUNK_SIZE) chunks.push(textToSimplify.slice(i, i + MAX_CHUNK_SIZE));

    try {
      const cognitiveMode = focusMode === 'sovereign' ? 'ceo' : 'adhd';

      // Process chunks and reassemble
      const results = await Promise.all(chunks.map(async (chunk) => {
        const res = await fetch('/api/simplify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: chunk,
            isScenic,
            cognitiveMode,
            missionGoal,
            isStory: storyMode,
            simplicityLevel,
            preferredProvider: providerPreference,
            imageData: pendingImage?.data,
            imageMimeType: pendingImage?.mime
          })
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error || `The ${providerPreference === 'auto' ? 'automatic' : providerPreference} route is unavailable. Please try again.`);
        return payload;
      }));

      // Reassemble the result
      const result = results.reduce((acc, curr) => ({
        ...curr,
        tldr: [...(acc.tldr || []), ...(curr.tldr || [])],
        chunks: [...(acc.chunks || []), ...(curr.chunks || [])],
        actions: [...(acc.actions || []), ...(curr.actions || [])],
        // Merge readingTime if applicable, etc.
      }));

      setCompletedTasks({});
      setData(result);
      setPendingImage(null);

      // Update Bandwidth Stats
      const wordCount = textToSimplify.trim().split(/\s+/).length;
      const minutesSaved = parseInt(result.readingTime) || 1;

      setTotalWordsRefracted(prev => {
        const next = prev + wordCount;
        localStorage.setItem('total_words_refracted', next.toString());
        return next;
      });
      setTotalMinutesSaved(prev => {
        const next = prev + minutesSaved;
        localStorage.setItem('total_minutes_saved', next.toString());
        return next;
      });

      updateStreak();

      const title = result.tldr[0].slice(0, 30) + '...';
      if (user && !privateSession) { await supabase.from('history').insert({ user_id: user.id, title, data: result }); loadHistory(user.id); }
      setUsageCount(prev => { const next = prev + 1; localStorage.setItem('dassahs_prism_usage', next.toString()); return next; });
      setCurrentChunk(-1);
    } catch (err: any) { alert(err.message || 'The Prism encountered a storm!'); } finally { setLoading(false); }
  };
  const handleShare = async () => {
    if (!data) return; setIsSharing(true);
    try {
      let id = shareId;
      if (!id) {
        const title = data.tldr[0].slice(0, 50);
        const res = await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, data, userId: user?.id })
        });
        const result = await res.json();
        id = result.id;
        setShareId(id);
      }

      const shareUrl = `${window.location.origin}/s/${id}`;
      const wordCount = input.trim().split(/\s+/).length;
      const shareText = `I just crushed the noise! ⚡️ Dassah's-Prism refracted ${wordCount.toLocaleString()} words into ${data.readingTime} of pure clarity. Reclaimed ${Math.round(wordCount / 100)}% of my mental bandwidth. 🧠 Join the flow: ${shareUrl}`;
      await navigator.clipboard.writeText(shareText); alert("Victory shared! Link copied to clipboard. 🚀");
    } catch (err) { alert("Could not create share link."); } finally { setIsSharing(false); }
  };
  const handleDownloadSummary = () => {
    if (!data) return;
    const content = `# DASSAH'S PRISM: NEURAL REFRACTION\n\n## THE VISION\n> ${data.whyCare}\n\n## CORE TL;DR\n${data.tldr.map(t => `* **${t}**`).join('\n')}\n\n## PRIORITY ROADMAP\n${data.actions.map(a => `* [ ] **[${a.priority.toUpperCase()}]** ${a.task}`).join('\n')}\n\n---\n*Refracted via Dassah's-Prism. Reclaim your focus.*`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prism_refraction_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const isSunday = getIsSunday();
  const dailyInsight = getDailyInsight();
  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0]; if (!file) return; setLoading(true);
    if (file.size > 10 * 1024 * 1024) { alert('This file is larger than 10 MB. Please split it into smaller parts.'); setLoading(false); return; }

    // Multi-modal image handling
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setPendingImage({ data: base64Image, mime: file.type });
        setInput('Image ready — add an optional goal, then open the Prism to refract it.');
        setLoading(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const pdfjs = await import('pdfjs-dist');
        // Use the same-origin worker from the installed PDF.js 4.x package.
        // Keeping the worker and parser on the same release prevents the
        // "API version does not match Worker version" upload failure.
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const arrayBuffer = await file.arrayBuffer(); const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise; let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i); const textContent = await page.getTextContent();
          const strings = textContent.items.map((item: any) => (item as any).str); fullText += strings.join(' ') + '\n';
        }
        if (fullText.trim()) setInput(fullText); else throw new Error("Could not extract text from PDF.");
      } else {
        const formData = new FormData(); formData.append('file', file);
        const res = await fetch('/api/parse', { method: 'POST', body: formData });
        if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || "Server error"); }
        const result = await res.json(); if (result.text) setInput(result.text);
      }
    } catch (err: any) { alert(`Upload Failed: ${err.message}`); } finally { setLoading(false); }
  };
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (voices.length > 0 && !selectedVoiceId) {
        const defaultVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en_US') || voices[0];
        setSelectedVoiceId(defaultVoice.voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [selectedVoiceId]);
  useEffect(() => {
    document.documentElement.setAttribute('data-sensory-profile', sensoryProfile.toLowerCase());
  }, [sensoryProfile]);

  const completeNeuralGuide = () => {
    localStorage.setItem('hasSeenNeuralGuide', 'true');
    setShowTutorial(false);
    setTutorialStep(0);
  };
  const previewSelectedVoice = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const preview = new SpeechSynthesisUtterance('This is your Prism reading preview. Choose the voice and pace that feels easiest to follow.');
    const voice = availableVoices.find(v => v.voiceURI === selectedVoiceId);
    if (voice) preview.voice = voice;
    const moodSettings = { focused: { rate: 1.0, pitch: 1.0 }, soothing: { rate: 0.82, pitch: 0.92 }, energetic: { rate: 1.12, pitch: 1.08 }, encouraging: { rate: 1.04, pitch: 1.12 } };
    const mood = moodSettings[voiceMood as keyof typeof moodSettings] || moodSettings.focused;
    preview.rate = mood.rate;
    preview.pitch = mood.pitch;
    window.speechSynthesis.speak(preview);
  };
  const handleReadAloud = async (text: string) => {
    if (isPlaying) {
      isPlayingRef.current = false;
      window.speechSynthesis.cancel();
      if (premiumAudioRef.current) {
        premiumAudioRef.current.pause();
        premiumAudioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    if (selectedVoiceId === 'dassah_premium') {
      setIsPlaying(true);
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice_id: voiceSetting.toLowerCase(), mood: voiceMood })
        });
        if (!res.ok) throw new Error("Neural Premium offline");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        premiumAudioRef.current = audio;
        audio.onended = () => { isPlayingRef.current = false; setIsPlaying(false); URL.revokeObjectURL(url); };
        audio.onerror = () => { isPlayingRef.current = false; setIsPlaying(false); URL.revokeObjectURL(url); };
        void audio.play().catch(() => { isPlayingRef.current = false; setIsPlaying(false); URL.revokeObjectURL(url); });
      } catch (e) {
        alert("Neural Premium link failed. Reverting to basic.");
        setIsPlaying(false);
      }
      return;
    }

    // ADHD-Optimized Rhythmic Pacing (The "DJ" Persona)
    const sentences = text.split(/([.!?])/);
    let index = 0;
    isPlayingRef.current = true;
    setIsPlaying(true);
    const speakNext = () => {
      if (index >= sentences.length || !isPlayingRef.current) {
        isPlayingRef.current = false;
        setIsPlaying(false);
        return;
      }
      const fragment = sentences[index] + (sentences[index+1] || '');
      index += 2;
      if (!fragment.trim()) {
        speakNext();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(fragment);

      // Apply Selected Voice
      const voice = availableVoices.find(v => v.voiceURI === selectedVoiceId);
      if (voice) utterance.voice = voice;

      // Variable pacing based on content type
      const moodSettings = { focused: { rate: 1.0, pitch: 1.0 }, soothing: { rate: 0.82, pitch: 0.92 }, energetic: { rate: 1.12, pitch: 1.08 }, encouraging: { rate: 1.04, pitch: 1.12 } };
      const mood = moodSettings[voiceMood as keyof typeof moodSettings] || moodSettings.focused;
      utterance.rate = fragment.includes('"') || fragment.includes('metaphor') ? Math.min(mood.rate, 0.86) : mood.rate;
      utterance.pitch = mood.pitch;
      utterance.onend = () => {
        // Rhythmic pause between fragments
        setTimeout(speakNext, 300);
      };
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  };
  const handleReset = () => {

    setData(null);
    setInput('');
    setCurrentChunk(-1);
    setMissionGoal('');
    setRewardType('none');
    localStorage.removeItem('dassahs_neural_snapshot');
  };
  const handleToggleZenLock = () => {

    if (isZenLocked) {
      const penalty = currentChunk === data?.chunks.length ? 50 : (currentChunk + 1) * 5;
      if (confirm(`Wait! Breaking Hadassah's Lock now costs ${penalty} Dassah Points. Are you sure?`)) {
        setDassahPoints(prev => { const next = Math.max(0, prev - penalty); localStorage.setItem('dassah_points', next.toString()); return next; });
        setIsZenLocked(false); setIsGreyedOut(true); setTimeout(() => setIsGreyedOut(false), 10000);
        if (document.fullscreenElement) document.exitFullscreen();
      }
    } else { setIsZenLocked(true); document.documentElement.requestFullscreen().catch(() => {}); }
  };
  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const newUserMsg = { role: 'user' as const, text: chatInput };
    setChatHistory(prev => [...prev, newUserMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput, history: chatHistory, data, preferredProvider: providerPreference })
      });
      const result = await res.json();
      if (result.usage) {
        setAiUsage(prev => {
          const next = { totalTokens: prev.totalTokens + Number(result.usage.totalTokens || 0), provider: result.usage.provider || prev.provider, model: result.usage.model || prev.model };
          localStorage.setItem('dassahs_ai_tokens', next.totalTokens.toString());
          localStorage.setItem('dassahs_ai_provider', next.provider);
          localStorage.setItem('dassahs_ai_model', next.model);
          return next;
        });
      }
      setChatHistory(prev => [...prev, { role: 'ai' as const, text: result.text }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai' as const, text: "The Neural Link is flickering. Try again." }]);
    } finally {
      setChatLoading(false);
    }
  };
  const handleNext = () => {
    if (data && currentChunk < data.chunks.length) {
      const nextChunk = currentChunk + 1;
      // Infinite 3-6-9 Rhythm Logic
      if (nextChunk > 0 && nextChunk % 3 === 0 && nextChunk < data.chunks.length) {
        // level cycles 1, 2, 3, 1, 2, 3...
        const totalBreaks = nextChunk / 3;
        const level = ((totalBreaks - 1) % 3) + 1;
        setBreakLevel(level);
        setShowBreak(true);
        if (level >= 2) setShowRecap(true);
      }
      setCurrentChunk(nextChunk);
      setRewardType('step');
      setTimeout(() => setRewardType('none'), 2000);
    }
    else if (data && currentChunk === data.chunks.length) {
      setRewardType('final'); setIsZenLocked(false); if (document.fullscreenElement) document.exitFullscreen();
      setDassahPoints(prev => { const next = prev + 10; localStorage.setItem('dassah_points', next.toString()); return next; });
      setTimeout(() => { setShowRecap(true); }, 2000);
    }
  };
  const handleCheckout = async (lookupKey: string) => {
    if (!user) { handleLogin(); return; }

    alert("Initiating Neural Handshake... Synchronizing with Dassah’s Prism. Prepare for unlimited bandwidth.");
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lookup_key: lookupKey, userId: user.id, email: user.email }),
      });
      const result = await res.json();
      if (result.url) {
        window.location.href = result.url; // Redirect to Stripe
      } else {
        throw new Error(result.error || "Neural link failed.");
      }
    } catch (err: any) {
      alert(`Handshake Failed: ${err.message}`);
    }
  };
  const handleLogin = async () => {

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) alert("Neural Link failed: " + error.message);
  };
  const handleInviteUser = async (email: string) => {
    if (!isGuardian) return;
    alert(`Establishing Neural Bridge for ${email}... This user will be linked to your ${accountTier} dashboard.`);
    // In production, this would send an invitation and create a Supabase entry
  };
  const handleLogout = async () => {

    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
    setIsPaid(false);
  };
  const currentTheme = THEMES[theme] || THEMES.midnight_sovereign;
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemIsDark);
  const colors = isDark
    ? (currentTheme.dark || { background: '#000', text: '#fff', accent: '#fff', glass: 'rgba(0,0,0,0.5)', border: 'rgba(255,255,255,0.1)', shadow: 'rgba(0,0,0,0.5)' })
    : (currentTheme.light || { background: '#fff', text: '#000', accent: '#000', glass: 'rgba(255,255,255,0.5)', border: 'rgba(0,0,0,0.1)', shadow: 'rgba(0,0,0,0.1)' });
  const themeStyles = `
    :root {
      --color-bg-1: ${colors.background}; --color-bg-2: ${colors.background};
      --color-bg: ${colors.background}; --bg: ${colors.background};
      --color-text: ${colors.text}; --color-fg: ${colors.text}; --fg: ${colors.text};
      --color-accent: ${colors.accent}; --accent: ${colors.accent};
      --color-glass: ${colors.glass}; --color-border: ${colors.border};
      --color-shadow: ${colors.shadow};
      --color-glass-rgb: ${isDark ? '15, 23, 42' : '255, 255, 255'};
      --color-border-rgb: ${isDark ? '148, 163, 184' : '100, 116, 139'};
      --prism-1: ${currentTheme.prism[0]}; --prism-2: ${currentTheme.prism[1]}; --prism-3: ${currentTheme.prism[2]};
    }
    @keyframes prism-refract { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
    @keyframes neural-gear { 0% { rotate: 0deg; } 100% { rotate: 360deg; } }
    .prism-text {
      background: linear-gradient(110deg, var(--prism-1) 0%, var(--prism-2) 25%, #fff 50%, var(--prism-2) 75%, var(--prism-3) 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: prism-refract 4s linear infinite;
      display: inline-block;
      padding-right: 0.3em;
    }
    .light .prism-brand .brand-prism {
      background: linear-gradient(110deg, #312e81 0%, #7e22ce 24%, #0369a1 48%, #b45309 72%, #312e81 100%);
      background-size: 400% auto;
      animation: prism-refract-light 14s ease-in-out infinite;
    }
    @keyframes prism-refract-light {
      0% { background-position: -220% center; opacity: 0.58; }
      25% { background-position: -40% center; opacity: 1; }
      60% { background-position: 70% center; opacity: 1; }
      84%, 100% { background-image: none; background-position: 100% center; -webkit-text-fill-color: #312e81; opacity: 1; }
    }
    .refractive-border {
      background: var(--color-shadow); border: 2px solid transparent; background-clip: padding-box; position: relative;
    }
    .refractive-border::after {
      content: ''; position: absolute; top: -2px; bottom: -2px; left: -2px; right: -2px;
      background: linear-gradient(135deg, var(--prism-1), transparent, var(--prism-3)); z-index: -1; border-radius: inherit; opacity: 0.3;
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, var(--prism-1), var(--prism-2));
      border-radius: 10px;
      box-shadow: 0 0 10px var(--prism-1);
    }
  `;
  useEffect(() => { setMouseFocus(true); }, []);
  return (
    <>
      <style>{`
        ${themeStyles}
        .scholar-mode {
          filter: grayscale(0.2) contrast(1.1);
        }
        .scholar-mode main {
          background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0) !important;
          background-size: 40px 40px !important;
        }
      `}</style>

      <AnimatePresence>
        {showGuardianCenter && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[1100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full bg-[var(--bg)] border-2 border-red-500/30 p-10 md:p-16 rounded-[4rem] shadow-[0_0_100px_rgba(239,68,68,0.2)] space-y-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-red-500 font-black uppercase tracking-widest text-xs">
                  <ShieldCheck size={24} /> Guardian Control
                </div>
                <button onClick={() => setShowGuardianCenter(false)} className="p-2 hover:bg-[var(--bg)]/5 rounded-full text-[var(--fg)] transition-colors"><X size={24}/></button>
              </div>

              <div className="space-y-6">
                <h2 className="text-4xl font-black text-[var(--fg)] italic tracking-tighter">Sanctuary Control</h2>
                <div className="space-y-4">
                  <div className="p-6 bg-[var(--bg)]/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-[var(--fg)] uppercase tracking-widest">Inactivity Severance</p>
                      <p className="text-[9px] text-[var(--fg)] font-bold uppercase">Auto-logout active (30m)</p>
                    </div>
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  </div>
                  <div className="p-6 bg-[var(--bg)]/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-[var(--fg)] uppercase tracking-widest">Sensitivity Shield</p>
                      <p className="text-[9px] text-[var(--fg)] font-bold uppercase">SSN & Password patterns blocked</p>
                    </div>
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  </div>
                </div>
              </div>
              <button onClick={() => setShowGuardianCenter(false)} className="w-full bg-red-600 py-6 rounded-2xl font-black uppercase tracking-widest text-xs text-[var(--fg)] shadow-xl">Seal Control Center</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRecap && <CerebralRecap data={data} onFinish={() => { setShowRecap(false); handleReset(); }} />}
      </AnimatePresence>
      <AnimatePresence>
      </AnimatePresence>
      <AnimatePresence>
      </AnimatePresence>
      <AnimatePresence>
      </AnimatePresence>
      <AnimatePresence>
        {oneClickRecap && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[500] max-w-lg w-full px-4"><div className="bg-[var(--color-glass)] apple-glass p-6 rounded-[2rem] border border-[var(--color-border)] shadow-2xl flex items-center gap-4"><div className="w-10 h-10 bg-[var(--bg)]/10 rounded-full flex items-center justify-center flex-shrink-0"><Sparkles size={20} className="text-[var(--fg)]" /></div><p className="text-sm font-bold text-[var(--fg)] leading-relaxed italic">"{oneClickRecap}"</p></div></motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {usageCount > 0 && usageCount % 5 === 0 && !localStorage.getItem(`milestone_${usageCount}`) && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none"
            onAnimationComplete={() => localStorage.setItem(`milestone_${usageCount}`, 'true')}
          >
            <div className="bg-gradient-to-br from-amber-400 to-yellow-600 p-10 rounded-[3rem] shadow-[0_0_100px_rgba(245,158,11,0.6)] border-4 border-white/20 flex flex-col items-center gap-4">
              <Trophy size={80} className="text-[var(--fg)] animate-bounce" />
              <div className="text-center text-[var(--fg)]">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Neural Milestone</p>
                <h2 className="text-4xl font-black italic tracking-tighter">LEVEL UP!</h2>
                <p className="text-sm font-bold opacity-90">Focus reclaimed {usageCount} times.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* REMOVED: SUBTLE BRAND SIGNATURE */}
      <main
        onMouseMove={(e) => mouseFocus && setMousePos({ x: e.clientX, y: e.clientY })}
        className={`min-h-screen font-sans flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-[var(--color-accent)]/40 transition-all duration-1000 bg-fixed ${isScholarMode ? 'scholar-mode' : ''} ${isGreyedOut ? 'grayscale sepia contrast-50' : ''}`}
      >
        <div className={`fixed inset-0 -z-10 transition-all duration-1000`} style={{ background: focusMode === 'sovereign' ? '#000' : `radial-gradient(circle at 50% 50%, var(--color-bg-1) 0%, var(--color-bg-2) 100%)` }} />
        {focusMode !== 'sovereign' ? (
          <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `linear-gradient(to right, var(--color-accent) 0.3px, transparent 0.3px), linear-gradient(to bottom, var(--color-accent) 0.3px, transparent 0.3px)`, backgroundSize: '40px 40px' }} />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/5 to-black/15" />
          </div>
        ) : (
          <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0">
             <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
          </div>
        )}
        <SnakeLightsBackground theme={theme} themeMode={themeMode} mousePos={mousePos} focusMode={focusMode} />
        <AnimatePresence>
          {data && currentChunk >= 0 && currentChunk < data.chunks.length && (
            <ContextAnchor data={data} isOpen={contextAnchorOpen} onToggle={() => setContextAnchorOpen(open => !open)} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showBreak && focusMode !== 'sovereign' && (
            <NeuralRhythmBreak level={breakLevel} onComplete={() => {  setShowBreak(false); }} />
          )}
        </AnimatePresence>
        {/* Background Overlay Removed (Moved to Main Layout) */}
      <AnimatePresence>{rewardType !== "none" && focusMode === "dastastic" && (
        <><StarParticles count={rewardType === 'final' ? 100 : 30} isFinal={rewardType === 'final'} /><motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.1 }} className="fixed inset-0 z-[400] flex items-center justify-center pointer-events-none p-4 text-center"><div className="bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-amber-500/90 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_100px_rgba(59,130,246,0.5)] border-2 border-white/20 backdrop-blur-3xl flex flex-col items-center gap-6 max-w-lg w-full"><RefractiveNeuralCore loading={false} inputLength={0} isVictorious={rewardType === 'final'} user={user} mousePos={mousePos} focusMode={focusMode} /><div className="space-y-2"><p className="text-blue-200 font-black uppercase tracking-[0.4em] text-[10px]">{rewardType === 'final' ? "Mission Objective: Complete" : "Neural Link Established"}</p><h2 className="font-black italic text-3xl md:text-5xl text-[var(--fg)] tracking-tighter drop-shadow-2xl">{rewardType === 'final' ? "SOVEREIGNTY RECLAIMED" : currentCatchphrase}</h2></div>{rewardType === 'final' && (<div className="space-y-6 pt-4"><div className="flex gap-6 justify-center"><div className="text-left border-l-2 border-white/20 pl-4"><p className="text-[var(--fg)]/60 text-[8px] font-black uppercase">Rank</p><p className="text-[var(--fg)] font-bold text-base italic">Master Discernor</p></div><div className="text-left border-l-2 border-white/20 pl-4"><p className="text-[var(--fg)]/60 text-[8px] font-black uppercase">Result</p><p className="text-[var(--fg)] font-bold text-base italic">100% Clarity</p></div></div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="bg-[var(--bg)]/5 p-4 rounded-2xl border border-white/10"><p className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Neural Off-Ramp: Transitioning...</p><p className="text-xs text-slate-300 italic">&quot;Inhale clarity. Exhale the mission. Your sovereignty is established.&quot;</p></motion.div></div>)}</div></motion.div></>
      )}</AnimatePresence>
      <div className="fixed top-0 left-0 right-0 z-[110] flex justify-center p-2 md:p-6 pointer-events-none">
        <nav className={`pointer-events-auto flex max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-2xl md:rounded-3xl bg-[var(--color-glass)] backdrop-blur-3xl border border-[var(--color-border)] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-700 ${isZenLocked ? 'opacity-0 -translate-y-20' : 'opacity-100'}`}>
          <button onClick={() => { setShowNeuralCommand(true); }} title="Neural Command" className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-[var(--bg)]/5 text-blue-400 hover:text-[var(--fg)] hover:bg-[var(--bg)]/10 transition-all group">
            <motion.div whileHover={{ scale: 1.2, rotate: 10 }}><Compass size={18} className="md:w-5 md:h-5 transition-transform duration-500" /></motion.div>
          </button>

          <div className="w-[1px] h-6 bg-[var(--bg)]/10 mx-0.5 md:mx-1" />

          <AIUsageControl preference={providerPreference} onPreferenceChange={(value) => { setProviderPreference(value); localStorage.setItem('dassahs_provider_preference', value); }} usage={aiUsage} />
          <button onClick={() => setPrivateSession((current) => !current)} title={privateSession ? 'Private session: results are not saved to your history' : 'Turn on private session'} aria-pressed={privateSession} className={`flex items-center gap-1 rounded-xl px-2 py-2 text-[8px] font-black uppercase tracking-widest transition-all ${privateSession ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-[var(--fg)]/60 hover:text-[var(--fg)]'}`}><Shield size={12} /><span className="hidden md:inline">{privateSession ? 'Private' : 'Save'}</span></button>
          <div className="w-[1px] h-6 bg-[var(--bg)]/10 mx-0.5 md:mx-1" />
          {data && currentChunk >= 0 && (
            <button onClick={handleOneClickRecap} title="Where was I? (Recap)" className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-blue-500/10 text-blue-400 hover:text-[var(--fg)] hover:bg-blue-500/20 transition-all flex items-center gap-2 group">
              <motion.div whileHover={{ scale: 1.2 }}><Sparkles size={18} className="md:w-5 md:h-5 transition-transform" /></motion.div>
              <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Recap</span>
            </button>
          )}
          <div className="w-[1px] h-6 bg-[var(--bg)]/10 mx-0.5 md:mx-1" />
          <button onClick={() => setShowHistory(true)} title="Achieving Vault" className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-[var(--bg)]/5 text-amber-500 hover:text-[var(--fg)] hover:bg-[var(--bg)]/10 transition-all group">
            <motion.div whileHover={{ scale: 1.2, rotate: -10 }}><Clock size={18} className="md:w-5 md:h-5 transition-transform" /></motion.div>
          </button>
          <div className="w-[1px] h-6 bg-[var(--bg)]/10 mx-0.5 md:mx-1" />
          <button onClick={() => { setFocusMode(f => f === "dastastic" ? "sovereign" : "dastastic"); }} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${focusMode === 'sovereign' ? 'bg-amber-500 text-[var(--fg)] shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'text-slate-400 hover:text-[var(--fg)]'}`}>
            {focusMode === 'sovereign' ? <Crown size={12} className="md:w-3.5 md:h-3.5" /> : <Zap size={12} className="md:w-3.5 md:h-3.5" />}
            <span className="hidden xs:block">{focusMode === 'sovereign' ? 'Sov' : 'Das'}</span>
          </button>
          {user ? (
            <button onClick={() => setShowNeuralIdentity(true)} className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl overflow-hidden border-2 border-blue-500/30 hover:border-blue-400 hover:scale-105 transition-all shadow-lg flex items-center justify-center bg-blue-500/10">
              {avatarUrl ? (
                DEFAULT_AVATARS.find(a => a.id === avatarUrl) ? (
                  DEFAULT_AVATARS.find(a => a.id === avatarUrl)?.icon
                ) : (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                )
              ) : user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-blue-400 text-[10px] md:text-xs font-black uppercase">
                  {user.email?.slice(0, 1)}
                </div>
              )}
            </button>
          ) : (
            <button onClick={handleLogin} className="px-4 md:px-6 py-1.5 md:py-2 rounded-xl md:rounded-2xl bg-[var(--color-accent)] text-[var(--fg)] text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all shadow-lg">
              Join
            </button>
          )}
        </nav>
      </div>
      <div className="fixed bottom-4 left-4 z-[125] flex items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-glass)] p-1.5 shadow-xl backdrop-blur-xl" aria-label="Reading appearance">
        <span className="sr-only">Reading appearance</span>
        <button aria-label="Use light reading mode" aria-pressed={themeMode === 'light'} onClick={() => setThemeMode('light')} className={`rounded-xl p-2 transition ${themeMode === 'light' ? 'bg-[var(--bg)] text-[var(--fg)] shadow' : 'text-[var(--fg)]/70 hover:text-[var(--fg)]'}`}><Sun size={14} /></button>
        <button aria-label="Use dark reading mode" aria-pressed={themeMode === 'dark'} onClick={() => setThemeMode('dark')} className={`rounded-xl p-2 transition ${themeMode === 'dark' ? 'bg-[var(--bg)] text-[var(--fg)] shadow' : 'text-[var(--fg)]/70 hover:text-[var(--fg)]'}`}><Moon size={14} /></button>
        <button aria-label="Follow device reading mode" aria-pressed={themeMode === 'system'} onClick={() => setThemeMode('system')} className={`rounded-xl p-2 transition ${themeMode === 'system' ? 'bg-[var(--bg)] text-[var(--fg)] shadow' : 'text-[var(--fg)]/70 hover:text-[var(--fg)]'}`}><Monitor size={14} /></button>
      </div>
      {/* Prism Link (Feedback) */}
      <button onClick={() => setShowFeedback(true)} className={`fixed top-24 left-8 z-[120] p-4 rounded-2xl apple-glass text-[var(--fg)] hover:text-[var(--fg)] hover:bg-[var(--bg)]/10 transition-all opacity-40 hover:opacity-100 group shadow-2xl ${focusMode === 'sovereign' ? 'hidden' : ''}`}>
        <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageSquare size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
      </button>
      <AnimatePresence>
        {showTOS && user && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[700] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="max-w-lg w-full apple-glass p-7 md:p-10 rounded-[2rem] shadow-2xl">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-400 mb-3">Neural Link Ready</p>
              <h2 className="text-2xl md:text-3xl font-black italic text-[var(--fg)] mb-4">Confirm your Inner Circle access</h2>
              <p className="text-sm leading-relaxed text-[var(--fg)]/80 mb-6">Your account is connected. Review the <a href="/terms" target="_blank" rel="noreferrer" className="text-blue-400 underline underline-offset-4">Neural Terms</a> and <a href="/privacy" target="_blank" rel="noreferrer" className="text-blue-400 underline underline-offset-4">Privacy Shield</a> before continuing.</p>
              <button onClick={handleEstablishLink} className="w-full rounded-2xl bg-[var(--color-accent)] text-[var(--fg)] py-4 text-[10px] font-black uppercase tracking-[0.3em] shadow-lg hover:scale-[1.02] transition-transform">Accept and establish link</button>
              <button onClick={handleLogout} className="w-full mt-3 rounded-2xl border border-white/10 text-[var(--fg)]/70 py-3 text-[9px] font-black uppercase tracking-[0.25em] hover:text-[var(--fg)] transition-colors">Cancel and disconnect</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showNeuralCommand && (
          <div className="fixed inset-0 bg-[var(--bg)]/80 backdrop-blur-2xl z-[600] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-2xl w-full max-h-[90dvh] overflow-y-auto no-scrollbar apple-glass p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl flex flex-col gap-6 md:gap-8 relative">
              <div className="flex justify-between items-center sticky top-0 bg-transparent backdrop-blur-md z-10 pb-4">
                <h2 className="text-xl md:text-2xl font-black text-[var(--fg)] italic flex items-center gap-3 md:gap-4"><Compass className="text-blue-400" /> Neural Command</h2>
                <button onClick={() => { setShowNeuralCommand(false); }} className="p-2 hover:bg-[var(--bg)]/10 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--fg)] mb-4">Sovereign Controls</p>
                    <p className="text-sm leading-relaxed text-[var(--color-text)] mb-4">These controls change how Prism presents information. They do not rewrite the source.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => { setIsBionic(!isBionic); }} title="Bold useful word patterns to make long text easier to scan" aria-pressed={isBionic} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${isBionic ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[var(--bg)]/5 border-transparent text-[var(--fg)]'}`}>
                        <Type size={20} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Bionic Shield</span>
                        <span className="text-center text-[10px] font-medium normal-case tracking-normal text-[var(--color-text)]">Bold scanning cues</span>
                      </button>
                      <button onClick={() => { setNeuralRhythm(!neuralRhythm); }} title="Add gentle pacing and break prompts while you work" aria-pressed={neuralRhythm} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${neuralRhythm ? 'bg-purple-600/20 border-purple-500 text-[var(--accent)]' : 'bg-[var(--bg)]/5 border-transparent text-[var(--fg)]'}`}>
                        <Clock size={20} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Neural Rhythm</span>
                        <span className="text-center text-[10px] font-medium normal-case tracking-normal text-[var(--color-text)]">Pacing and breaks</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--fg)] mb-4 mt-6">Neural Continuity</p>
                    <div className="space-y-3">
                      {localStorage.getItem('dassahs_neural_snapshot') && !data && (
                        <button onClick={() => { setShowNeuralCommand(false); handleResumeSnapshot(); }} className="w-full p-5 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-between group hover:bg-blue-600 hover:border-blue-400 transition-all">
                          <div className="flex items-center gap-4">
                            <Anchor size={20} className="text-blue-400 group-hover:text-[var(--fg)]" />
                            <div className="text-left">
                              <p className="text-xs font-black text-[var(--fg)] uppercase tracking-widest">Resume Mission</p>
                              <p className="text-[8px] text-blue-400/60 group-hover:text-blue-100 font-bold uppercase tracking-tight">Pick up where you left off</p>
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-[var(--fg)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}

                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--fg)]">Visual Spectrum</p>
                        <p className="text-xs text-[var(--color-text)] mt-1">Light, Dark, or System follows your device preference. Current system reading: <strong>{systemIsDark ? 'Dark' : 'Light'}</strong>.</p>
                      </div>
                      <div className="flex gap-1 bg-[var(--bg)]/5 rounded-full p-1 border border-white/10">
                        <button onClick={() => setThemeMode('light')} className={`p-1.5 rounded-full transition-all ${themeMode === 'light' ? 'bg-[var(--bg)] text-slate-900 shadow-lg' : 'text-[var(--fg)] hover:text-[var(--fg)]'}`}><Sun size={12} /></button>
                        <button onClick={() => setThemeMode('dark')} className={`p-1.5 rounded-full transition-all ${themeMode === 'dark' ? 'bg-[var(--bg)] text-[var(--fg)] shadow-lg' : 'text-[var(--fg)] hover:text-[var(--fg)]'}`}><Moon size={12} /></button>
                        <button onClick={() => setThemeMode('system')} className={`p-1.5 rounded-full transition-all ${themeMode === 'system' ? 'bg-[var(--bg)] text-[var(--prism-3)] shadow-lg' : 'text-[var(--fg)] hover:text-[var(--fg)]'}`}><Monitor size={12} /></button>
                      </div>
                    </div>
                    <div className="py-8">
                      <StackedThemeSelector
                        themes={Object.entries(THEMES).map(([id, t]) => ({ id, ...t, stroke: t.dark?.accent || '#8b5cf6' }))}
                        activeTheme={theme}
                        onThemeSelect={(id) => setTheme(id as any)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--fg)] mb-4">Neural Harmonies & Voice</p>
                    <details open className="group">
                      <summary className="cursor-pointer text-[10px] font-bold text-blue-400 hover:text-blue-300">Show Advanced Controls</summary>
                      <div className="pt-4 space-y-4">
                        <button
                          onClick={() => setBrownNoisePlaying(!brownNoisePlaying)}
                          className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${brownNoisePlaying ? 'bg-amber-600/20 border-amber-500 text-amber-400' : 'bg-[var(--bg)]/5 border-transparent text-[var(--fg)]'}`}
                        >
                          <div className="flex items-center gap-4">
                            <Volume2 size={20} className={brownNoisePlaying ? 'animate-pulse' : ''} />
                            <div className="text-left">
                              <p className="text-xs font-black text-[var(--fg)] uppercase tracking-widest">Brown Noise</p>
                              <p className="text-[8px] text-[var(--fg)] group-hover:text-slate-300 font-bold uppercase tracking-tight">Audio Focus Shield</p>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${brownNoisePlaying ? 'bg-amber-400 animate-pulse' : 'bg-[var(--bg)]/10'}`} />
                        </button>
                        <button onClick={() => setShowNeuralIdentity(true)} className="w-full p-5 rounded-2xl flex items-center justify-between bg-[var(--color-glass)] text-[var(--fg)] hover:text-[var(--fg)] border border-[var(--color-border)] transition-all" title="Open Voice Settings in Neural Identity">
                          <div className="flex items-center gap-4">
                            <MorphSettings size={20} />
                            <p className="text-xs font-black text-[var(--fg)] uppercase tracking-widest">Voice Settings</p>
                          </div>
                        </button>
                      </div>
                    </details>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--fg)] mb-4">Adaptive Refraction</p>
                    <p className="text-sm leading-relaxed text-[var(--color-text)] mb-4">Choose how much context you want: Concise is the fastest scan, Standard is balanced, and Detailed keeps more explanation.</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['Concise', 'Standard', 'Detailed'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => setSimplicityLevel(mode.toLowerCase() as any)}
                          className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${simplicityLevel === mode.toLowerCase() ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[var(--bg)]/5 border-transparent text-[var(--fg)]'}`}
                        >
                          <span className="text-[8px] font-black uppercase tracking-tight">{mode}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button onClick={() => { setShowNeuralCommand(false); }} className="px-10 py-3 rounded-full bg-[var(--color-accent)] text-white font-black uppercase tracking-[0.4em] text-[9px] shadow-lg hover:brightness-110 hover:scale-105 transition-all">Engage</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[750] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="contrast-modal max-w-2xl w-full apple-glass p-7 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-blue-500 mb-2">Neural Guide · {tutorialStep + 1} / {NEURAL_GUIDE_STEPS.length}</p>
                  <h2 className="text-2xl md:text-4xl font-black italic text-[var(--fg)]">Learn your Prism</h2>
                </div>
                <Sparkles className="text-amber-400" size={30} />
              </div>
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6 md:p-8 min-h-48">
                <h3 className="text-xl md:text-2xl font-black text-[var(--fg)] mb-3">{NEURAL_GUIDE_STEPS[tutorialStep].title}</h3>
                <p className="text-base md:text-lg leading-relaxed text-[var(--color-text)]">{NEURAL_GUIDE_STEPS[tutorialStep].description}</p>
              </div>
              <div className="flex gap-2 mt-6" aria-label="Guide progress">
                {NEURAL_GUIDE_STEPS.map((step, index) => <div key={step.title} className={`h-2 flex-1 rounded-full ${index <= tutorialStep ? 'bg-blue-500' : 'bg-slate-300/40'}`} />)}
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
                <button onClick={() => setTutorialStep(step => Math.max(0, step - 1))} disabled={tutorialStep === 0} className="px-5 py-3 rounded-xl border border-[var(--color-border)] text-[var(--fg)] font-bold disabled:opacity-30">Back</button>
                {tutorialStep < NEURAL_GUIDE_STEPS.length - 1 ? (
                  <button onClick={() => setTutorialStep(step => step + 1)} className="px-7 py-3 rounded-xl bg-blue-600 text-white font-black">Next: {NEURAL_GUIDE_STEPS[tutorialStep + 1].title}</button>
                ) : (
                  <button onClick={completeNeuralGuide} className="px-7 py-3 rounded-xl bg-emerald-600 text-white font-black">I understand — enter Prism</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showNeuralIdentity && (
          <div className="fixed inset-0 bg-[var(--bg)]/80 backdrop-blur-2xl z-[600] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar apple-glass p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col gap-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-[var(--fg)] italic flex items-center gap-4"><Crown className="text-amber-400" /> Neural Identity</h2>
                <div className="flex gap-3">
                  <div className="bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20 flex items-center gap-2">
                    <Clock className="text-blue-400" size={12}/><span className="font-black text-[var(--fg)] text-[10px]">{totalMinutesSaved}m</span>
                  </div>
                  <div className="bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 flex items-center gap-2">
                    <Brain className="text-[var(--accent)]" size={12}/><span className="font-black text-[var(--fg)] text-[10px]">{totalWordsRefracted.toLocaleString()} Words</span>
                  </div>
                </div>
                <button onClick={() => setShowNeuralIdentity(false)} className="p-2 hover:bg-[var(--bg)]/10 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="bg-[var(--bg)]/5 p-8 rounded-[2rem] border border-white/10 space-y-6">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--fg)]">Sensory Profile</p>
                      <p className="text-sm text-[var(--color-text)] mt-2">Choose how Prism feels while you read. This changes presentation, not the meaning of your document.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {SENSORY_PROFILES.map(profile => (
                        <button
                          key={profile.id}
                          onClick={() => setSensoryProfile(profile.id)}
                          aria-pressed={sensoryProfile === profile.id}
                          className={`p-4 rounded-xl border-2 hover:border-blue-500/50 transition-all text-left ${sensoryProfile === profile.id ? 'bg-blue-600/20 border-blue-500' : 'bg-[var(--bg)]/5 border-transparent'}`}
                        >
                          <span className="flex items-center justify-between text-sm font-black uppercase tracking-widest text-[var(--fg)]">{profile.label}{sensoryProfile === profile.id && <Check size={16} className="text-blue-400" />}</span>
                          <span className="block mt-1 text-xs font-medium normal-case tracking-normal text-[var(--color-text)]">{profile.description}</span>
                        </button>
                      ))}
                    </div>
                    <div className={`sensory-preview sensory-preview-${sensoryProfile.toLowerCase()}`} aria-live="polite">
                      <span className="sensory-preview-sample">Aa</span>
                      <span><strong>{sensoryProfile} preview:</strong> This is how a reading surface feels.</span>
                    </div>
                  </div>
                  <div className="bg-[var(--bg)]/5 p-8 rounded-[2rem] border border-white/10 space-y-6">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--fg)]">Voice Settings</p>
                      <p className="text-sm text-[var(--color-text)] mt-2">Pick one reading pace, one mood, and one device voice. Use Preview before reading a document.</p>
                    </div>
                    <label className="block text-xs font-bold text-[var(--color-text)]">Device voice
                      <select value={selectedVoiceId} onChange={(event) => setSelectedVoiceId(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-glass)] p-3 text-sm text-[var(--fg)]">
                        {availableVoices.length === 0 ? <option value="">Default device voice</option> : availableVoices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}
                      </select>
                    </label>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text)]">Reading preset: <span className="text-blue-400">{selectedVoicePreset}</span></p>
                    <div className="grid grid-cols-2 gap-3">
                      {['Standard', 'Soothing', 'Energetic', 'Encouraging'].map(setting => (
                        <button
                          key={setting}
                          onClick={() => { setVoiceSetting(setting === 'Encouraging' ? 'Standard' : setting); setVoiceMood(setting === 'Standard' ? 'focused' : setting.toLowerCase()); }}
                          aria-pressed={selectedVoicePreset === setting}
                          className={`p-4 rounded-xl border-2 hover:border-blue-500/50 transition-all text-[8px] font-black uppercase tracking-widest ${selectedVoicePreset === setting ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[var(--bg)]/5 border-transparent text-[var(--fg)]'}`}
                        >
                          <span className="flex items-center justify-center gap-2">{setting}{selectedVoicePreset === setting && <Check size={14} />}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={previewSelectedVoice} className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-slate-950 hover:bg-amber-400">▶ Preview selected voice</button>
                  </div>
                  <div className="bg-[var(--bg)]/5 p-8 rounded-[2rem] border border-white/10 space-y-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--fg)]">Fidget Mode</p>
                    <p className="text-sm leading-relaxed text-[var(--color-text)]">Prism Weaver is a soft cursor-following light for restless hands and visual anchoring. It changes no document data and has no effect on phones without a mouse.</p>
                    <button
                      onClick={() => setIsFidgetModeActive(!isFidgetModeActive)}
                      className={`w-full p-4 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all text-[8px] font-black uppercase tracking-widest ${isFidgetModeActive ? 'bg-blue-600/20 text-blue-400' : 'bg-[var(--bg)]/5'}`}
                    >
                      {isFidgetModeActive ? 'Prism Weaver Active' : 'Activate Prism Weaver'}
                    </button>
                  </div>
                  <div className="bg-[var(--bg)]/5 p-8 rounded-[2rem] border border-white/10 space-y-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--fg)]">Neural Vault</p>
                    <button onClick={() => { setShowNeuralIdentity(false); setShowHistory(true); }} className="w-full p-4 rounded-2xl bg-[var(--bg)]/5 border border-white/10 hover:border-blue-500/50 transition-all text-left flex items-center gap-4 group">
                      <Clock className="text-blue-400 group-hover:rotate-[-20deg] transition-transform" size={20} />
                      <div>
                        <p className="text-xs font-bold text-[var(--fg)]">Achieving Vault</p>
                        <p className="text-[8px] font-black uppercase text-[var(--fg)]">Reading History</p>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--fg)]">Dopamine Vault <span className="text-blue-400">· {starredItems.length}</span></p>
                    <button onClick={clearDopamineVault} disabled={starredItems.length === 0} className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 disabled:opacity-30">Clear all</button>
                  </div>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Filter saved highlights">
                    {(['all', 'hook', 'metaphor'] as const).map(filter => <button key={filter} onClick={() => setVaultFilter(filter)} aria-pressed={vaultFilter === filter} className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${vaultFilter === filter ? 'border-blue-500 bg-blue-500/15 text-blue-400' : 'border-[var(--color-border)] text-[var(--color-text)]'}`}>{filter === 'all' ? 'All saved' : filter === 'hook' ? 'Hooks' : 'Metaphors'}</button>)}
                  </div>
                  <div className="bg-[var(--bg)]/5 p-6 rounded-[2.5rem] border border-white/10 min-h-[300px] flex flex-col gap-4">
                    {visibleVaultItems.length === 0 ? (
                      <div className="flex-grow flex flex-col items-center justify-center text-center p-8 opacity-40">
                        <Star size={40} className="mb-4 text-amber-500" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Star only the ideas you want to revisit. Your filtered vault stays focused.</p>
                      </div>
                    ) : (
                      visibleVaultItems.map((item, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2 relative group">
                          <p className="text-[8px] font-black uppercase text-blue-400 tracking-tighter">{item.heading}</p>
                          <p className="text-sm font-bold text-slate-300 italic">"{item.content}"</p>
                          <button onClick={() => handleToggleStar(item)} className="absolute top-2 right-2 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              {user && (
                <div className="pt-4 border-t border-white/5">
                  <button onClick={handleLogout} className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-300 flex items-center gap-2"><LogOut size={14}/> Disconnect Neural Link</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>{showAbout && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[600] flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }} animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }} className="contrast-modal max-w-4xl w-full refractive-border apple-glass p-8 md:p-16 rounded-[3rem] md:rounded-[5rem] shadow-[0_0_150px_rgba(255,255,255,0.1)] relative my-auto overflow-hidden">
            {[...Array(12)].map((_, i) => <GlassShard key={i} i={i} color={currentTheme.prism[i % 3]} mousePos={mousePos} />)}
            <motion.div initial={{ x: '-100%', skewX: -20 }} animate={{ x: '200%' }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />
            <button onClick={() => setShowAbout(false)} className="absolute top-8 right-8 p-4 hover:bg-[var(--bg)]/10 rounded-full text-slate-400 transition-colors z-20"><X size={32}/></button>
            <div className="space-y-12 relative z-10">
              <motion.header style={{ x: (mousePos.x - 1000) * 0.02, y: (mousePos.y - 500) * 0.02 }} className="space-y-4">
                <div className="flex items-center gap-4 text-blue-400 font-black uppercase tracking-[0.3em] text-xs"><div className="w-12 h-[2px] bg-blue-500/50" /> THE HEART OF DASSAH&apos;S-PRISM</div>
                <h2 className="text-4xl md:text-7xl font-black text-[var(--fg)] leading-tight tracking-tight italic pb-6">The <span className="text-[var(--fg)]">Dastastical Founder 🧠✨</span></h2>
              </motion.header>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8 text-slate-200 text-lg leading-relaxed font-medium">
                  <motion.div style={{ y: (mousePos.y - 500) * -0.01, x: (mousePos.x - 1000) * -0.01 }} className="bg-gradient-to-r from-blue-500/10 to-transparent p-8 border-l-4 border-blue-500 rounded-r-3xl shadow-xl">
                    <p>For as long as I can remember, the world hasn&apos;t just been loud; it has been a flood of raw, unfiltered data. From a young age, my mind and body processed every detail with profound intensity. For years, I navigated a world that felt like an overwhelming cacophony, battling the sheer exhaustion of a mind trying to process everything at once. I tried to manage this massive cognitive load on my own strength, but it only ever led to paralysis and defeat.</p>
                  </motion.div>

                  <motion.div style={{ y: (mousePos.y - 500) * 0.02, x: (mousePos.x - 1000) * 0.02 }} className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20 p-10 rounded-[3rem] border-2 border-white/10 italic text-[var(--fg)] shadow-[0_0_50px_rgba(59,130,246,0.2)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
                    <p className="relative z-10 text-xl md:text-2xl leading-relaxed">
                      The turning point was not a clever productivity hack or a sudden surge of willpower. When my mother and I surrendered our lives to Christ, He stepped into the absolute centre of that mental chaos. He didn&apos;t just quiet the room; He rescued me from the weight of my own mind. I realised then that my profound cognitive intensity was not a glitch. It was a high-powered engine that I had simply been running on the wrong fuel.
                    </p>
                  </motion.div>
                  <motion.div style={{ y: (mousePos.y - 500) * -0.015, x: (mousePos.x - 1000) * -0.015 }} className="bg-gradient-to-r from-purple-500/10 to-transparent p-8 border-l-4 border-purple-500 rounded-r-3xl shadow-xl">
                    <p>It was only through His strength that my greatest source of exhaustion was transformed into my most powerful gift. The victory wasn&apos;t that the world stopped being complex; the victory was that He gave me the peace to finally master it. Guided by His grace, I began to channel that intense processing power into &apos;systems thinking&apos;. Suddenly, I could look under the hood of chaotic environments—whether untangling complex partnerships or building outdoor communities—and build structures that brought clarity, all for His glory.</p>
                  </motion.div>

                  <motion.div style={{ y: (mousePos.y - 500) * 0.01, x: (mousePos.x - 1000) * 0.01 }} className="bg-gradient-to-br from-amber-500/10 to-transparent p-10 rounded-[3rem] border-2 border-amber-500/20 shadow-2xl">
                    <p className="text-[var(--fg)] font-bold text-xl leading-relaxed">That is how Dassah&apos;s-Prism was born. It is not merely a tool; it is a living testimony of triumph. Our mission is to empower every neurodivergent soul to reclaim the sovereignty of their focus. We transmute the overwhelming noise of modern information into a purposeful stream of clarity, inviting you to step out of the exhaustion, discover the true purpose of your neurodivergence, and perhaps meet the very Source of this peace.</p>
                    <p className="mt-8 text-3xl font-black italic text-[var(--fg)]">Stay Dastastic! 🌟✨</p>
                  </motion.div>
                </div>
                <div className="space-y-8">
                  <motion.div style={{ y: (mousePos.y - 500) * 0.05, x: (mousePos.x - 1000) * 0.03 }} className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8 rounded-[2.5rem] border-2 border-blue-500/30 relative overflow-hidden group shadow-2xl">
                    <div className="absolute -right-8 -top-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700"><Rocket size={120} /></div>
                    <div className="flex items-center gap-3 text-blue-400 font-black uppercase text-xs tracking-widest mb-6 relative z-10">
                      <Zap size={16} className="text-amber-400 animate-pulse" /> The Final Push
                    </div>

                    <div className="space-y-6 relative z-10">
                      <p className="text-slate-300 italic leading-relaxed">
                        This build became a reality through the sovereign push of two monumental souls:
                      </p>

                      <div className="border-l-4 border-blue-500 pl-6 space-y-2 group/jimmy">
                        <p className="text-[var(--fg)] font-black uppercase tracking-tighter text-xl group-hover:text-blue-400 transition-colors">Eng. Jimmy Njuguna</p>
                        <p className="text-slate-400 text-sm font-bold">
                          The loving support of a brother who <span className="text-blue-400 uppercase">ALWAYS PUSHES FOR THE BEST</span> and challenged me to use my tech knowledge for a greater purpose.
                        </p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-6 space-y-2 group/kizzie">
                        <p className="text-[var(--fg)] font-black uppercase tracking-tighter text-xl group-hover:text-[var(--accent)] transition-colors">Dr. Kizzie Shako</p>
                        <p className="text-slate-400 text-sm font-bold">
                          The mentor encouragement that ignited the fire: <span className="text-[var(--accent)] font-black italic">&quot;THEN DO SOMETHING ABOUT IT!&quot;</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div style={{ y: (mousePos.y - 500) * 0.08, x: (mousePos.x - 1000) * -0.02 }} className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 p-8 rounded-[2.5rem] border-2 border-amber-500/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-10 rotate-[-12deg]"><Crown size={100} /></div>
                    <p className="text-amber-500 font-black uppercase text-[10px] tracking-widest mb-6 relative z-10 flex items-center gap-2"><Trophy size={14} /> Dedication & Legacy</p>
                    <div className="space-y-8 relative z-10">
                      <div className="group border-b border-white/5 pb-4">
                        <p className="text-[var(--fg)] font-black text-sm uppercase tracking-wider mb-2 group-hover:text-amber-400 transition-colors flex items-center gap-2">DChan <Heart size={12} className="fill-red-500 stroke-red-500" /></p>
                        <p className="text-slate-400 text-xs italic leading-relaxed">&quot;He who finds a wife finds a good thing&quot; — My anchor, who centred me and fixed my eyes on Him.</p>
                      </div>
                      <div className="group border-b border-white/5 pb-4">
                        <p className="text-[var(--fg)] font-black text-sm uppercase tracking-wider mb-2">Phido (Mum)</p>
                        <p className="text-slate-400 text-xs leading-relaxed">My foundation, who rooted me in faith so I could stand back up when I fell.</p>
                      </div>
                      <div className="group border-b border-white/5 pb-4">
                        <p className="text-[var(--fg)] font-black text-sm uppercase tracking-wider mb-2">Old, old Cucu</p>
                        <p className="text-slate-400 text-xs leading-relaxed">My roots.</p>
                      </div>
                      <div className="group">
                        <p className="text-[var(--fg)] font-black text-sm uppercase tracking-wider mb-2">Auntie Sisy</p>
                        <p className="text-slate-400 text-xs leading-relaxed">My guide and tread-setter, who kept me grasped to the right path.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
              <footer className="pt-12 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-white/10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl relative group">
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-black p-1 rounded-full shadow-lg group-hover:rotate-12 transition-transform"><Brain size={16} /></div>
                    <span className="text-3xl font-black text-[var(--fg)] italic">JG</span>
                  </div>
                  <div>
                    <p className="text-[var(--fg)] font-black uppercase text-sm tracking-widest">Founded by JGitu</p>
                    <p className="text-[var(--fg)] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                       Powered by Grace <IchthysIcon size={14} className="text-blue-500" />
                    </p>
                  </div>
                </div>
              </footer>

              <div className="pt-8 flex justify-center gap-8 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
                <a href="/privacy" className="text-[9px] font-black uppercase tracking-widest text-[var(--fg)] hover:text-blue-400 transition-colors">Privacy Shield</a>
                <a href="/terms" className="text-[9px] font-black uppercase tracking-widest text-[var(--fg)] hover:text-blue-400 transition-colors">Neural Terms</a>
              </div>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>
      <AnimatePresence>{showMissionBrief && data && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[600] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="contrast-modal max-w-2xl w-full apple-glass border-2 border-blue-500/30 p-10 md:p-16 rounded-[3.5rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setShowMissionBrief(false)} className="absolute top-8 right-8 p-3 hover:bg-[var(--bg)]/10 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
            <div className="space-y-12">
              <div className="flex justify-between items-center">
                <div className="bg-blue-500/10 text-blue-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 w-fit flex items-center gap-3"><Rocket size={18}/> Mission Brief</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-4 border-y border-white/5">
                {[
                  { n: 'DJ', r: 'Sovereign Guide' }
                ].map((a) => (
                  <div key={a.n} className="p-3 bg-[var(--bg)]/5 rounded-xl border border-white/5 text-center flex flex-col items-center justify-center gap-1">
                    <p className="text-[7px] font-black text-blue-400 uppercase tracking-tighter flex items-center gap-1">
                      {a.n} <Fish size={8} className="text-blue-400" />
                    </p>
                    <p className="text-[9px] font-bold text-slate-300 leading-none">{a.r}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h2 className="text-[10px] uppercase tracking-[0.5em] text-blue-400 font-black italic">The Vision</h2>
                <p className="text-3xl md:text-5xl font-black leading-[1.1] text-[var(--fg)] tracking-tight italic">{isBionic ? <BionicText text={data.whyCare} /> : data.whyCare}</p>
              </div>
              <div className="space-y-8">
                <h2 className="text-[10px] uppercase tracking-[0.5em] text-blue-400 font-black italic">Core Refractions</h2>
                <div className="space-y-6">
                  {data.tldr.map((point, i) => (
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} key={i} className="flex items-start group">
                      <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--color-glass)] text-blue-400 flex items-center justify-center font-black mr-6 border border-[var(--color-border)] group-hover:border-blue-500/50 transition-all text-base">{i + 1}</span>
                      <p className="text-lg md:text-xl font-bold text-slate-300 leading-snug">{isBionic ? <BionicText text={point} /> : point}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowMissionBrief(false)} className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs text-[var(--fg)] shadow-xl hover:opacity-80 transition-all active:scale-95">Acknowledge & Return</button>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>
      <AnimatePresence>{showFeedback && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[600] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-md w-full bg-[var(--color-shadow)] border-2 border-amber-500/30 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_0_100px_rgba(245,158,11,0.2)] relative overflow-hidden">
            <button onClick={() => setShowFeedback(false)} className="absolute top-6 right-6 text-[var(--fg)] hover:text-[var(--fg)] transition-colors"><X size={24}/></button>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-amber-400 font-black uppercase tracking-widest text-xs"><MessageSquare size={20} /> Feedback Vault</div>
              <h2 className="text-3xl font-black text-[var(--fg)] italic">How&apos;s the Prism?</h2>
              {feedbackSuccess ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center space-y-4"><div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400"><CheckCircle2 size={32} /></div><p className="text-[var(--fg)] font-bold">Feedback Vaulted!</p></motion.div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <textarea value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)} placeholder="Share your thoughts, bugs, or Grace moments..." className="w-full h-40 p-6 bg-black/20 rounded-2xl border border-[var(--color-border)] text-[var(--fg)] focus:outline-none focus:border-amber-500/50 resize-none font-medium" />
                  <button type="submit" disabled={!feedbackInput.trim()} className="w-full bg-amber-600 hover:bg-amber-500 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50">Submit to DJ</button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>
      {!data ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl lg:max-w-4xl w-full space-y-6 md:space-y-10 z-10 px-4 pt-20 md:pt-24 pb-20">
          <header className="text-center space-y-4 md:space-y-8 relative">
            <h1 className="prism-brand text-5xl md:text-9xl font-black text-[var(--fg)] leading-[1.2] tracking-tight italic">Dassah&apos;s <span className="prism-text brand-prism">Prism</span></h1>
            <RefractiveTagline />
          </header>
          <NeuralRefractionSlider />
          <div className="bg-[var(--color-glass)] backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] border-2 border-white/20 p-2 md:p-3 shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden relative group focus-within:border-blue-500/50 hover:border-white/30 transition-all flex flex-col items-center">
            <div className="pt-4 md:pt-6 pb-2 relative flex flex-col items-center gap-4">
              <RefractiveNeuralCore loading={loading} inputLength={input.length} isVictorious={false} user={user} mousePos={mousePos} focusMode={focusMode} />

              {/* LOW PRESSURE FOCUS TIMER */}
              <div className="flex flex-col items-center gap-2">
                {timerActive ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="flex items-center gap-3 bg-[var(--bg)]/5 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
                      <Clock size={14} className="text-blue-400 animate-pulse" />
                      <span className="text-sm font-black text-[var(--fg)] tabular-nums">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => addTime(5)}
                        className="ml-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 p-1 rounded-lg transition-colors"
                        title="Add 5 Minutes"
                      >
                        <Zap size={12} fill="currentColor" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => addTime(15)}
                    className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--fg)] hover:text-blue-400 transition-colors opacity-40 hover:opacity-100 py-2"
                  >
                    Engage Focus Timer
                  </button>
                )}
              </div>
            </div>
            <div className="w-full relative group">
              {/* Sovereign Goal Floating Input */}
              <div className="absolute top-4 left-6 right-6 z-10">
                <input
                  type="text"
                  value={missionGoal}
                  onChange={(e) => setMissionGoal(e.target.value)}
                  placeholder="Focus Objective (Optional) — what should Prism help you do?"
                  title="Optional: tell Prism what to prioritise in the document"
                  className="w-full bg-[var(--bg)]/5 border border-white/10 p-2 md:p-3 rounded-xl text-[10px] md:text-xs font-bold text-blue-200 placeholder:text-blue-300/20 italic focus:outline-none focus:border-blue-500/40 focus:bg-[var(--bg)]/10 transition-all backdrop-blur-md"
                />
              </div>
              {showNeuroMirror ? (
                <div className="w-full h-48 md:h-80 bg-black/60 rounded-[1.5rem] md:rounded-[2.5rem] overflow-y-auto border border-white/10 pt-16"><NeuroMirrorText text={input || "Paste some text..."} /></div>
              ) : (
                <textarea
                  className="prism-input w-full h-48 md:h-80 pt-16 md:pt-20 p-6 md:p-12 text-base md:text-xl bg-black/40 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-white/20 focus:border-purple-500/40 focus:bg-black/50 transition-all resize-none focus:outline-none placeholder:text-slate-400 text-slate-200 leading-relaxed font-medium"
                  placeholder="Paste the noise here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              )}
            </div>
            <div className="w-full bg-[var(--color-glass)] p-3 md:p-4 rounded-3xl md:rounded-full flex items-center justify-between gap-2 md:gap-4 border border-white/10 shadow-2xl backdrop-blur-3xl">
              <div className="flex items-center gap-1 md:gap-2 pl-2">
              <button onClick={() => { fileInputRef.current?.click(); }} title="Clean Document" className="p-2 md:p-3 text-slate-400 hover:text-[var(--fg)] transition-colors bg-[var(--bg)]/5 rounded-full"><Upload size={16} className="text-blue-500" /></button>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'environment';
                  input.onchange = (e) => handleFileUpload(e);
                  input.click();
                }}
                title="Capture Neural Image"
                className="p-2 md:p-3 text-slate-400 hover:text-[var(--fg)] transition-colors bg-[var(--bg)]/5 rounded-full"
              >
                <Camera size={16} className="text-emerald-500" />
              </button>
              <div className="w-[1px] h-6 bg-[var(--bg)]/10 mx-1" />
              <button onClick={() => setStoryMode(!storyMode)} title={storyMode ? 'Story Mode' : 'Fact Mode'} className={`p-2 md:p-3 rounded-full border transition-all ${storyMode ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-[var(--bg)]/5 border-transparent text-[var(--fg)]'}`}>{storyMode ? <MorphRocket size={16}/> : <Anchor size={16}/>}</button>
              </div>
              <button
                onClick={() => handleSimplify()}
                disabled={loading || (!input.trim() && !pendingImage)}
                className="flex-1 max-w-[200px] bg-gradient-to-r from-fuchsia-600 to-purple-500 hover:from-fuchsia-500 hover:to-purple-400 text-[var(--fg)] py-3 md:py-4 rounded-full font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 text-xs md:text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-[8px] animate-pulse">Neural Bridge Active...</span>
                  </div>
                ) : <><Disc size={16} /> Discern</>}
              </button>
              <div className="flex items-center gap-2 pr-2">
                 <p className="hidden md:block text-[8px] font-black uppercase text-[var(--fg)] tracking-[0.2em]">Ready to Refract</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div ref={resultRef} className="max-w-2xl lg:max-w-3xl w-full pt-24 md:pt-32 pb-20 z-10 px-4">
          <div className="mb-6 md:mb-8 flex justify-end gap-2 md:gap-4">
            <button onClick={() => { setShowMissionBrief(true);  }} className="p-3 md:p-4 bg-[var(--color-glass)] border border-[var(--color-border)] rounded-xl md:rounded-2xl text-blue-400 hover:text-[var(--fg)] transition-all flex items-center gap-2 md:gap-3 font-black uppercase text-[8px] md:text-[10px] tracking-widest"><Rocket size={16}/><span className="hidden xs:inline">Mission Brief</span></button>
            <button onClick={handleDownloadSummary} className="p-3 md:p-4 bg-[var(--color-glass)] border border-[var(--color-border)] rounded-xl md:rounded-2xl text-slate-400 hover:text-[var(--fg)] transition-all flex items-center gap-2 md:gap-3 font-black uppercase text-[8px] md:text-[10px] tracking-widest"><Download size={16}/><span className="hidden xs:inline">Save Summary</span></button>
          </div>          <AnimatePresence mode="wait">
            {currentChunk === -1 ? (
              <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="bg-[var(--color-glass)] backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] border border-[var(--color-border)] text-center space-y-8 shadow-2xl relative overflow-hidden">
                <div className="mx-auto w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 animate-pulse"><Zap size={48} /></div>
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black text-[var(--fg)] italic tracking-tighter">Neural Refraction Complete</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Saved {data.readingTime} of Cognitive Noise</p>
                </div>
                <div className="flex flex-col gap-4">
                  <button onClick={() => { setCurrentChunk(0);  }} className="w-full bg-[var(--color-accent)] py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xl shadow-2xl hover:opacity-80 transition-all active:scale-95">Open the Prism <ArrowRight className="inline ml-4"/></button>
                  <button onClick={() => { setShowMissionBrief(true);  }} className="w-full bg-[var(--bg)]/5 py-4 rounded-xl font-black uppercase tracking-[0.3em] text-[10px] text-slate-400 hover:text-[var(--fg)] transition-all">View Mission Brief</button>
                </div>
                <button onClick={handleReset} className="absolute top-8 right-8 p-4 text-slate-600 hover:text-red-400 transition-all"><X size={20}/></button>
              </motion.div>
            ) : currentChunk === data.chunks.length ? (
              <motion.div key="roadmap" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-[var(--color-glass)] backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] border-2 border-blue-500/30 space-y-12 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="space-y-4">
                    <h2 className="text-[10px] uppercase tracking-[0.5em] text-blue-400 font-black italic">The Roadmap</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-[var(--fg)] tracking-tight italic">Priority Overview</h3>
                  </div>
                  <div className="text-right">
                   <p className="text-xs font-bold text-emerald-400 italic">ROI: {data.readingTime} saved</p>
                  </div>

                </div>
                {data.actions[0] && (
                  <div className="rounded-[2rem] border-2 border-emerald-500/40 bg-emerald-500/10 p-6 md:p-8 shadow-[0_16px_40px_rgba(16,185,129,0.12)]">
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.35em] mb-3"><Zap size={14} /> Start here</div>
                    <p className="text-2xl md:text-3xl font-black text-[var(--fg)] leading-tight">{data.actions[0].task}</p>
                    <button onClick={() => toggleTask(0)} className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-950 hover:bg-emerald-400 transition-colors">Mark next action complete</button>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-widest text-[var(--fg)]/60">
                  <span className="rounded-full border border-[var(--color-border)] px-3 py-2">Source: supplied material</span>
                  <span className="rounded-full border border-[var(--color-border)] px-3 py-2">Route: {aiUsage.provider || 'automatic'}</span>
                  <span className="rounded-full border border-[var(--color-border)] px-3 py-2">Interpretation: review before acting</span>
                  <span className={`rounded-full border px-3 py-2 ${allActionsComplete ? 'border-emerald-500/50 text-emerald-400' : 'border-amber-500/50 text-amber-400'}`}>{completedActionCount} / {data.actions.length} actions confirmed</span>
                </div>
                <div className="space-y-6">
                  {data.actions.map((action, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => toggleTask(i)}
                      className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        completedTasks[`${data.id || 'current'}-${i}`]
                        ? 'bg-emerald-500/10 border-emerald-500/50 opacity-60'
                        : 'bg-black/20 border-white/5 hover:border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          completedTasks[`${data.id || 'current'}-${i}`]
                          ? 'bg-emerald-500 border-emerald-500 text-[var(--fg)]'
                          : 'border-white/20 text-transparent'
                        }`}>
                          <Check size={14} strokeWidth={4} />
                        </div>
                        <p className={`text-lg font-bold transition-all ${
                          completedTasks[`${data.id || 'current'}-${i}`]
                          ? 'text-[var(--fg)] line-through'
                          : 'text-slate-300 group-hover:text-[var(--fg)]'
                        }`}>
                          {action.task}
                        </p>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                        action.priority === 'high' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                        action.priority === 'medium' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
                        'border-blue-500/50 text-blue-400 bg-blue-500/10'
                      }`}>
                        {action.priority}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-12">
                  <button
                    onClick={sealMission}
                    disabled={!allActionsComplete}
                    title={allActionsComplete ? 'Confirm the completed mission' : 'Tick every assigned action before sealing the mission'}
                    className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-500 p-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all active:scale-95 text-[var(--fg)] flex items-center justify-center gap-4 group disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {allActionsComplete ? 'Seal the Mission' : 'Confirm every action'} <ShieldCheck size={24} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
                {isSunday && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 text-center space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Divine Insight: Sabbath Reflection</p>
                    <p className="text-xl font-black italic text-[var(--fg)] leading-relaxed">&quot;{dailyInsight}&quot;</p>
                    <p className="text-[10px] text-[var(--fg)] font-bold uppercase">Reclaimed by Grace. Powered by Him.</p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div key={currentChunk} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0, x: -100 }} className="apple-glass p-10 md:p-16 rounded-[3.5rem] border border-[var(--color-border)] min-h-[600px] flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-10 left-10 flex items-center gap-4">
                  <div className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.5em]">Prism Segment {currentChunk + 1} / {data.chunks.length}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleReadAloud(data.chunks[currentChunk].content)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-amber-500 text-[var(--fg)] shadow-lg animate-pulse' : 'bg-[var(--color-glass)] text-[var(--fg)] hover:text-[var(--fg)] border border-[var(--color-border)]'}`} title="Neural Playback"><Volume2 size={16}/></button>
                    <button onClick={() => setShowNeuralIdentity(true)} className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-glass)] text-[var(--fg)] hover:text-[var(--fg)] border border-[var(--color-border)] transition-all" title="Open Voice Settings in Neural Identity"><MorphSettings size={16}/></button>
                  </div>
                </div>

                <h2 className="text-4xl md:text-6xl font-black mb-4 text-[var(--fg)] tracking-tighter leading-none pt-12">{isBionic ? <BionicText text={data.chunks[currentChunk].heading} /> : data.chunks[currentChunk].heading}</h2>

                {storyMode && showRecap && currentChunk > 0 && (
                  <SceneRecap chunk={data.chunks[currentChunk - 1]} />
                )}

                <div className="mb-8 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl">
                  <p className="text-blue-300 text-xs font-black uppercase tracking-widest mb-1">Segment Snap</p>
                  <p className="text-slate-300 font-bold italic">{isBionic ? <BionicText text={data.chunks[currentChunk].summary} /> : data.chunks[currentChunk].summary}</p>
                </div>
                <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4" role="note">
                  <ShieldCheck className="mt-0.5 shrink-0 text-amber-500" size={20} />
                  <p className="text-sm leading-relaxed text-[var(--color-text)]"><strong className="text-amber-500">Review before acting:</strong> Prism is an AI reading aid, not an authority. Check important facts, legal/medical/financial advice, dates, names, and decisions against the original source or a qualified professional.</p>
                </div>
                <div className="space-y-8 flex-grow">
                  <div className="prism-content bg-blue-500/5 p-8 md:p-12 rounded-[2.5rem] border border-blue-500/10 text-2xl md:text-3xl leading-relaxed font-black text-slate-200 italic shadow-inner">{isBionic ? <BionicText text={data.chunks[currentChunk].content} /> : data.chunks[currentChunk].content}</div>

                  {/* Progress Prism at the bottom of content */}
                  <div className="pt-8">
                    <ProgressPrism progress={(currentChunk + 1) / data.chunks.length} />
                  </div>
                  {data.chartData && currentChunk === 0 && (<div className="bg-[var(--color-glass)] p-10 rounded-[3rem] border border-[var(--color-border)] space-y-6"><div className="flex items-center gap-3 text-blue-400 font-black uppercase tracking-widest text-xs"><BarChart3 size={20} /> Data Pulse</div><div className="h-[250px] w-full"><ResponsiveContainer width="100%" height="100%">{data.chartData.type === 'bar' ? (<BarChart data={data.chartData.data}><XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />{data.chartData.data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}<Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} /></BarChart>) : data.chartData.type === 'line' ? (<LineChart data={data.chartData.data}><XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} /><Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} /></LineChart>) : (<PieChart><Pie data={data.chartData.data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{data.chartData.data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie></PieChart>)}</ResponsiveContainer></div></div>)}                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-amber-500/5 p-8 rounded-[2.5rem] border-2 border-amber-500/10 space-y-4 relative group/card overflow-hidden">
                      <div className="absolute -right-4 -top-4 opacity-5 group-hover/card:scale-110 group-hover/card:rotate-12 transition-transform duration-700 text-amber-500">
                        <Rocket size={120} />
                      </div>
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.2em] text-[10px]"><Rocket size={16} className="animate-pulse" /> Dopamine Hook</div>
                        <button
                          onClick={() => handleToggleStar({ heading: 'Dopamine Hook', content: data.chunks[currentChunk].dopamineHook, type: 'hook' })}
                          className={`p-3 rounded-2xl transition-all shadow-lg ${starredItems.find(i => i.content === data.chunks[currentChunk].dopamineHook && i.type === 'hook') ? 'bg-amber-500 text-[var(--fg)] scale-110 shadow-amber-500/40' : 'bg-[var(--bg)]/5 text-[var(--fg)] hover:text-amber-400 hover:bg-[var(--bg)]/10'}`}
                        >
                          <Star size={18} fill={starredItems.find(i => i.content === data.chunks[currentChunk].dopamineHook && i.type === 'hook') ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <p className="text-xl md:text-2xl font-black text-amber-100 italic leading-tight relative z-10">"{data.chunks[currentChunk].dopamineHook}"</p>
                    </div>

                    <div className="bg-purple-500/5 p-8 rounded-[2.5rem] border-2 border-purple-500/10 space-y-4 relative group/card overflow-hidden">
                      <div className="absolute -right-4 -top-4 opacity-5 group-hover/card:scale-110 group-hover/card:rotate-[-12deg] transition-transform duration-700 text-purple-500">
                        <Brain size={120} />
                      </div>
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3 text-[var(--accent)] font-black uppercase tracking-[0.2em] text-[10px]"><Brain size={16} /> The Metaphor</div>
                        <button
                          onClick={() => handleToggleStar({ heading: 'The Metaphor', content: data.chunks[currentChunk].metaphor, type: 'metaphor' })}
                          className={`p-3 rounded-2xl transition-all shadow-lg ${starredItems.find(i => i.content === data.chunks[currentChunk].metaphor && i.type === 'metaphor') ? 'bg-purple-600 text-[var(--fg)] scale-110 shadow-purple-500/40' : 'bg-[var(--bg)]/5 text-[var(--fg)] hover:text-[var(--accent)] hover:bg-[var(--bg)]/10'}`}
                        >
                          <Star size={18} fill={starredItems.find(i => i.content === data.chunks[currentChunk].metaphor && i.type === 'metaphor') ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <p className="text-xl md:text-2xl font-black text-purple-100 italic leading-tight relative z-10">"{data.chunks[currentChunk].metaphor}"</p>
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex justify-between items-center">
                  <button onClick={() => setCurrentChunk(c => c - 1)} className="px-10 py-6 rounded-2xl font-black uppercase tracking-widest text-[var(--fg)] hover:text-[var(--fg)] transition-all">Back</button>
                  <button onClick={handleNext} className="bg-[var(--bg)] text-black px-16 py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-90">{currentChunk === data.chunks.length - 1 ? 'Next Step' : 'Next Segment'}</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.csv,.pdf,.docx" />
      <AnimatePresence>{showHistory && (<motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-0 bottom-0 w-full sm:w-80 apple-glass z-[120] p-6 md:p-8 border-r border-[var(--color-border)] shadow-2xl overflow-y-auto"><div className="flex justify-between items-center mb-10"><h2 className="font-bold text-xl flex items-center gap-3 text-[var(--fg)]"><Clock size={20} className="text-blue-400" /> Achieving Vault</h2><button onClick={() => setShowHistory(false)} className="p-2 hover:bg-[var(--color-glass)] rounded-full transition-colors"><X size={20} /></button></div><div className="space-y-4">{history.map((item) => (<button key={item.id} onClick={() => { setData(item.data); setCurrentChunk(-1); setShowHistory(false); }} className="w-full text-left p-5 rounded-[1.5rem] apple-glass hover:bg-[var(--bg)]/10 border border-[var(--color-border)] hover:border-blue-500/30 transition-all group"><p className="text-[10px] uppercase tracking-widest text-[var(--fg)] mb-2 font-black">{item.date}</p><p className="text-sm font-bold text-slate-300 group-hover:text-blue-400 line-clamp-2 transition-colors">{item.title}</p></button>))}</div></motion.div>)}</AnimatePresence>
      <AnimatePresence>{showPaywall && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[500] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-[var(--bg)] border-2 border-[var(--color-accent)] p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-center space-y-6 shadow-[0_0_100px_rgba(59,130,246,0.3)] max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="mx-auto w-20 h-20 bg-[var(--color-accent)]/10 rounded-full flex items-center justify-center text-[var(--color-accent)] animate-pulse"><Crown size={40} /></div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--fg)] tracking-tighter italic">{user ? "Neural Capacity Reached" : "Neural Blueprint Fragmenting"}</h2>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed font-medium">
              {user
                ? "You have reached the edge of your current neural bandwidth. Your Executive Distillation has peaked. To maintain this flow without interruption, join DJ's Inner Circle to unlock unlimited neural capacity."
                : "Your Neural Blueprint is fragmenting. To prevent focus-decay and anchor your cognitive data, you must secure your session. Anchor to your Achieving Vault now."
              }
            </p>
            <div className="space-y-4 pt-4">
              {!user ? (
                <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-lg shadow-2xl transition-all active:scale-95">Anchor to Vault (Sign In)</button>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => handleCheckout("architect_monthly")} className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-[2rem] text-left group hover:scale-[1.02] transition-all border border-white/10">
                    <p className="text-[10px] font-black uppercase text-blue-200">Prism Architect</p>
                    <p className="text-xl font-black text-[var(--fg)]">$9 / Monthly</p>
                    <p className="text-xs text-blue-100 opacity-60 mt-1">Continuous Neural Support & Unlimited Capacity</p>
                  </button>
                  <button onClick={() => handleCheckout("sovereign_lifetime")} className="bg-gradient-to-r from-amber-500 to-yellow-600 p-6 rounded-[2rem] text-left group hover:scale-[1.02] transition-all border border-white/10">
                    <p className="text-[10px] font-black uppercase text-amber-200">Sovereign Master</p>
                    <p className="text-xl font-black text-[var(--fg)]">$99 / Lifetime</p>
                    <p className="text-xs text-amber-100 opacity-60 mt-1">Permanent Focus Anchor & Exclusive Resources</p>
                  </button>
                </div>
              )}
              <button onClick={() => setShowPaywall(false)} className="w-full text-slate-600 font-bold uppercase text-[10px] tracking-[0.5em] py-4 hover:text-slate-400 transition-colors">Maintain Current Link</button>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>
      <AnimatePresence>{isZenLocked && (<motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={handleToggleZenLock} className="fixed top-8 right-8 z-[500] bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-[var(--fg)] p-6 rounded-full border-2 border-red-600/50 backdrop-blur-3xl shadow-2xl transition-all group"><X size={32} className="group-hover:rotate-90 transition-transform" /></motion.button>)}</AnimatePresence>
      <AnimatePresence>{data && !isZenLocked && (<div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end gap-4">{chatOpen && (<motion.div initial={{ opacity: 0, y: 50, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.8 }} className="w-[350px] md:w-[450px] apple-glass border-2 border-blue-500/30 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden max-h-[500px]"><div className="bg-blue-600 p-6 flex justify-between items-center"><h3 className="font-black text-[var(--fg)] uppercase tracking-widest text-sm flex items-center gap-3"><MessageCircle size={18}/> Ask DJ</h3><button onClick={() => setChatOpen(false)} className="text-[var(--fg)] hover:bg-[var(--bg)]/10 p-2 rounded-xl transition-all"><X size={20}/></button></div><div className="flex-grow overflow-y-auto p-6 space-y-4 text-sm font-medium h-[300px]">{chatHistory.length === 0 && <p className="text-[var(--fg)] italic text-center py-10">"Ask me anything!"</p>}{chatHistory.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-[var(--fg)]' : 'bg-[var(--color-glass)] text-slate-300 border border-[var(--color-border)]'}`}>{msg.text}</div></div>))}{chatLoading && <div className="flex justify-start"><div className="bg-[var(--color-glass)] p-4 rounded-2xl animate-pulse text-[var(--fg)]">Thinking...</div></div>}</div><form onSubmit={handleChat} className="p-4 border-t border-[var(--color-border)] bg-[var(--color-glass)] flex gap-2"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a question..." className="flex-grow bg-[var(--color-shadow)] p-4 rounded-xl text-[var(--fg)] focus:outline-none border border-[var(--color-border)]" /><button type="submit" className="bg-blue-600 text-[var(--fg)] p-4 rounded-xl hover:bg-blue-500 transition-all active:scale-95"><Send size={20} /></button></form></motion.div>)}<button onClick={() => setChatOpen(!chatOpen)} className="p-6 bg-blue-600 text-[var(--fg)] rounded-[2rem] shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all active:scale-90 flex items-center gap-4 font-black uppercase tracking-widest text-xs relative overflow-hidden group"><div className="absolute inset-0 bg-[var(--bg)]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" /><MessageCircle size={24} className="relative z-10" /> <span className="relative z-10">Ask DJ</span></button></div>)}</AnimatePresence>

      <AnimatePresence>{showVictory && data && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[700] flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="max-w-md w-full apple-glass-dark border-2 border-white/10 p-8 md:p-12 rounded-[3rem] text-center space-y-8 shadow-[0_0_100px_rgba(59,130,246,0.3)] relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.2)_0%,transparent_70%)] pointer-events-none" />
             <button onClick={() => setShowVictory(false)} className="absolute top-6 right-6 p-2 hover:bg-[var(--bg)]/10 rounded-full text-[var(--fg)] hover:text-[var(--fg)] transition-all z-20"><X size={20}/></button>

             <div className="mx-auto w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 animate-pulse relative z-10"><Trophy size={32} /></div>

             <div className="space-y-2 relative z-10">
               <h2 className="text-3xl font-black text-[var(--fg)] tracking-tighter italic">NEURAL <span className="prism-text">VICTORY</span></h2>
               <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-[8px]">Sovereignty Reclaimed</p>
             </div>
             <div className="grid grid-cols-2 gap-3 relative z-10">
               <div className="apple-glass-dark rounded-3xl p-6">
                 <p className="text-[8px] font-black text-[var(--fg)] uppercase tracking-widest mb-1">Time Saved</p>
                 <p className="text-xl font-black text-[var(--fg)]">{data.readingTime}</p>
               </div>
               <div className="apple-glass-dark rounded-3xl p-6">
                 <p className="text-[8px] font-black text-[var(--fg)] uppercase tracking-widest mb-1">Efficiency</p>
                 <p className="text-xl font-black text-[var(--fg)]">100%</p>
               </div>
             </div>
             <div className="space-y-3 relative z-10 pt-4">
               <button onClick={handleShare} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-[var(--fg)] py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                 {isSharing ? <Loader2 className="animate-spin" size={18} /> : <Share2 size={18} />}
                 Share Victory
               </button>
               <button onClick={handleReset} className="w-full text-[var(--fg)] font-bold uppercase text-[9px] tracking-[0.4em] py-3 hover:text-slate-300 transition-colors">Return to Vault</button>
             </div>
          </motion.div>
        </div>
      )}</AnimatePresence>
      <footer className="w-full py-12 px-4 border-t border-white/5 z-10 flex flex-col items-center gap-4 text-center opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[var(--fg)] font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-3 justify-center">
          JG <IchthysIcon size={12} className="text-blue-500" /> | Rooted in Christ | Dedicated to Dchan.
        </p>
        <p className="max-w-xl text-[10px] leading-relaxed text-[var(--fg)]/70">Privacy first: remove passwords, API keys, identity numbers, and private medical or financial details before sending material for AI refraction.</p>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowAbout(true)} className="mt-2 px-6 py-2 bg-[var(--bg)]/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-[var(--fg)] transition-all">About the Prism</button>

          <button onClick={() => { setTutorialStep(0); setShowTutorial(true); }} className="mt-2 px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-black uppercase tracking-widest text-blue-400 hover:text-[var(--fg)] transition-all flex items-center gap-2"><Sparkles size={10}/> Neural Guide</button>
          <a href="/dassahs-prism-extension.zip" download className="mt-2 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-widest text-emerald-500 hover:text-[var(--fg)] transition-all">Browser Extension</a>
        </div>
      </footer>
      {isFidgetModeActive && <PrismWeaver />}
    </main>
    </>
  );
}
const AudioToggle = () => {
  const [isOn, setIsOn] = useState(false);
  return (
    <button
      onClick={() => setIsOn(!isOn)}
      className="fixed bottom-8 right-8 z-[500] p-4 bg-[var(--bg)]/10 backdrop-blur-md rounded-2xl border border-white/10 text-[var(--fg)] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:scale-105 transition-all"
    >
      Sound {isOn ? 'ON' : 'OFF'}
    </button>
  );
};
