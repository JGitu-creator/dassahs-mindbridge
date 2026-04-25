"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Crown, Sparkles, Rocket, ArrowRight, X, Clock, Palette, 
  Upload, Volume2, Share2, Download, MessageCircle, Send, CheckCircle2, 
  Lock, Trophy, Sparkle, BarChart3, Fish, MessageSquare, Loader2, Type, Swords, Sun, Ghost, Star, Settings, MoreHorizontal,
  Compass, Check, LogOut, Shield, Anchor, Heart
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

type Theme = 'midnight' | 'emerald' | 'sunset' | 'nebula' | 'ghost' | 'ruby' | 'rose' | 'celestial' | 'iron' | 'eternal' | 'neon' | 'electric' | 'gold';

interface ThemeConfig {
  name: string;
  c1: string; c2: string;
  text: string; accent: string;
  glass: string; border: string;
  shadow: string; mesh: string;
  prism: string[];
}

const THEMES: Record<Theme, ThemeConfig> = {
  midnight: {
    name: 'Midnight Sovereign',
    c1: '#020617', c2: '#0f172a',
    text: '#f8fafc', accent: '#3b82f6',
    glass: 'rgba(30, 41, 59, 0.5)', border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0,0,0,0.5)', mesh: 'rgba(59, 130, 246, 0.1)',
    prism: ['#3b82f6', '#8b5cf6', '#06b6d4']
  },
  neon: {
    name: 'Dastastic Neon',
    c1: '#000000', c2: '#09090b',
    text: '#ffffff', accent: '#22c55e',
    glass: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)',
    shadow: 'rgba(34, 197, 94, 0.2)', mesh: 'rgba(34, 197, 94, 0.05)',
    prism: ['#22c55e', '#a855f7', '#3b82f6']
  },
  electric: {
    name: 'Electric Grace',
    c1: '#020617', c2: '#1e1b4b',
    text: '#ffffff', accent: '#f43f5e',
    glass: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.3)',
    shadow: 'rgba(244, 63, 94, 0.2)', mesh: 'rgba(244, 63, 94, 0.05)',
    prism: ['#f43f5e', '#fbbf24', '#2dd4bf']
  },
  gold: {
    name: 'Divine Gold',
    c1: '#451a03', c2: '#000000',
    text: '#fffbeb', accent: '#fbbf24',
    glass: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.4)',
    shadow: 'rgba(251, 191, 36, 0.2)', mesh: 'rgba(251, 191, 36, 0.05)',
    prism: ['#fbbf24', '#f59e0b', '#ffffff']
  },
  emerald: {
    name: 'Hadassah Silk',
    c1: '#064e3b', c2: '#022c22',
    text: '#ecfdf5', accent: '#10b981',
    glass: 'rgba(6, 78, 59, 0.4)', border: 'rgba(16, 185, 129, 0.2)',
    shadow: 'rgba(2, 44, 34, 0.6)', mesh: 'rgba(16, 185, 129, 0.15)',
    prism: ['#10b981', '#34d399', '#059669']
  },
  sunset: {
    name: 'Divine Glow',
    c1: '#451a03', c2: '#78350f',
    text: '#fff7ed', accent: '#f59e0b',
    glass: 'rgba(120, 53, 15, 0.4)', border: 'rgba(245, 158, 11, 0.2)',
    shadow: 'rgba(69, 26, 3, 0.6)', mesh: 'rgba(245, 158, 11, 0.15)',
    prism: ['#f59e0b', '#fb923c', '#d97706']
  },
  nebula: {
    name: 'Sovereign Pulse',
    c1: '#2e1065', c2: '#4c1d95',
    text: '#f5f3ff', accent: '#8b5cf6',
    glass: 'rgba(76, 29, 149, 0.4)', border: 'rgba(139, 92, 246, 0.2)',
    shadow: 'rgba(46, 16, 101, 0.6)', mesh: 'rgba(139, 92, 246, 0.15)',
    prism: ['#8b5cf6', '#a78bfa', '#7c3aed']
  },
  ghost: {
    name: 'Obsidian Grace',
    c1: '#000000', c2: '#111111',
    text: '#cccccc', accent: '#ffffff',
    glass: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.05)',
    shadow: 'rgba(0,0,0,0.8)', mesh: 'rgba(255, 255, 255, 0.05)',
    prism: ['#ffffff', '#888888', '#444444']
  },
  ruby: {
    name: 'Crimson Grace',
    c1: '#450a0a', c2: '#1a0505',
    text: '#fef2f2', accent: '#ef4444',
    glass: 'rgba(153, 27, 27, 0.4)', border: 'rgba(239, 68, 68, 0.2)',
    shadow: 'rgba(69, 10, 10, 0.6)', mesh: 'rgba(239, 68, 68, 0.15)',
    prism: ['#ef4444', '#f87171', '#991b1b']
  },
  rose: {
    name: 'Rose Anointing',
    c1: '#1c1917', c2: '#0c0a09',
    text: '#fafaf9', accent: '#e11d48',
    glass: 'rgba(28, 25, 23, 0.6)', border: 'rgba(225, 29, 72, 0.2)',
    shadow: 'rgba(0,0,0,0.7)', mesh: 'rgba(225, 29, 72, 0.1)',
    prism: ['#e11d48', '#fb7185', '#be123c']
  },
  celestial: {
    name: 'Celestial Anchor',
    c1: '#082f49', c2: '#0c4a6e',
    text: '#f0f9ff', accent: '#0ea5e9',
    glass: 'rgba(12, 74, 110, 0.5)', border: 'rgba(14, 165, 233, 0.2)',
    shadow: 'rgba(8, 47, 73, 0.6)', mesh: 'rgba(14, 165, 233, 0.1)',
    prism: ['#0ea5e9', '#38bdf8', '#0284c7']
  },
  iron: {
    name: 'Iron Discernment',
    c1: '#0f172a', c2: '#1e293b',
    text: '#f8fafc', accent: '#64748b',
    glass: 'rgba(30, 41, 59, 0.6)', border: 'rgba(100, 116, 139, 0.3)',
    shadow: 'rgba(15, 23, 42, 0.8)', mesh: 'rgba(148, 163, 184, 0.1)',
    prism: ['#64748b', '#94a3b8', '#475569']
  },
  eternal: {
    name: 'Eternal Light',
    c1: '#1e1b4b', c2: '#312e81',
    text: '#eef2ff', accent: '#6366f1',
    glass: 'rgba(49, 46, 129, 0.4)', border: 'rgba(99, 102, 241, 0.3)',
    shadow: 'rgba(30, 27, 75, 0.7)', mesh: 'rgba(99, 102, 241, 0.15)',
    prism: ['#6366f1', '#a5b4fc', '#4338ca']
  }
};

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

interface SimplifiedData {
  tldr: string[];
  whyCare: string;
  readingTime: string;
  chunks: { heading: string; content: string; summary: string; keyTerms: string[]; metaphor: string; dopamineHook: string; }[];
  chartData: { type: 'bar' | 'line' | 'pie'; data: { name: string; value: number }[] } | null;
  actions: { task: string; priority: 'high' | 'medium' | 'low' }[];
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

const IchthysIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M2 12c4-8 14-8 19 0l3 3M2 12c4 8 14 8 19 0l3-3" />
  </svg>
);

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
    <div 
      ref={containerRef}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      className="relative w-full h-[300px] md:h-[400px] rounded-[3rem] overflow-hidden border-2 border-white/10 cursor-ew-resize group shadow-2xl"
    >
      {/* Noise Side (Left) */}
      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-8 md:p-16 text-center select-none grayscale opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-6">The Noise</p>
        <p className="text-xl md:text-3xl text-slate-400 leading-relaxed blur-[1px]">This is a very long and confusing sentence that just keeps going and going and your brain might start to wander off because there is no clear structure or path for your eyes to follow.</p>
      </div>

      {/* Clarity Side (Right) - Use clipPath to reveal */}
      <div 
        className="absolute inset-0 bg-blue-600/5 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 md:p-16 text-center select-none z-10"
        style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 mb-6">The Clarity</p>
        <p className="text-xl md:text-3xl text-white font-black leading-relaxed italic">
          <span className="text-blue-400">Thi</span>s <span className="text-blue-400">i</span>s <span className="text-blue-400">a</span> <span className="text-blue-400">shor</span>t, <span className="text-blue-400">Bioni</span>c <span className="text-blue-400">pat</span>h. <span className="text-blue-400">You</span>r <span className="text-blue-400">brai</span>n <span className="text-blue-400">lock</span>s <span className="text-blue-400">i</span>n <span className="text-blue-400">instan</span>tly.
        </p>
      </div>

      {/* Divider */}
      <div 
        className="absolute top-0 bottom-0 w-[2px] bg-white z-20 shadow-[0_0_20px_rgba(255,255,255,0.5)]"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
          <MoreHorizontal size={24} className="text-black rotate-90" />
        </div>
      </div>
      
      {/* Interaction Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-white/40 pointer-events-none group-hover:opacity-0 transition-opacity">
        Slide to Refract
      </div>
    </div>
  );
};

const NeuralAnchorSidebar = ({ data, isOpen, onToggle }: { data: SimplifiedData, isOpen: boolean, onToggle: () => void }) => {
  const anchors = useMemo(() => {
    const allTerms = data.chunks.flatMap(c => c.keyTerms);
    return Array.from(new Set(allTerms)).slice(0, 15);
  }, [data]);

  return (
    <div className={`fixed right-0 top-1/2 -translate-y-1/2 z-[450] transition-all duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
      <div className="flex items-center">
        <button 
          onClick={onToggle}
          className="w-10 h-20 bg-blue-600 rounded-l-2xl flex items-center justify-center text-white shadow-2xl border-y border-l border-white/20"
        >
          <Anchor size={20} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className="w-64 bg-slate-900/90 backdrop-blur-3xl border-l border-white/10 p-6 shadow-2xl h-[400px] overflow-y-auto no-scrollbar rounded-bl-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-6 flex items-center gap-2">
            <Anchor size={12} /> Neural Anchors
          </p>
          <div className="space-y-3">
            {anchors.map((anchor, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={i} 
                className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-default"
              >
                {anchor}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SceneRecap = ({ chunk }: { chunk: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] mb-8"
  >
    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-2">
      <Zap size={14} /> Previously Refracted
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
        return <span key={i} className="inline-block mr-1"><span className="font-black text-white">{bold}</span><span className="opacity-70">{rest}</span></span>;
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

const ContextAnchor = ({ whyCare, isZenLocked, segmentIdx }: { whyCare: string, isZenLocked: boolean, segmentIdx: number }) => {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className={`fixed ${isZenLocked ? 'top-8' : 'top-24'} left-1/2 -translate-x-1/2 z-[105] w-full max-w-lg px-4 pointer-events-none transition-all duration-700`}
    >
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto flex items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
          <div className="relative p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/20 shadow-lg">
            <Anchor size={16} />
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-blue-400/60 leading-none">Mission Anchor {segmentIdx + 1}</p>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i === segmentIdx % 3 ? 'bg-blue-400 animate-pulse' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-100 leading-tight italic line-clamp-2">"{whyCare}"</p>
        </div>
      </div>
    </motion.div>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center space-y-12">
        <div className="space-y-4">
          <p className="text-blue-400 font-black uppercase tracking-[0.5em] text-[10px]">Neural Rhythm: Level {level}</p>
          <h2 className="text-5xl md:text-7xl font-black italic text-white tracking-tighter">
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
                 <motion.button whileHover={{ scale: 1.1 }} onClick={() => setSolvedCount(s => s + 1)} key={i} className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white font-black">{val}</motion.button>
               ))}
             </div>
           )}
           <div className="absolute text-6xl font-black tabular-nums text-white/20">{seconds}s</div>
        </div>

        <div className="space-y-6">
          <p className="text-slate-400 text-lg font-medium">
            {level === 1 ? "Look away from the screen. Find a distant object and focus on it for 15 seconds." : 
             level === 2 ? "Follow the expanding square. Inhale as it grows, exhale as it shrinks. Regulate your sovereignty." : 
             "Refresh your cognitive interest. Tap the numbers in any order to anchor your dopamine."}
          </p>
          {seconds === 0 && (
            <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={onComplete} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all">Resume Mission</motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
const ProgressPrism = ({ current, total }: { current: number, total: number }) => {
  const percentage = ((current + 1) / total) * 100;
  
  return (
    <div className="w-full h-4 bg-white/5 rounded-full relative overflow-hidden border border-white/10 shadow-inner">
      {/* 3D Prism Glow effect */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: "spring", damping: 20, stiffness: 60 }}
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center"
      >
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
        />
      </motion.div>
      
      {/* Segment Markers */}
      {[...Array(total)].map((_, i) => (
        <div 
          key={i} 
          className="absolute top-0 h-full w-[1px] bg-white/10"
          style={{ left: `${(i / total) * 100}%` }}
        />
      ))}
    </div>
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

const FrostedGlassDepth = ({ theme, mousePos, audioMode, isZenLocked, focusMode }: { theme: Theme, mousePos: { x: number, y: number }, audioMode: string, isZenLocked: boolean, focusMode: string }) => {
  const t = THEMES[theme];
  const isMobile = useIsMobile();

  const pulseVariants = {
    action: { scale: [1, 1.2, 0.9, 1], opacity: [0.4, 0.8, 0.4], transition: { duration: 2, repeat: Infinity } },
    suspense: { scale: [1, 1.1, 0.95, 1], opacity: [0.3, 0.6, 0.3], transition: { duration: 4, repeat: Infinity } },
    brown: { scale: [1, 1.05, 0.98, 1], opacity: [0.2, 0.4, 0.2], transition: { duration: 8, repeat: Infinity } },
    none: { scale: [1, 1.02, 0.99, 1], opacity: [0.15, 0.3, 0.15], transition: { duration: 12, repeat: Infinity } }
  };

  const currentPulse = (pulseVariants as any)[audioMode] || pulseVariants.none;
  const sovereignPulse = { scale: [1, 1.01, 1], opacity: [0.1, 0.15, 0.1], transition: { duration: 10, repeat: Infinity } };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {focusMode === 'sovereign' && (
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(to right, ${t.accent} 1px, transparent 1px), linear-gradient(to bottom, ${t.accent} 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />
      )}
      {[...Array(isMobile ? 3 : 8)].map((_, i) => (
        <motion.div
          key={`${i}`}
          animate={focusMode === 'sovereign' ? sovereignPulse : currentPulse}
          style={{
            position: 'absolute',
            left: `${(i * 25) % 100}%`,
            top: `${(i * 35) % 100}%`,
            width: `${isMobile ? 200 + i * 50 : 300 + i * 100}px`,
            height: `${isMobile ? 200 + i * 50 : 300 + i * 100}px`,
            background: `radial-gradient(circle at center, ${t.prism[i % 3]}${focusMode === 'sovereign' ? '22' : '88'}, transparent)`,
            borderRadius: '50%',
            filter: `blur(${isMobile ? '30px' : '90px'})`,
            x: (mousePos.x - 500) * (isZenLocked || focusMode === 'sovereign' ? 0.01 : 0.05 + i * 0.01),
            y: (mousePos.y - 400) * (isZenLocked || focusMode === 'sovereign' ? 0.01 : 0.05 + i * 0.01),
          }}
        />
      ))}
      {!isMobile && (
        <motion.div 
          animate={{ x: mousePos.x, y: mousePos.y }}
          transition={{ type: 'spring', damping: 40, stiffness: 150 }}
          className="fixed top-0 left-0 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[80px]"
          style={{ background: `radial-gradient(circle, ${t.accent}33, transparent)`, willChange: 'transform' }}
        />
      )}
    </div>
  );
};

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
    <motion.div 
      animate={{ 
        rotate: loading ? [0, 10, -10, 0] : [0, 5, -5, 0], 
        scale: scale,
        x: (mousePos.x - (typeof window !== 'undefined' ? window.innerWidth/2 : 0)) * 0.02,
        y: (mousePos.y - (typeof window !== 'undefined' ? window.innerHeight/2 : 0)) * 0.02
      }} 
      transition={{ repeat: Infinity, duration: duration, ease: "easeInOut" }} 
      className={`relative mx-auto w-28 h-28 md:w-44 md:h-44 bg-gradient-to-br ${color} text-white rounded-[3rem] md:rounded-[5rem] flex items-center justify-center border-2 border-white/20 shadow-[0_0_100px_rgba(59,130,246,${glowOpacity})] transition-all duration-1000 z-10`}
    >
      <Brain className={`w-16 h-16 md:w-24 md:h-24 ${isVictorious && user ? "text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" : ""}`} />
      
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
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-8 md:w-3 md:h-12 bg-white/20 blur-[1px] rounded-full"
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
  );
};

const MissionMandate = ({ onAccept, onCancel, linkState, syncProgress }: { onAccept: () => void, onCancel: () => void, linkState: 'pending' | 'syncing' | 'revealing' | 'established' | 'severed', syncProgress: number }) => {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[1000] flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={linkState === 'revealing' ? { scale: 1.5, opacity: 0, filter: 'blur(20px)' } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="max-w-2xl w-full bg-slate-900 border-2 border-blue-500/30 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-[0_0_100px_rgba(59,130,246,0.2)] space-y-6 md:space-y-8 my-auto relative overflow-hidden"
      >
        {linkState === 'syncing' && (
          <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="absolute inset-[-40px] border-4 border-dashed border-blue-500/30 rounded-full animate-[neural-gear_10s_linear_infinite]" />
              <div className="absolute inset-[-20px] border-2 border-blue-400/20 rounded-full animate-[neural-gear_15s_linear_infinite_reverse]" />
              <RefractiveNeuralCore loading={true} inputLength={0} isVictorious={false} user={null} mousePos={{x:0, y:0}} focusMode="dastastic" />
            </div>
            <div className="w-48 md:w-64 h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${syncProgress}%` }}
                className="h-full bg-blue-500 shadow-[0_0_20px_#3b82f6]"
              />
            </div>
            <p className="text-blue-400 font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-xs animate-pulse">Syncing Neural Link: {syncProgress}%</p>
          </div>
        )}

        <div className="flex items-center gap-3 md:gap-4 text-blue-400 font-black uppercase tracking-widest text-[10px] md:text-xs">
          <Shield size={16} className="animate-pulse" /> Mission Mandate: Sovereign Directive
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl md:text-5xl font-black text-white italic leading-tight">Enter Dassah's <span className="prism-text">Neural Prism</span></h2>
          <p className="text-xs md:text-sm text-slate-400 font-medium italic">Establishing a secure connection for your neurodivergent journey.</p>
        </div>
        
        <div className="space-y-4 md:space-y-6 text-slate-300 overflow-y-auto max-h-[35vh] md:max-h-[40vh] pr-2 md:pr-4 custom-scrollbar">
          <div className="p-3 md:p-4 bg-blue-500/5 rounded-xl md:rounded-2xl border border-blue-500/20 mb-4">
             <p className="text-[8px] md:text-[10px] text-blue-300 font-black uppercase tracking-widest mb-1 italic">Parental Directive</p>
             <p className="text-[10px] md:text-xs font-bold leading-relaxed text-blue-100 italic">"By establishing this link for a minor, you as a parent or guardian provide neural consent for their access to the Prism."</p>
          </div>

          <div className="space-y-2 p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
            <h3 className="text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest flex items-center gap-2"><Lock size={10} className="text-blue-400" /> 1. The "Sensitive Data" Shield</h3>
            <p className="text-xs md:text-sm leading-relaxed text-blue-100">Neural Guardrails: Do not input highly sensitive data (e.g., SSNs, passwords, or private health records). We are not liable for the exposure of data you choose to provide.</p>
            <p className="text-[8px] md:text-[10px] text-slate-500 italic font-bold">[What this means: Keep your private secrets like passwords and IDs out of the Prism for your safety!]</p>
          </div>
          
          <div className="space-y-2 p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
            <h3 className="text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest flex items-center gap-2"><Zap size={10} className="text-amber-400" /> 2. Neural Resonance (Data Processing)</h3>
            <p className="text-xs md:text-sm leading-relaxed text-blue-100">Your inputs are processed via Google's Gemini models to provide clarity. By using the Prism, you agree to their standard data handling protocols.</p>
            <p className="text-[8px] md:text-[10px] text-slate-500 italic font-bold">[What this means: Google's smart robots help us clean the noise, and they follow strict rules to keep things safe.]</p>
          </div>
          
          <div className="space-y-2 p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
            <h3 className="text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest flex items-center gap-2"><Shield size={10} className="text-emerald-400" /> 3. "As-Is" Liability</h3>
            <p className="text-xs md:text-sm leading-relaxed text-blue-100">Dassah's-Prism is provided "as is" without warranties. The creators shall not be liable for any direct or indirect damages resulting from your use of this tool.</p>
            <p className="text-[8px] md:text-[10px] text-slate-500 italic font-bold">[What this means: We built this tool with love to help you, but we aren't responsible if things aren't perfect or if the noise is too loud today.]</p>
          </div>
          
          <div className="space-y-2 p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
            <h3 className="text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest flex items-center gap-2"><Brain size={10} className="text-purple-400" /> 4. Cerebral Guardianship (GDPR/CCPA)</h3>
            <p className="text-xs md:text-sm leading-relaxed text-blue-100">You have the "Right to Erasure" (to have your data deleted) and we never sell your neural profile to third parties.</p>
            <p className="text-[8px] md:text-[10px] text-slate-500 italic font-bold">[What this means: You own your brain data. You can ask us to delete it whenever you want! We never sell your thoughts.]</p>
          </div>

          <div className="space-y-2 p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
            <h3 className="text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest flex items-center gap-2"><Anchor size={10} className="text-blue-400" /> 5. Functional Neural Anchors (Cookies)</h3>
            <p className="text-xs md:text-sm leading-relaxed text-blue-100">We use essential cookies to keep your neural link active and save your preferences.</p>
            <p className="text-[8px] md:text-[10px] text-slate-500 italic font-bold">[What this means: Small digital anchors help the Prism remember who you are so you don't have to sign in every time!]</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-4 relative z-10">
          <button 
            onClick={onAccept}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 md:py-6 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-500/20 group text-xs md:text-base"
          >
            <span className="flex items-center justify-center gap-2 md:gap-3">
              Establish Neural Link <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
          <button 
            onClick={onCancel}
            className="px-6 py-4 md:px-8 md:py-6 text-slate-500 font-black uppercase tracking-widest hover:text-red-400 transition-colors text-[10px] md:text-sm"
          >
            Sever Link
          </button>
        </div>

        <div className="pt-6 flex justify-center gap-6 border-t border-white/5 mt-4">
          <a href="/privacy" className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-400 transition-colors">Privacy Shield</a>
          <a href="#" className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-400 transition-colors">Neural Terms</a>
        </div>
      </motion.div>
    </div>
  );
};

const PortalReveal = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1500] flex flex-col items-center justify-center bg-black p-4"
    >
      <div className="relative flex flex-col items-center">
        <svg width="160" height="80" viewBox="0 0 160 80" className="mb-8">
          <motion.path
            d="M10 40c30-30 90-30 130 0l20 15M10 40c30 30 90 30 130 0l20-15"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M10 40c30-30 90-30 130 0l20 15M10 40c30 30 90 30 130 0l20-15"
            fill="none"
            stroke="url(#ichthys-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5] }}
            transition={{ delay: 1.5, duration: 1 }}
          />
          <defs>
            <linearGradient id="ichthys-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5, ease: "easeOut" }}
          className="text-center space-y-1"
        >
          <p className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.6em] md:tracking-[1em] text-blue-400/40 ml-[0.6em] md:ml-[1em]">entering</p>
          <h2 className="text-3xl md:text-8xl font-black italic prism-text drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">Dassah&apos;s-Prism</h2>
        </motion.div>
      </div>
    </motion.div>
  );
};

const NeuralLinkSevered = () => {
  return (
    <div className="fixed inset-0 bg-black z-[2000] flex flex-col items-center justify-center p-8 text-center space-y-8">
      <div className="absolute inset-0 opacity-20 pointer-events-none grayscale brightness-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mx-auto text-red-500 border-2 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <X size={48} />
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">Link Severed</h2>
        <p className="text-slate-500 max-w-md mx-auto font-medium">Access to Dassah's Neural Prism requires acceptance of the Sovereign Directive. The connection has been terminated to protect your neural sovereignty.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-8 px-12 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all"
        >
          Retry Authentication
        </button>
      </motion.div>
    </div>
  );
};

const TUTORIAL_STEPS = [
  {
    title: "Welcome to the Prism",
    description: "Hullo! I'm DJ. This is your Neural Prism—a sanctuary built to turn overwhelming 'Noise' into 'Divine Clarity.'",
    more: "Dassah's-Prism was born from the idea that ADHD isn't a deficit, but a high-powered engine. We use AI to refract complex data into vibrant, manageable streams of insight.",
    icon: <Sparkles className="text-blue-400" size={48} />
  },
  {
    title: "Refraction & Modes",
    description: "Use the slider above to see the magic. Switch between 'Dastastic' (stimulating) and 'Sovereign' (executive) modes to suit your mind.",
    more: "Dastastic mode uses metaphors and hooks to keep you engaged. Sovereign mode uses 'Executive Distillation' for rapid, bottom-line decision making.",
    icon: <Zap className="text-amber-500" size={48} />
  },
  {
    title: "The Neural Core",
    description: "Paste your noise into the core. Pop a specific objective into the 'Sovereign Goal' box to help the Prism focus its discernment.",
    more: "When you provide a Goal, the Prism's 'Deep Discernment Protocol' specifically hunts for information that serves that objective, ignoring the fluff.",
    icon: <Brain className="text-purple-400" size={48} />
  },
  {
    title: "Neural Command",
    description: "Click the gears! Control your environment with Soundscapes (Brown Noise), Bionic reading, and the Neural Bridge (Extension).",
    more: "Neural Command is your cockpit. Use Bionic reading to guide your eyes, and Brown Noise to drown out external distractions during deep focus.",
    icon: <Settings className="text-blue-500" size={48} />
  },
  {
    title: "Neural Identity",
    description: "Click the Crown. This is your Sovereignty: track your 'Bandwidth Reclaimed' (Words & Time) and access your Achieving Vault (History).",
    more: "Neural Identity turns your productivity into a visual testimony. Your history is stored securely in the Vault so you never lose a 'Refraction'.",
    icon: <Crown className="text-yellow-500" size={48} />
  },
  {
    title: "Ask DJ & Zen Lock",
    description: "Need a hand? 'Ask DJ' is always here. Need absolute silence? 'Zen Lock' clears the UI so it's just you and the clarity.",
    more: "Ask DJ can perform tasks like 'make a poem' or 'find dates.' Zen Lock is designed for 'Profound Cognitive Intensity' sessions where any UI element is a distraction.",
    icon: <Rocket className="text-indigo-500" size={48} />
  }
];

const TutorialModal = ({ step, onNext, onClose }: { step: number, onNext: () => void, onClose: () => void }) => {
  const current = TUTORIAL_STEPS[step];
  const [showMore, setShowMore] = useState(false);

  useEffect(() => { setShowMore(false); }, [step]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[1000] flex items-center justify-center p-4">
      <motion.div 
        key={step}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className="max-w-md w-full bg-slate-900 border-2 border-blue-500/30 p-8 md:p-12 rounded-[4rem] text-center space-y-6 shadow-[0_0_150px_rgba(59,130,246,0.3)]"
      >
        <div className="mx-auto w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
          {current.icon}
        </div>
        <div className="space-y-3">
          <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-[8px]">Node {step + 1} of {TUTORIAL_STEPS.length}</p>
          <h2 className="text-3xl font-black text-white italic tracking-tighter">{current.title}</h2>
          <p className="text-slate-400 text-base leading-relaxed font-medium">{current.description}</p>
          
          <div className="pt-2">
            <button 
              onClick={() => setShowMore(!showMore)} 
              className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500/60 hover:text-blue-400 transition-colors"
            >
              {showMore ? "- Show Less" : "+ Read Further"}
            </button>
            <AnimatePresence>
              {showMore && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="mt-4 p-4 bg-white/5 rounded-2xl text-xs text-slate-500 leading-relaxed italic border border-white/5">
                    {current.more}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="pt-4">
          <button 
            onClick={step === TUTORIAL_STEPS.length - 1 ? onClose : onNext}
            className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] text-white shadow-xl transition-all active:scale-95"
          >
            {step === TUTORIAL_STEPS.length - 1 ? "Establish Link" : "Next Point"}
          </button>
        </div>
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
        className={`text-lg md:text-xl font-bold italic tracking-tight text-center transition-colors duration-500 ${phase === 'clarity' ? 'text-blue-400' : 'text-slate-500'}`}
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

export default function Home() {
  const [input, setInput] = useState('');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const playClick = () => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SimplifiedData | null>(null);
  const [currentChunk, setCurrentChunk] = useState(-1);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false); 
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isBionic, setIsBionic] = useState(true);
  const [audioMode, setAudioMode] = useState<'none' | 'brown' | 'suspense' | 'action' | 'gamma'>('none');
  const [mouseFocus, setMouseFocus] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rewardType, setRewardType] = useState<'none' | 'step' | 'final'>('none');
  const [theme, setTheme] = useState<Theme>('midnight');
  const [isScenic, setIsScenic] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showNeuroMirror, setShowNeuroMirror] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showNeuralCommand, setShowNeuralCommand] = useState(false);
  const [showNeuralIdentity, setShowNeuralIdentity] = useState(false);
  const [showTOS, setShowTOS] = useState(false);
  const [acceptedTOS, setAcceptedTOS] = useState(false);
  const [linkState, setLinkState] = useState<'pending' | 'syncing' | 'revealing' | 'established' | 'severed'>('pending');
  const [syncProgress, setSyncProgress] = useState(0);
  const [starredItems, setStarredItems] = useState<{heading: string, content: string, type: 'metaphor' | 'hook'}[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [missionGoal, setMissionGoal] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [focusMode, setFocusMode] = useState<'dastastic' | 'sovereign'>('dastastic');
  const [dassahPoints, setDassahPoints] = useState(0);
  const [totalWordsRefracted, setTotalWordsRefracted] = useState(0);
  const [totalMinutesSaved, setTotalMinutesSaved] = useState(0);
  const [suspenseIdx, setSuspenseIdx] = useState(0);
  const [actionIdx, setActionIdx] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [isZenLocked, setIsZenLocked] = useState(false);
  const [isGreyedOut, setIsGreyedOut] = useState(false);
  const [storyMode, setStoryMode] = useState(false);
  const [showMissionBrief, setShowMissionBrief] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [anchorsOpen, setAnchorsOpen] = useState(false);
  const [breakLevel, setBreakLevel] = useState(1);
  const [showRecap, setShowRecap] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.2);

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
    playClick();
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
    { id: 'brain', icon: <Brain className="text-purple-400" />, label: 'The Core' },
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
    playClick();
    setStarredItems(prev => {
      const exists = prev.find(i => i.content === item.content && i.type === item.type);
      if (exists) return prev.filter(i => !(i.content === item.content && i.type === item.type));
      return [...prev, item];
    });
  };

  const handleEstablishLink = async () => {
    playClick();
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
    const checkTOS = async () => {
      const accepted = localStorage.getItem('dassahs_prism_tos_accepted') === 'true';
      setAcceptedTOS(accepted);
      
      if (!accepted) {
        setShowTOS(true);
        setLinkState('pending');
        // Force logout if they haven't accepted the new terms yet
        await supabase.auth.signOut();
      } else {
        setLinkState('revealing');
        setTimeout(() => {
          setLinkState('established');
          // Trigger tutorial if never seen
          if (localStorage.getItem('dassahs_prism_tutorial_complete') !== 'true') {
            setTimeout(() => {
              setShowTutorial(true);
            }, 3000); // 3 second delay to let tagline animation finish
          }
        }, 4000); // 4 second portal reveal
      }
    };
    checkTOS();

    // Load starred items from vault
    const savedStars = localStorage.getItem('dassahs_neural_vault');
    if (savedStars) setStarredItems(JSON.parse(savedStars));
  }, []);

  const playNeuralSoundscape = (type: 'brown' | 'gamma' | 'suspense' | 'action') => {
    try {
      if (noiseNodeRef.current?.stop) {
        noiseNodeRef.current.stop();
      }

      const soundUrls = {
        brown: 'https://ia800201.us.archive.org/3/items/lp_atmospheric-noises-vol-1_various/side_1_1_brown_noise.mp3',
        gamma: 'https://www.soundjay.com/buttons/beep-01a.mp3', 
        suspense: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_73070498a4.mp3?filename=ambient-piano-logo-16532.mp3',
        action: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_feb947a750.mp3?filename=soul-lofi-126335.mp3'
      };

      const audio = new Audio(soundUrls[type]);
      audio.loop = true;
      audio.volume = audioVolume;
      audio.play().catch(e => console.warn("Browser blocked sound. Click required."));

      noiseNodeRef.current = { 
        stop: () => { 
          audio.pause(); 
          audio.currentTime = 0; 
        } 
      };
    } catch (e) { console.error("Soundscape failed", e); }
  };

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

  useEffect(() => {
    if (audioMode !== 'none') {
      if (noiseNodeRef.current?.stop) noiseNodeRef.current.stop();
      playNeuralSoundscape(audioMode as any);
    } else {
      if (noiseNodeRef.current?.stop) noiseNodeRef.current.stop();
    }
  }, [audioMode]);

  useEffect(() => {
    localStorage.setItem('dassahs_neural_vault', JSON.stringify(starredItems));
  }, [starredItems]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { 
      if (session?.user && localStorage.getItem('dassahs_prism_tos_accepted') !== 'true') {
        supabase.auth.signOut();
        setAcceptedTOS(false);
        setShowTOS(true);
        setLinkState('pending');
        return;
      }
      setUser(session?.user ?? null); 
      if (session?.user) {
        loadHistory(session.user.id);
        loadProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && localStorage.getItem('dassahs_prism_tos_accepted') !== 'true') {
        supabase.auth.signOut();
        setAcceptedTOS(false);
        setShowTOS(true);
        setLinkState('pending');
        return;
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
    const urlParams = new URLSearchParams(window.location.search);
    const textParam = urlParams.get('text');
    const shareIdParam = urlParams.get('share_id');

    if (textParam) { 
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
    playClick();
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
    playClick();
    const exampleNoise = "This is a very long and confusing sentence that just keeps going and going and your brain might start to wander off because there is no clear structure or path for your eyes to follow and it just feels like a wall of text. It's filled with unnecessary jargon and complex clauses that are designed to overwhelm the reader rather than provide clarity. By the time you reach the end, you've forgotten how it started, and the 'Sovereign Core' of the message is lost in a sea of cognitive noise.";
    setInput(exampleNoise);
    setRewardType('step');
    setTimeout(() => setRewardType('none'), 2000);
  };

  const handleSimplify = async (textToSimplify = input) => {
    playClick(); if (!textToSimplify.trim()) return; 
    const limit = user ? 30 : 10;
    if (usageCount >= limit && !isPaid) { setShowPaywall(true); return; }
    
    setLoading(true);
    setData(null); // CLEAR PREVIOUS DATA TO FORCE NEW DISCERNMENT UI
    setShareId(null);
    try {
      const cognitiveMode = focusMode === 'sovereign' ? 'ceo' : 'adhd';
      const res = await fetch('/api/simplify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: textToSimplify, isScenic, cognitiveMode, missionGoal, isStory: storyMode }) });
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || "The Prism is blurry. Try again."); }
      const result = await res.json(); setData(result);
      
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
      
      const title = result.tldr[0].slice(0, 30) + '...';
      if (user) { await supabase.from('history').insert({ user_id: user.id, title, data: result }); loadHistory(user.id); }
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
      const shareText = `I just crushed the noise! ⚡️ Dassah's-Prism refracted a document into ${data.readingTime} of pure clarity. Sovereignty: 100%. Join the flow: ${shareUrl}`; 
      await navigator.clipboard.writeText(shareText); alert("Victory shared! Link copied to clipboard. 🚀"); 
    } catch (err) { alert("Could not create share link."); } finally { setIsSharing(false); } 
  };

  const handleDownloadSummary = () => { if (!data) return; const content = `DASSAH'S PRISM SUMMARY\n\nTHE VISION:\n${data.whyCare}\n\nTL;DR:\n${data.tldr.map(t => `- ${t}`).join('\n')}\n\nFULL PRISM LINK: ${window.location.origin}/?text=${encodeURIComponent(input)}`; const blob = new Blob([content], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `dassahs_prism-summary.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0]; if (!file) return; setLoading(true);
    try {
      if (file.name.endsWith('.pdf')) {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
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

  const handleReadAloud = (text: string) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    playClick();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleReset = () => {
    playClick();
    setData(null);
    setInput('');
    setCurrentChunk(-1);
    setMissionGoal('');
    setRewardType('none');
    localStorage.removeItem('dassahs_neural_snapshot');
  };

  const handleToggleZenLock = () => {
    playClick();
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
    playClick();
    const newUserMsg = { role: 'user' as const, text: chatInput };
    setChatHistory(prev => [...prev, newUserMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput, history: chatHistory, data })
      });
      const result = await res.json();
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
      setTimeout(() => { setShowVictory(true); }, 2000);
    }
  };
  const handleCheckout = async (lookupKey: string) => {
    if (!user) { handleLogin(); return; }
    playClick();
    alert("Initiating Neural Handshake... Synchronizing with Dassah’s Prism. Prepare for unlimited bandwidth.");
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lookup_key: lookupKey, userId: user.id }),
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
    playClick();
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

  const handleLogout = async () => {
    playClick();
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
    setIsPaid(false);
  };

  const currentTheme = THEMES[theme];
  const themeStyles = `
    :root {
      --color-bg-1: ${currentTheme.c1}; --color-bg-2: ${currentTheme.c2};
      --color-text: ${currentTheme.text}; --color-accent: ${currentTheme.accent};
      --color-glass: ${currentTheme.glass}; --color-border: ${currentTheme.border};
      --color-shadow: ${currentTheme.shadow};
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
      <style>{themeStyles}</style>
      
      <AnimatePresence>
        {linkState === 'severed' && <NeuralLinkSevered />}
      </AnimatePresence>

      <AnimatePresence>
        {linkState === 'revealing' && <PortalReveal />}
      </AnimatePresence>

      <AnimatePresence>
        {(linkState === 'pending' || linkState === 'syncing' || linkState === 'revealing') && (
          <MissionMandate 
            linkState={linkState}
            syncProgress={syncProgress}
            onAccept={handleEstablishLink}
            onCancel={() => { playClick(); setLinkState('severed'); }}
          />
        )}
      </AnimatePresence>

      {/* SUBTLE BRAND SIGNATURE - VISIBLE WITHOUT LOGIN */}
      <div className="w-full py-8 px-6 z-[100] text-center opacity-30 hover:opacity-100 transition-opacity">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">Dassah&apos;s-Prism | Reclaiming Sovereignty</p>
      </div>

      {linkState === 'established' && (
        <main onMouseMove={(e) => mouseFocus && setMousePos({ x: e.clientX, y: e.clientY })} className={`min-h-screen font-sans flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-blue-500/40 transition-all duration-1000 bg-fixed ${isGreyedOut ? 'grayscale sepia contrast-50' : ''}`} style={{ color: 'var(--color-text)' }}>
        <div className="fixed inset-0 -z-10 transition-colors duration-1000" style={{ background: `radial-gradient(circle at 50% 50%, var(--color-bg-1) 0%, var(--color-bg-2) 100%)` }} />
        <FrostedGlassDepth theme={theme} mousePos={mousePos} audioMode={audioMode} isZenLocked={isZenLocked} focusMode={focusMode} />

        {storyMode && data && currentChunk >= 0 && currentChunk < data.chunks.length && (
          <NeuralAnchorSidebar data={data} isOpen={anchorsOpen} onToggle={() => setAnchorsOpen(!anchorsOpen)} />
        )}
        
        <AnimatePresence>
          {data && currentChunk >= 0 && currentChunk < data.chunks.length && (
            <ContextAnchor whyCare={data.whyCare} isZenLocked={isZenLocked} segmentIdx={currentChunk} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showBreak && (
            <NeuralRhythmBreak level={breakLevel} onComplete={() => { playClick(); setShowBreak(false); }} />
          )}
        </AnimatePresence>

        <div className="fixed inset-0 pointer-events-none opacity-20"><div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `radial-gradient(var(--color-accent) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} /><div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black/40" /></div>

      <div className="fixed inset-0 pointer-events-none opacity-20"><div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `radial-gradient(var(--color-accent) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} /><div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black/40" /></div>

      <AnimatePresence>{rewardType !== "none" && focusMode === "dastastic" && (
        <><StarParticles count={rewardType === 'final' ? 100 : 30} isFinal={rewardType === 'final'} /><motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.1 }} className="fixed inset-0 z-[400] flex items-center justify-center pointer-events-none p-4 text-center"><div className="bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-amber-500/90 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_100px_rgba(59,130,246,0.5)] border-2 border-white/20 backdrop-blur-3xl flex flex-col items-center gap-6 max-w-lg w-full"><RefractiveNeuralCore loading={false} inputLength={0} isVictorious={rewardType === 'final'} user={user} mousePos={mousePos} focusMode={focusMode} /><div className="space-y-2"><p className="text-blue-200 font-black uppercase tracking-[0.4em] text-[10px]">{rewardType === 'final' ? "Mission Objective: Complete" : "Neural Link Established"}</p><h2 className="font-black italic text-3xl md:text-5xl text-white tracking-tighter drop-shadow-2xl">{rewardType === 'final' ? "SOVEREIGNTY RECLAIMED" : currentCatchphrase}</h2></div>{rewardType === 'final' && (<div className="space-y-6 pt-4"><div className="flex gap-6 justify-center"><div className="text-left border-l-2 border-white/20 pl-4"><p className="text-white/60 text-[8px] font-black uppercase">Rank</p><p className="text-white font-bold text-base italic">Master Discernor</p></div><div className="text-left border-l-2 border-white/20 pl-4"><p className="text-white/60 text-[8px] font-black uppercase">Result</p><p className="text-white font-bold text-base italic">100% Clarity</p></div></div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="bg-white/5 p-4 rounded-2xl border border-white/10"><p className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Neural Off-Ramp: Transitioning...</p><p className="text-xs text-slate-300 italic">&quot;Inhale clarity. Exhale the mission. Your sovereignty is established.&quot;</p></motion.div></div>)}</div></motion.div></>
      )}</AnimatePresence>

      <div className="fixed top-0 left-0 right-0 z-[110] flex justify-center p-6 pointer-events-none">
        <nav className={`pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-3xl bg-[var(--color-glass)] backdrop-blur-3xl border border-[var(--color-border)] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-700 ${isZenLocked ? 'opacity-0 -translate-y-20' : 'opacity-100'}`}>
          <button onClick={() => { playClick(); setShowNeuralCommand(true); }} title="Neural Command" className="p-3 rounded-2xl bg-white/5 text-blue-400 hover:text-white hover:bg-white/10 transition-all group">
            <Compass size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
          
          <div className="w-[1px] h-6 bg-white/10 mx-1" />
          
          <div className="flex items-center gap-4 px-2">
            <div className="flex flex-col items-center">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400/60 leading-none mb-1">Bandwidth Reclaimed</p>
              <div className="flex items-center gap-2">
                <Clock className="text-blue-400" size={10} />
                <span className="font-black text-white text-xs tabular-nums">{totalMinutesSaved}m</span>
                <span className="w-[1px] h-3 bg-white/10 mx-1" />
                <Brain className="text-purple-400" size={10} />
                <span className="font-black text-white text-xs tabular-nums">{(totalWordsRefracted / 1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>

          <div className="w-[1px] h-6 bg-white/10 mx-1" />

          <button onClick={() => { playClick(); setFocusMode(f => f === "dastastic" ? "sovereign" : "dastastic"); }} className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${focusMode === 'sovereign' ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'text-slate-400 hover:text-white'}`}>
            {focusMode === 'sovereign' ? <Crown size={14} /> : <Zap size={14} />}
            <span className="hidden sm:block">{focusMode === 'sovereign' ? 'Sovereign' : 'Dastastic'}</span>
          </button>

          {user ? (
            <button onClick={() => setShowNeuralIdentity(true)} className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-blue-500/30 hover:border-blue-400 hover:scale-105 transition-all shadow-lg flex items-center justify-center bg-blue-500/10">
              {avatarUrl ? (
                DEFAULT_AVATARS.find(a => a.id === avatarUrl) ? (
                  DEFAULT_AVATARS.find(a => a.id === avatarUrl)?.icon
                ) : (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                )
              ) : user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-blue-400 text-xs font-black uppercase">
                  {user.email?.slice(0, 1)}
                </div>
              )}
            </button>
          ) : (
            <button onClick={handleLogin} className="px-6 py-2 rounded-2xl bg-[var(--color-accent)] text-white text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all shadow-lg">
              Join
            </button>
          )}
        </nav>
      </div>

      {/* Prism Link (Feedback) */}
      <button onClick={() => setShowFeedback(true)} className="fixed top-24 left-8 z-[120] p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 transition-all opacity-40 hover:opacity-100 group shadow-2xl">
        <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageSquare size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
      </button>

      <AnimatePresence>
        {showNeuralCommand && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[600] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-2xl w-full bg-[var(--color-glass)] p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic flex items-center gap-4"><Compass className="text-blue-400" /> Neural Command</h2>
                <button onClick={() => setShowNeuralCommand(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Neural Continuity</p>
                    <div className="space-y-3">
                      {localStorage.getItem('dassahs_neural_snapshot') && !data && (
                        <button onClick={() => { setShowNeuralCommand(false); handleResumeSnapshot(); }} className="w-full p-5 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-between group hover:bg-blue-600 hover:border-blue-400 transition-all">
                          <div className="flex items-center gap-4">
                            <Anchor size={20} className="text-blue-400 group-hover:text-white" />
                            <div className="text-left">
                              <p className="text-xs font-black text-white uppercase tracking-widest">Resume Mission</p>
                              <p className="text-[8px] text-blue-400/60 group-hover:text-blue-100 font-bold uppercase tracking-tight">Pick up where you left off</p>
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                      <a href="/dassahs-prism-extension.zip" download className="w-full p-5 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-between group hover:bg-purple-600 hover:border-purple-400 transition-all">
                        <div className="flex items-center gap-4">
                          <Rocket size={20} className="text-purple-400 group-hover:text-white" />
                          <div className="text-left">
                            <p className="text-xs font-black text-white uppercase tracking-widest">Neural Bridge</p>
                            <p className="text-[8px] text-purple-400/60 group-hover:text-purple-100 font-bold uppercase tracking-tight">Download Chrome Extension</p>
                          </div>
                        </div>
                        <Download size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Visual Spectrum</p>
                    <div className="grid grid-cols-2 gap-2">                    {Object.entries(THEMES).map(([id, t]) => (
                      <button key={id} onClick={() => { playClick(); setTheme(id as any); }} className={`p-2 rounded-xl border-2 transition-all flex items-center gap-2 ${theme === id ? 'border-white bg-white/10' : 'border-transparent bg-white/5 opacity-60 hover:opacity-100'}`}>
                        <div className="w-5 h-5 rounded-md" style={{ backgroundColor: t.accent }} />
                        <span className="text-[9px] font-bold text-white truncate">{t.name}</span>
                      </button>
                    ))}
                    </div>
                    </div>
                    </div>

                    <div className="space-y-6">                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Neural Resonance</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[ 
                        {m:'none', i:<X size={14}/>, n:'Silent', d:'Pure focus'}, 
                        {m:'brown', i:<Sun size={14}/>, n:'Resonance', d:'Brown noise'}, 
                        {m:'suspense', i:<Ghost size={14}/>, n:'Harmony', d:'Soundscape', v: suspenseIdx, set: setSuspenseIdx}, 
                        {m:'action', i:<Swords size={14}/>, n:'Zen Flow', d:'Focus rhythm', v: actionIdx, set: setActionIdx} 
                      ].map((s) => (
                        <div key={s.m} className="flex gap-2">
                          <button onClick={() => { playClick(); setAudioMode(s.m as any); }} className={`flex-grow flex items-center gap-3 p-3 rounded-xl transition-all text-left ${audioMode === s.m ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                            <div className={`p-2 rounded-lg ${audioMode === s.m ? 'bg-white/20' : 'bg-white/5'}`}>{s.i}</div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest leading-tight">{s.n} {s.v !== undefined ? `v${s.v + 1}` : ''}</p>
                              <p className="text-[7px] opacity-60 font-medium leading-tight">{s.d}</p>
                            </div>
                          </button>
                          {s.set && (
                            <button 
                              onClick={() => { playClick(); s.set((v: number) => (v + 1) % 3); if (audioMode === s.m) setAudioMode('none'); setTimeout(() => setAudioMode(s.m as any), 10); }}
                              className="p-3 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                              title="Cycle Variation"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button onClick={() => setShowNeuralCommand(false)} className="px-10 py-3 rounded-full bg-white text-black font-black uppercase tracking-[0.4em] text-[9px] hover:scale-105 transition-all">Engage</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNeuralIdentity && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[600] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-[var(--color-glass)] p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col gap-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic flex items-center gap-4"><Crown className="text-amber-400" /> Neural Identity</h2>
                <div className="flex gap-3">
                  <div className="bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20 flex items-center gap-2">
                    <Clock className="text-blue-400" size={12}/><span className="font-black text-white text-[10px]">{totalMinutesSaved}m</span>
                  </div>
                  <div className="bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 flex items-center gap-2">
                    <Brain className="text-purple-400" size={12}/><span className="font-black text-white text-[10px]">{totalWordsRefracted.toLocaleString()} Words</span>
                  </div>
                </div>
                <button onClick={() => setShowNeuralIdentity(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Neural Image</p>
                    <div className="flex flex-wrap gap-3">
                      {DEFAULT_AVATARS.map((av) => (
                        <button key={av.id} onClick={() => handleAvatarSelect(av.id)} className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${avatarUrl === av.id ? 'border-white bg-white/10 scale-110' : 'border-transparent bg-white/5 opacity-40 hover:opacity-100'}`}>
                          {av.icon}
                        </button>
                      ))}
                      <label className="w-12 h-12 rounded-xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/10 transition-all">
                        <Upload size={16} className="text-slate-400" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Neural Vault</p>
                    <button onClick={() => { setShowNeuralIdentity(false); setShowHistory(true); }} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all text-left flex items-center gap-4 group">
                      <Clock className="text-blue-400 group-hover:rotate-[-20deg] transition-transform" size={20} />
                      <div>
                        <p className="text-xs font-bold text-white">Achieving Vault</p>
                        <p className="text-[8px] font-black uppercase text-slate-500">Reading History</p>
                      </div>
                    </button>
                  </div>

                  {!isPaid && (
                    <button onClick={() => { setShowNeuralIdentity(false); setShowPaywall(true); }} className="w-full p-6 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between group overflow-hidden relative shadow-xl">
                      <div className="relative z-10 text-left">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Architect Access</p>
                        <p className="text-lg font-black italic leading-none">Upgrade Link</p>
                      </div>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform relative z-10" />
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Dopamine Vault</p>
                  <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 min-h-[300px] flex flex-col gap-4">
                    {starredItems.length === 0 ? (
                      <div className="flex-grow flex flex-col items-center justify-center text-center p-8 opacity-40">
                        <Star size={40} className="mb-4 text-amber-500" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Star metaphors during reading to anchor them in your vault.</p>
                      </div>
                    ) : (
                      starredItems.map((item, i) => (
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
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }} animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }} className="max-w-4xl w-full refractive-border p-8 md:p-16 rounded-[3rem] md:rounded-[5rem] shadow-[0_0_150px_rgba(255,255,255,0.1)] relative my-auto overflow-hidden">
            {[...Array(12)].map((_, i) => <GlassShard key={i} i={i} color={currentTheme.prism[i % 3]} mousePos={mousePos} />)}
            <motion.div initial={{ x: '-100%', skewX: -20 }} animate={{ x: '200%' }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />
            <button onClick={() => setShowAbout(false)} className="absolute top-8 right-8 p-4 hover:bg-white/10 rounded-full text-slate-400 transition-colors z-20"><X size={32}/></button>
            <div className="space-y-12 relative z-10">
              <motion.header style={{ x: (mousePos.x - 1000) * 0.02, y: (mousePos.y - 500) * 0.02 }} className="space-y-4">
                <div className="flex items-center gap-4 text-blue-400 font-black uppercase tracking-[0.3em] text-xs"><div className="w-12 h-[2px] bg-blue-500/50" /> THE HEART OF DASSAH&apos;S-PRISM</div>
                <h2 className="text-4xl md:text-7xl font-black text-white leading-tight tracking-tight italic pb-6">The <span className="prism-text">Dastastical Founder 🧠✨</span></h2>
              </motion.header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8 text-slate-200 text-lg leading-relaxed font-medium">
                  <motion.div style={{ y: (mousePos.y - 500) * -0.01, x: (mousePos.x - 1000) * -0.01 }} className="bg-gradient-to-r from-blue-500/10 to-transparent p-8 border-l-4 border-blue-500 rounded-r-3xl shadow-xl">
                    <p>For as long as I can remember, the world hasn&apos;t just been loud; it has been a flood of raw, unfiltered data. From a young age, my mind and body processed every detail with profound intensity. For years, I navigated a world that felt like an overwhelming cacophony, battling the sheer exhaustion of a mind trying to process everything at once. I tried to manage this massive cognitive load on my own strength, but it only ever led to paralysis and defeat.</p>
                  </motion.div>
                  
                  <motion.div style={{ y: (mousePos.y - 500) * 0.02, x: (mousePos.x - 1000) * 0.02 }} className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20 p-10 rounded-[3rem] border-2 border-white/10 italic text-white shadow-[0_0_50px_rgba(59,130,246,0.2)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
                    <p className="relative z-10 text-xl md:text-2xl leading-relaxed">
                      The turning point was not a clever productivity hack or a sudden surge of willpower. When my mother and I surrendered our lives to Christ, He stepped into the absolute centre of that mental chaos. He didn&apos;t just quiet the room; He rescued me from the weight of my own mind. I realised then that my profound cognitive intensity was not a glitch. It was a high-powered engine that I had simply been running on the wrong fuel.
                    </p>
                  </motion.div>

                  <motion.div style={{ y: (mousePos.y - 500) * -0.015, x: (mousePos.x - 1000) * -0.015 }} className="bg-gradient-to-r from-purple-500/10 to-transparent p-8 border-l-4 border-purple-500 rounded-r-3xl shadow-xl">
                    <p>It was only through His strength that my greatest source of exhaustion was transformed into my most powerful gift. The victory wasn&apos;t that the world stopped being complex; the victory was that He gave me the peace to finally master it. Guided by His grace, I began to channel that intense processing power into &apos;systems thinking&apos;. Suddenly, I could look under the hood of chaotic environments—whether untangling complex partnerships or building outdoor communities—and build structures that brought clarity, all for His glory.</p>
                  </motion.div>
                  
                  <motion.div style={{ y: (mousePos.y - 500) * 0.01, x: (mousePos.x - 1000) * 0.01 }} className="bg-gradient-to-br from-amber-500/10 to-transparent p-10 rounded-[3rem] border-2 border-amber-500/20 shadow-2xl">
                    <p className="text-white font-bold text-xl leading-relaxed">That is how Dassah&apos;s-Prism was born. It is not merely a tool; it is a living testimony of triumph. Our mission is to empower every neurodivergent soul to reclaim the sovereignty of their focus. We transmute the overwhelming noise of modern information into a purposeful stream of clarity, inviting you to step out of the exhaustion, discover the true purpose of your neurodivergence, and perhaps meet the very Source of this peace.</p>
                    <p className="mt-8 text-3xl font-black italic prism-text">Stay Dastastic! 🌟✨</p>
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
                        <p className="text-white font-black uppercase tracking-tighter text-xl group-hover:text-blue-400 transition-colors">Eng. Jimmy Njuguna</p>
                        <p className="text-slate-400 text-sm font-bold">
                          The loving support of a brother who <span className="text-blue-400 uppercase">ALWAYS PUSHES FOR THE BEST</span> and challenged me to use my tech knowledge for a greater purpose.
                        </p>
                      </div>

                      <div className="border-l-4 border-purple-500 pl-6 space-y-2 group/kizzie">
                        <p className="text-white font-black uppercase tracking-tighter text-xl group-hover:text-purple-400 transition-colors">Dr. Kizzie Shako</p>
                        <p className="text-slate-400 text-sm font-bold">
                          The mentor encouragement that ignited the fire: <span className="text-purple-400 font-black italic">&quot;THEN DO SOMETHING ABOUT IT!&quot;</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div style={{ y: (mousePos.y - 500) * 0.08, x: (mousePos.x - 1000) * -0.02 }} className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 p-8 rounded-[2.5rem] border-2 border-amber-500/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-10 rotate-[-12deg]"><Crown size={100} /></div>
                    <p className="text-amber-500 font-black uppercase text-[10px] tracking-widest mb-6 relative z-10 flex items-center gap-2"><Trophy size={14} /> Dedication & Legacy</p>
                    <div className="space-y-8 relative z-10">
                      <div className="group border-b border-white/5 pb-4">
                        <p className="text-white font-black text-sm uppercase tracking-wider mb-2 group-hover:text-amber-400 transition-colors flex items-center gap-2">DChan <Heart size={12} className="fill-red-500 stroke-red-500" /></p>
                        <p className="text-slate-400 text-xs italic leading-relaxed">&quot;He who finds a wife finds a good thing&quot; — My anchor, who centred me and fixed my eyes on Him.</p>
                      </div>
                      <div className="group border-b border-white/5 pb-4">
                        <p className="text-white font-black text-sm uppercase tracking-wider mb-2">Phido (Mum)</p>
                        <p className="text-slate-400 text-xs leading-relaxed">My foundation, who rooted me in faith so I could stand back up when I fell.</p>
                      </div>
                      <div className="group border-b border-white/5 pb-4">
                        <p className="text-white font-black text-sm uppercase tracking-wider mb-2">Old, old Cucu</p>
                        <p className="text-slate-400 text-xs leading-relaxed">My roots.</p>
                      </div>
                      <div className="group">
                        <p className="text-white font-black text-sm uppercase tracking-wider mb-2">Auntie Sisy</p>
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
                    <span className="text-3xl font-black text-white italic">JG</span>
                  </div>
                  <div>
                    <p className="text-white font-black uppercase text-sm tracking-widest">Founded by JGitu</p>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter flex items-center gap-2">
                      JG <IchthysIcon size={14} className="text-blue-500" /> Rooted in Christ
                    </p>
                  </div>
                </div>
              </footer>
              
              <div className="pt-8 flex justify-center gap-8 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
                <a href="/privacy" className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors">Privacy Shield</a>
                <a href="/terms" className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors">Neural Terms</a>
              </div>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      <AnimatePresence>{showMissionBrief && data && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[600] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-2xl w-full bg-[var(--color-shadow)] border-2 border-blue-500/30 p-10 md:p-16 rounded-[3.5rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setShowMissionBrief(false)} className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
            <div className="space-y-12">
              <div className="bg-blue-500/10 text-blue-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 w-fit flex items-center gap-3"><Rocket size={18}/> Mission Brief</div>
              
              <div className="space-y-4">
                <h2 className="text-[10px] uppercase tracking-[0.5em] text-blue-400 font-black italic">The Vision</h2>
                <p className="text-3xl md:text-5xl font-black leading-[1.1] text-white tracking-tight italic">{isBionic ? <BionicText text={data.whyCare} /> : data.whyCare}</p>
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

              <button onClick={() => setShowMissionBrief(false)} className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs text-white shadow-xl hover:opacity-80 transition-all active:scale-95">Acknowledge & Return</button>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      <AnimatePresence>{showFeedback && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[600] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-md w-full bg-[var(--color-shadow)] border-2 border-amber-500/30 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_0_100px_rgba(245,158,11,0.2)] relative overflow-hidden">
            <button onClick={() => setShowFeedback(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-amber-400 font-black uppercase tracking-widest text-xs"><MessageSquare size={20} /> Feedback Vault</div>
              <h2 className="text-3xl font-black text-white italic">How&apos;s the Prism?</h2>
              {feedbackSuccess ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center space-y-4"><div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400"><CheckCircle2 size={32} /></div><p className="text-white font-bold">Feedback Vaulted!</p></motion.div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <textarea value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)} placeholder="Share your thoughts, bugs, or Grace moments..." className="w-full h-40 p-6 bg-black/20 rounded-2xl border border-[var(--color-border)] text-white focus:outline-none focus:border-amber-500/50 resize-none font-medium" />
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
            <h1 className="text-5xl md:text-9xl font-black text-white leading-[1.2] tracking-tight italic">Dassah&apos;s <span className="prism-text">Prism</span></h1>
            <RefractiveTagline />
          </header>

          <NeuralRefractionSlider />

          <div className="bg-[var(--color-glass)] backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] border-2 border-white/20 p-2 md:p-3 shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden relative group focus-within:border-blue-500/50 hover:border-white/30 transition-all flex flex-col items-center">
            <div className="pt-4 md:pt-6 pb-2 relative">
              <RefractiveNeuralCore loading={loading} inputLength={input.length} isVictorious={false} user={user} mousePos={mousePos} focusMode={focusMode} />
            </div>
            <div className="w-full relative group">
              {showNeuroMirror ? (
                <div className="w-full h-48 md:h-80 bg-black/60 rounded-[1.5rem] md:rounded-[2.5rem] overflow-y-auto border border-white/10"><NeuroMirrorText text={input || "Paste some text..."} /></div>
              ) : (
                <textarea 
                  className="w-full h-48 md:h-80 p-6 md:p-12 text-base md:text-xl bg-black/40 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-white/10 focus:border-blue-500/40 focus:bg-black/50 transition-all resize-none focus:outline-none placeholder:text-slate-600 text-slate-200 leading-relaxed font-medium" 
                  placeholder="Paste the noise here..." 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                />
              )}
            </div>
            <div className="w-full px-6 md:px-12 pb-4">
              <input 
                type="text" 
                value={missionGoal} 
                onChange={(e) => setMissionGoal(e.target.value)} 
                placeholder="What is your Sovereign Goal? (Optional)" 
                className="w-full bg-blue-500/20 border-2 border-blue-500/30 p-3 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-blue-100 placeholder:text-blue-300/40 italic focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/25 transition-all"
              />
            </div>
            <div className="w-full bg-[var(--color-glass)] p-4 md:p-8 rounded-[1.5rem] md:rounded-[3.5rem] flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6 border-t border-white/5">
              <div className="flex items-center gap-3 md:gap-4">
                <button onClick={() => { playClick(); fileInputRef.current?.click(); }} className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-2 md:gap-3"><Upload size={16} className="text-blue-500" /> Clean Document</button>
                <button onClick={() => { playClick(); setShowNeuroMirror(!showNeuroMirror); }} className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border transition-all ${showNeuroMirror ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-[var(--color-glass)] border-[var(--color-border)] text-slate-500'}`}><Ghost size={14} /><span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{showNeuroMirror ? 'Stop' : 'Show Noise'}</span></button>
              </div>
              <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
                <button onClick={() => setIsScenic(!isScenic)} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border transition-all ${isScenic ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-[var(--color-glass)] border-[var(--color-border)] text-slate-500'}`}>{isScenic ? <Sparkles size={16}/> : <Zap size={16}/>}<span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{isScenic ? 'Scenic' : 'Quick'}</span></button>
                <button onClick={() => setStoryMode(!storyMode)} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border transition-all ${storyMode ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-[var(--color-glass)] border-[var(--color-border)] text-slate-500'}`}>{storyMode ? <Rocket size={16}/> : <Anchor size={16}/>}<span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{storyMode ? 'Story' : 'Fact'}</span></button>
                <button 
                  onClick={() => handleSimplify()} 
                  disabled={loading || !input.trim()} 
                  className="flex-[2] sm:flex-none bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white px-6 md:px-20 py-3 md:py-7 rounded-xl md:rounded-[2.5rem] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-[0_0_40px_rgba(147,51,234,0.3)] hover:shadow-[0_0_60px_rgba(147,51,234,0.5)] transition-all active:scale-95 text-sm md:text-lg"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Discern It'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-2xl lg:max-w-3xl w-full pt-24 md:pt-32 pb-20 z-10 px-4">
          <div className="mb-6 md:mb-8 flex justify-end gap-2 md:gap-4">
            <button onClick={() => { setShowMissionBrief(true); playClick(); }} className="p-3 md:p-4 bg-[var(--color-glass)] border border-[var(--color-border)] rounded-xl md:rounded-2xl text-blue-400 hover:text-white transition-all flex items-center gap-2 md:gap-3 font-black uppercase text-[8px] md:text-[10px] tracking-widest"><Rocket size={16}/><span className="hidden xs:inline">Mission Brief</span></button>
            <button onClick={handleDownloadSummary} className="p-3 md:p-4 bg-[var(--color-glass)] border border-[var(--color-border)] rounded-xl md:rounded-2xl text-slate-400 hover:text-white transition-all flex items-center gap-2 md:gap-3 font-black uppercase text-[8px] md:text-[10px] tracking-widest"><Download size={16}/><span className="hidden xs:inline">Save Summary</span></button>
          </div>          <AnimatePresence mode="wait">
            {currentChunk === -1 ? (
              <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="bg-[var(--color-glass)] backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] border border-[var(--color-border)] text-center space-y-8 shadow-2xl relative overflow-hidden">
                <div className="mx-auto w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 animate-pulse"><Zap size={48} /></div>
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter">Neural Refraction Complete</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Saved {data.readingTime} of Cognitive Noise</p>
                </div>
                <div className="flex flex-col gap-4">
                  <button onClick={() => { setCurrentChunk(0); playClick(); }} className="w-full bg-[var(--color-accent)] py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xl shadow-2xl hover:opacity-80 transition-all active:scale-95">Open the Prism <ArrowRight className="inline ml-4"/></button>
                  <button onClick={() => { setShowMissionBrief(true); playClick(); }} className="w-full bg-white/5 py-4 rounded-xl font-black uppercase tracking-[0.3em] text-[10px] text-slate-400 hover:text-white transition-all">View Mission Brief</button>
                </div>
                <button onClick={handleReset} className="absolute top-8 right-8 p-4 text-slate-600 hover:text-red-400 transition-all"><X size={20}/></button>
              </motion.div>
            ) : currentChunk === data.chunks.length ? (              <motion.div key="roadmap" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-[var(--color-glass)] backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] border-2 border-blue-500/30 space-y-12 shadow-2xl relative overflow-hidden"><div className="space-y-4"><h2 className="text-[10px] uppercase tracking-[0.5em] text-blue-400 font-black italic">The Roadmap</h2><h3 className="text-4xl md:text-5xl font-black text-white tracking-tight italic">Priority Overview</h3></div><div className="space-y-6">{data.actions.map((action, i) => (<motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all"><div className="flex items-center gap-6"><div className={`w-3 h-3 rounded-full shadow-[0_0_15px] ${action.priority === 'high' ? 'bg-red-500 shadow-red-500' : action.priority === 'medium' ? 'bg-amber-500 shadow-amber-500' : 'bg-blue-500 shadow-blue-500'}`} /><p className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">{action.task}</p></div><span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${action.priority === 'high' ? 'border-red-500/50 text-red-400 bg-red-500/10' : action.priority === 'medium' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-blue-500/50 text-blue-400 bg-blue-500/10'}`}>{action.priority}</span></motion.div>))}</div><div className="flex flex-col sm:flex-row gap-4 mt-12"><button onClick={() => { playClick(); handleNext(); }} className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 p-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xl shadow-[0_20px_50px_rgba(59,130,246,0.5)] hover:scale-[1.02] transition-all active:scale-95 text-white flex items-center justify-center gap-4">Seal the Prism <CheckCircle2 size={28}/></button></div></motion.div>
            ) : (
              <motion.div key={currentChunk} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0, x: -100 }} className="bg-[var(--color-glass)] backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] border border-[var(--color-border)] min-h-[600px] flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-10 left-10 flex items-center gap-4">
                  <div className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.5em]">Prism Segment {currentChunk + 1} / {data.chunks.length}</div>
                  <button onClick={() => handleReadAloud(data.chunks[currentChunk].content)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-amber-500 text-white shadow-lg animate-pulse' : 'bg-[var(--color-glass)] text-slate-500 hover:text-white border border-[var(--color-border)]'}`}><Volume2 size={16}/></button>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black mb-4 text-white tracking-tighter leading-none pt-12">{isBionic ? <BionicText text={data.chunks[currentChunk].heading} /> : data.chunks[currentChunk].heading}</h2>
                
                {storyMode && showRecap && currentChunk > 0 && (
                  <SceneRecap chunk={data.chunks[currentChunk - 1]} />
                )}
                
                <div className="mb-8 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl">
                  <p className="text-blue-300 text-xs font-black uppercase tracking-widest mb-1">Segment Snap</p>
                  <p className="text-slate-300 font-bold italic">{isBionic ? <BionicText text={data.chunks[currentChunk].summary} /> : data.chunks[currentChunk].summary}</p>
                </div>
                <div className="space-y-8 flex-grow">
                  <div className="bg-blue-500/5 p-8 md:p-12 rounded-[2.5rem] border border-blue-500/10 text-2xl md:text-3xl leading-relaxed font-black text-slate-200 italic shadow-inner">{isBionic ? <BionicText text={data.chunks[currentChunk].content} /> : data.chunks[currentChunk].content}</div>
                  {/* Progress Prism at the bottom of content */}
                  <div className="pt-8">
                    <ProgressPrism current={currentChunk} total={data.chunks.length} />
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
                          className={`p-3 rounded-2xl transition-all shadow-lg ${starredItems.find(i => i.content === data.chunks[currentChunk].dopamineHook && i.type === 'hook') ? 'bg-amber-500 text-white scale-110 shadow-amber-500/40' : 'bg-white/5 text-slate-500 hover:text-amber-400 hover:bg-white/10'}`}
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
                        <div className="flex items-center gap-3 text-purple-400 font-black uppercase tracking-[0.2em] text-[10px]"><Brain size={16} /> The Metaphor</div>
                        <button 
                          onClick={() => handleToggleStar({ heading: 'The Metaphor', content: data.chunks[currentChunk].metaphor, type: 'metaphor' })}
                          className={`p-3 rounded-2xl transition-all shadow-lg ${starredItems.find(i => i.content === data.chunks[currentChunk].metaphor && i.type === 'metaphor') ? 'bg-purple-600 text-white scale-110 shadow-purple-500/40' : 'bg-white/5 text-slate-500 hover:text-purple-400 hover:bg-white/10'}`}
                        >
                          <Star size={18} fill={starredItems.find(i => i.content === data.chunks[currentChunk].metaphor && i.type === 'metaphor') ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <p className="text-xl md:text-2xl font-black text-purple-100 italic leading-tight relative z-10">"{data.chunks[currentChunk].metaphor}"</p>
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex justify-between items-center">
                  <button onClick={() => setCurrentChunk(c => c - 1)} className="px-10 py-6 rounded-2xl font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Back</button>
                  <button onClick={handleNext} className="bg-white text-black px-16 py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-90">{currentChunk === data.chunks.length - 1 ? 'Next Step' : 'Next Segment'}</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.csv,.pdf,.docx" />
      <AnimatePresence>{showHistory && (<motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-0 bottom-0 w-full sm:w-80 bg-[var(--color-shadow)] backdrop-blur-3xl z-[120] p-6 md:p-8 border-r border-[var(--color-border)] shadow-2xl overflow-y-auto"><div className="flex justify-between items-center mb-10"><h2 className="font-bold text-xl flex items-center gap-3 text-white"><Clock size={20} className="text-blue-400" /> Achieving Vault</h2><button onClick={() => setShowHistory(false)} className="p-2 hover:bg-[var(--color-glass)] rounded-full transition-colors"><X size={20} /></button></div><div className="space-y-4">{history.map((item) => (<button key={item.id} onClick={() => { playClick(); setData(item.data); setCurrentChunk(-1); setShowHistory(false); }} className="w-full text-left p-5 rounded-[1.5rem] bg-[var(--color-glass)] hover:bg-white/10 border border-[var(--color-border)] hover:border-blue-500/30 transition-all group"><p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-black">{item.date}</p><p className="text-sm font-bold text-slate-300 group-hover:text-blue-400 line-clamp-2 transition-colors">{item.title}</p></button>))}</div></motion.div>)}</AnimatePresence>

      <AnimatePresence>{showPaywall && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[500] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-slate-900 border-2 border-[var(--color-accent)] p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-center space-y-6 shadow-[0_0_100px_rgba(59,130,246,0.3)] max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="mx-auto w-20 h-20 bg-[var(--color-accent)]/10 rounded-full flex items-center justify-center text-[var(--color-accent)] animate-pulse"><Crown size={40} /></div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter italic">{user ? "Neural Capacity Reached" : "Neural Blueprint Fragmenting"}</h2>
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
                    <p className="text-xl font-black text-white">$9 / Monthly</p>
                    <p className="text-xs text-blue-100 opacity-60 mt-1">Continuous Neural Support & Unlimited Capacity</p>
                  </button>
                  <button onClick={() => handleCheckout("sovereign_lifetime")} className="bg-gradient-to-r from-amber-500 to-yellow-600 p-6 rounded-[2rem] text-left group hover:scale-[1.02] transition-all border border-white/10">
                    <p className="text-[10px] font-black uppercase text-amber-200">Sovereign Master</p>
                    <p className="text-xl font-black text-white">$99 / Lifetime</p>
                    <p className="text-xs text-amber-100 opacity-60 mt-1">Permanent Focus Anchor & Exclusive Resources</p>
                  </button>
                </div>
              )}
              <button onClick={() => setShowPaywall(false)} className="w-full text-slate-600 font-bold uppercase text-[10px] tracking-[0.5em] py-4 hover:text-slate-400 transition-colors">Maintain Current Link</button>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      <AnimatePresence>{isZenLocked && (<motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={handleToggleZenLock} className="fixed top-8 right-8 z-[500] bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-6 rounded-full border-2 border-red-600/50 backdrop-blur-3xl shadow-2xl transition-all group"><X size={32} className="group-hover:rotate-90 transition-transform" /></motion.button>)}</AnimatePresence>

      <AnimatePresence>{data && !isZenLocked && (<div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end gap-4">{chatOpen && (<motion.div initial={{ opacity: 0, y: 50, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.8 }} className="w-[350px] md:w-[450px] bg-[var(--color-shadow)] backdrop-blur-3xl border-2 border-blue-500/30 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden max-h-[500px]"><div className="bg-blue-600 p-6 flex justify-between items-center"><h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-3"><MessageCircle size={18}/> Ask DJ</h3><button onClick={() => setChatOpen(false)} className="text-white hover:bg-white/10 p-2 rounded-xl transition-all"><X size={20}/></button></div><div className="flex-grow overflow-y-auto p-6 space-y-4 text-sm font-medium h-[300px]">{chatHistory.length === 0 && <p className="text-slate-500 italic text-center py-10">"Ask me anything!"</p>}{chatHistory.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[var(--color-glass)] text-slate-300 border border-[var(--color-border)]'}`}>{msg.text}</div></div>))}{chatLoading && <div className="flex justify-start"><div className="bg-[var(--color-glass)] p-4 rounded-2xl animate-pulse text-slate-500">Thinking...</div></div>}</div><form onSubmit={handleChat} className="p-4 border-t border-[var(--color-border)] bg-[var(--color-glass)] flex gap-2"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a question..." className="flex-grow bg-[var(--color-shadow)] p-4 rounded-xl text-white focus:outline-none border border-[var(--color-border)]" /><button type="submit" className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-500 transition-all active:scale-95"><Send size={20} /></button></form></motion.div>)}<button onClick={() => setChatOpen(!chatOpen)} className="p-6 bg-blue-600 text-white rounded-[2rem] shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all active:scale-90 flex items-center gap-4 font-black uppercase tracking-widest text-xs relative overflow-hidden group"><div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" /><MessageCircle size={24} className="relative z-10" /> <span className="relative z-10">Ask DJ</span></button></div>)}</AnimatePresence>
      
      <AnimatePresence>{showVictory && data && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[700] flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="max-w-md w-full bg-slate-900 border-2 border-white/10 p-8 md:p-12 rounded-[3rem] text-center space-y-8 shadow-[0_0_100px_rgba(59,130,246,0.3)] relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.2)_0%,transparent_70%)] pointer-events-none" />
             <button onClick={() => setShowVictory(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all z-20"><X size={20}/></button>
             
             <div className="mx-auto w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 animate-pulse relative z-10"><Trophy size={32} /></div>
             
             <div className="space-y-2 relative z-10">
               <h2 className="text-3xl font-black text-white tracking-tighter italic">NEURAL <span className="prism-text">VICTORY</span></h2>
               <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-[8px]">Sovereignty Reclaimed</p>
             </div>

             <div className="grid grid-cols-2 gap-3 relative z-10">
               <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Time Saved</p>
                 <p className="text-xl font-black text-white">{data.readingTime}</p>
               </div>
               <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Efficiency</p>
                 <p className="text-xl font-black text-white">100%</p>
               </div>
             </div>

             <div className="space-y-3 relative z-10 pt-4">
               <button onClick={handleShare} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                 {isSharing ? <Loader2 className="animate-spin" size={18} /> : <Share2 size={18} />}
                 Share Victory
               </button>
               <button onClick={handleReset} className="w-full text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] py-3 hover:text-slate-300 transition-colors">Return to Vault</button>
             </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      <footer className="w-full py-12 px-4 border-t border-white/5 z-10 flex flex-col items-center gap-4 text-center opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-white font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-3 justify-center">
          JG <IchthysIcon size={12} className="text-blue-500" /> | Rooted in Christ | Dedicated to Dchan.
        </p>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowAbout(true)} className="mt-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">About the Prism</button>
          <button onClick={() => { playClick(); setTutorialStep(0); setShowTutorial(true); }} className="mt-2 px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-all flex items-center gap-2"><Sparkles size={10}/> Neural Guide</button>
        </div>
      </footer>

      <AnimatePresence>
        {showTutorial && (
          <TutorialModal 
            step={tutorialStep} 
            onNext={() => setTutorialStep(s => s + 1)} 
            onClose={() => {
              setShowTutorial(false);
              localStorage.setItem('dassahs_prism_tutorial_complete', 'true');
            }} 
          />
        )}
      </AnimatePresence>
    </main>
      )}
    </>
  );
}

