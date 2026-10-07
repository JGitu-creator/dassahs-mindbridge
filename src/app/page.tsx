"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Sparkles, Rocket, ArrowRight, X, Clock, Palette, 
  Upload, Volume2, Share2, Download, MessageCircle, Send, CheckCircle2, 
  Lock, Trophy, Sparkle, BarChart3, MessageSquare, Loader2, Type, Swords, Sun, Moon, Ghost, Star, Settings, MoreHorizontal,
  Compass, Check, LogOut, Shield, Anchor, Heart, Eye, Music, Church, ShieldCheck, Disc, Code, Camera, BookOpen, ChevronRight, MoonStar, Flame, Coins, Gem, Orbit,
  Hexagon, Monitor, Zap, Brain, Fish
} from 'lucide-react';
import { NeuralCore } from '@/components/NeuralCore';
import { CognitiveAscension } from '@/components/CognitiveAscension';
import { MissionLog } from '@/components/MissionLog';
import { Vault } from '@/components/Vault';
import { ContextAnchor } from '@/components/prism/ContextAnchor';
import { ProgressPrism } from '@/components/prism/ProgressPrism';
import { ReadAloud } from '@/components/prism/ReadAloud';
import { PrismWeaver } from '@/components/prism/PrismWeaver';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { StackedThemeSelector } from '@/components/morphing/StackedThemeSelector';
import { MorphFish, MorphBrain, MorphZap, MorphRocket, MorphEye, MorphSettings } from '@/components/morphing/MorphIcons';

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

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

const NeuralEyes = ({ mousePos }: { mousePos: { x: number, y: number } }) => {
  const isMobile = useIsMobile();
  if (isMobile) return null;
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 flex gap-4 z-[200] opacity-30 hover:opacity-100 transition-opacity pointer-events-none">
      {[0, 1].map((i) => (
        <div key={i} className="w-10 h-10 bg-[var(--bg)]/10 rounded-full border border-white/20 flex items-center justify-center relative overflow-hidden backdrop-blur-md">
          <motion.div 
            animate={{ 
              x: (mousePos.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * 0.01,
              y: (mousePos.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) * 0.01 
            }}
            className="flex items-center justify-center"
          >
            <Eye size={24} className="text-blue-500" />
            <div className="absolute w-2 h-2 bg-slate-900 rounded-full" />
          </motion.div>
        </div>
      ))}
    </div>
  );
};

const IchthysIcon = ({ size = 24, className = "" }) => <MorphFish className={className} />;

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
    light: { background: '#f8fafc', text: '#0f172a', accent: '#2563eb', glass: 'rgba(255,255,255,0.85)', border: 'rgba(37, 99, 235, 0.25)', shadow: "rgba(0,0,0,0.06)" },
    dark: { background: '#020617', text: '#f8fafc', accent: '#3b82f6', glass: 'rgba(30, 41, 59, 0.5)', border: 'rgba(255, 255, 255, 0.1)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#3b82f6', '#8b5cf6', '#06b6d4']
  },
  electric_grace: {
    name: 'Electric Grace',
    icon: Flame,
    light: { background: '#fff1f2', text: '#4c0519', accent: '#be123c', glass: 'rgba(255, 255, 255, 0.85)', border: 'rgba(190, 18, 60, 0.25)', shadow: "rgba(0,0,0,0.06)" },
    dark: { background: '#0f0505', text: '#ffe4e6', accent: '#e11d48', glass: 'rgba(20, 5, 5, 0.5)', border: 'rgba(225, 29, 72, 0.3)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#e11d48', '#fbbf24', '#2dd4bf']
  },
  divine_gold: {
    name: 'Divine Gold',
    icon: Coins,
    light: { background: '#fffbeb', text: '#451a03', accent: '#b45309', glass: 'rgba(255,255,255,0.85)', border: 'rgba(180, 83, 9, 0.25)', shadow: "rgba(0,0,0,0.06)" },
    dark: { background: '#000000', text: '#fffbeb', accent: '#fbbf24', glass: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.4)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#fbbf24', '#f59e0b', '#ffffff']
  },
  hadassah_silk: {
    name: 'Hadassah Silk',
    icon: Gem,
    light: { background: '#f0fdf4', text: '#022c22', accent: '#047857', glass: 'rgba(255,255,255,0.85)', border: 'rgba(4, 120, 87, 0.25)', shadow: "rgba(0,0,0,0.06)" },
    dark: { background: '#022c22', text: '#ecfdf5', accent: '#10b981', glass: 'rgba(6, 78, 59, 0.4)', border: 'rgba(16, 185, 129, 0.2)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#10b981', '#34d399', '#059669']
  },
  sovereign_pulse: {
    name: 'Sovereign Pulse',
    icon: Orbit,
    light: { background: '#faf5ff', text: '#1e1b4b', accent: '#6d28d9', glass: 'rgba(255,255,255,0.85)', border: 'rgba(109, 40, 217, 0.25)', shadow: "rgba(0,0,0,0.06)" },
    dark: { background: '#2e1065', text: '#f5f3ff', accent: '#8b5cf6', glass: 'rgba(76, 29, 149, 0.4)', border: 'rgba(139, 92, 246, 0.2)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#8b5cf6', '#a78bfa', '#7c3aed']
  }
};

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
      <div 
        className="absolute inset-0 bg-[var(--color-bg-1)]/90 dark:bg-black/60 flex flex-col items-center justify-center p-8 md:p-16 text-center select-none grayscale opacity-90 backdrop-blur-md"
        style={{ clipPath: `polygon(0% 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0% 100%)` }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--color-text)]/70 mb-6">The Noise</p>
        <p className="text-xl md:text-3xl text-[var(--color-text)] leading-relaxed blur-[0.2px] font-medium">
          This is a very long and confusing sentence that just keeps going and going and your brain might start to wander off because there is no clear structure or path for your eyes to follow.
        </p>
      </div>
      
      <div
        className="absolute inset-0 apple-glass-dark flex flex-col items-center justify-center p-8 md:p-16 text-center select-none z-10"
        style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--prism-1)]/20 via-transparent to-[var(--prism-3)]/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--color-accent)] mb-6 z-20">The Clarity</p>
        <p className="text-xl md:text-3xl text-[var(--fg)] font-black leading-relaxed italic z-20 drop-shadow-lg">
          <span className="text-[var(--prism-1)]">Thi</span>s <span className="text-[var(--prism-2)]">i</span>s <span className="text-[var(--prism-3)]">a</span> <span className="text-[var(--prism-1)]">shor</span>t, <span className="text-[var(--color-accent)]">Bioni</span>c <span className="text-[var(--prism-2)]">pat</span>h. <span className="text-[var(--prism-3)]">You</span>r <span className="text-[var(--prism-1)]">brai</span>n <span className="text-[var(--prism-2)]">lock</span>s <span className="text-[var(--color-accent)]">i</span>n <span className="text-[var(--prism-3)]">instan</span>tly.
        </p>
      </div>

      <motion.div
        className="absolute top-0 bottom-0 w-[6px] bg-white/70 z-20 shadow-[0_0_40px_rgba(255,255,255,0.8)] backdrop-blur-md"
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

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 dark:bg-black/40 border border-white/20 text-[9px] font-black uppercase tracking-[0.3em] text-white rounded-full z-30 pointer-events-none group-hover:opacity-0 transition-opacity duration-300 backdrop-blur-md">
        Slide to Refract
      </div>
    </motion.div>
  );
};

const BionicText = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <>
      {text.split(' ').map((word, i) => {
        const mid = Math.ceil(word.length / 2);
        const bold = word.slice(0, mid);
        const rest = word.slice(mid);
        return (
          <span key={i} className="inline-block mr-1">
            <span className="font-black text-[var(--fg)]">{bold}</span>
            <span className="opacity-80">{rest}</span>
          </span>
        );
      })}
    </>
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
      <NeuralEyes mousePos={mousePos} />
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
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="cursor-pointer"
        >
          <NeuralCore state={isVictorious && user ? 'success' : 'dormant'} />
        </motion.div>
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
  const wordCount = (data.chunks || []).reduce((acc: number, chunk: any) => acc + (chunk.content?.length || 0), 0) / 5;
  const isSunday = getIsSunday();
  const dailyInsight = getDailyInsight();
  
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[1100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-[var(--color-bg-1)] border-2 border-amber-500/30 p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_100px_rgba(245,158,11,0.2)] text-center space-y-6 md:space-y-8 max-h-[90dvh] overflow-y-auto no-scrollbar"
      >
        <div className="mx-auto w-16 h-16 md:w-24 md:h-24 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
          <Trophy size={32} />
        </div>
        
        <div className="space-y-1">
          <p className="text-amber-500 font-black uppercase tracking-[0.4em] text-[8px] md:text-[10px]">Mission Accomplished</p>
          <h2 className="text-2xl md:text-5xl font-black text-[var(--fg)] italic tracking-tighter leading-tight">CEREBRAL RECAP</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-black/5 dark:bg-white/5 p-3 md:p-4 rounded-2xl border border-[var(--color-border)] text-left">
            <p className="text-[7px] md:text-[8px] font-black uppercase text-[var(--fg)] opacity-70 mb-1">Noise Crushed</p>
            <p className="text-sm md:text-xl font-black text-[var(--fg)] italic">~{Math.round(wordCount)} Words</p>
          </div>
          <div className="bg-black/5 dark:bg-white/5 p-3 md:p-4 rounded-2xl border border-[var(--color-border)] text-left">
            <p className="text-[7px] md:text-[8px] font-black uppercase text-[var(--fg)] opacity-70 mb-1">Time Saved</p>
            <p className="text-sm md:text-xl font-black text-[var(--fg)] italic">{data.readingTime || '1 min'}</p>
          </div>
        </div>
        <div className="bg-amber-500/10 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-amber-500/20">
          <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-amber-500 mb-2 md:mb-3 italic">{isSunday ? "Sabbath Mode: Divine Insight" : "Divine Insight"}</p>
          <p className="text-xs md:text-sm text-[var(--fg)] font-bold italic leading-relaxed">
            {isSunday ? dailyInsight : '"Inhale clarity. Your sovereignty is established."'}
          </p>
        </div>
        <button 
          onClick={onFinish}
          className="w-full bg-[var(--color-accent)] text-white py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] md:text-sm hover:scale-105 transition-all active:scale-95 shadow-2xl"
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
        className={`text-lg md:text-xl font-bold italic tracking-tight text-center transition-colors duration-500 ${phase === 'clarity' ? 'text-blue-500 dark:text-blue-400' : 'text-[var(--fg)]'}`}
      >
        &ldquo;{text}&rdquo;
      </motion.p>
    </div>
  );
};

const SnakeLightsBackground = ({ mousePos, theme, themeMode, focusMode }: { mousePos: { x: number, y: number }, theme: ThemeMode, themeMode: 'light' | 'dark' | 'system', focusMode: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = THEMES[theme] || THEMES.midnight_sovereign;
  
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
  }, [focusMode, theme, mousePos]);

  if (focusMode === 'sovereign') return null;
  return (
    <canvas 
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${themeMode === 'light' ? 'opacity-30 mix-blend-multiply' : 'opacity-10'}`}
    />
  );
};

export default function Home() {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SimplifiedData | null>(null);
  const [currentChunk, setCurrentChunk] = useState(-1);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [isPaid, setIsPaid] = useState(false); 
  const [usageCount, setUsageCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isBionic, setIsBionic] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const applyTheme = () => {
      const isDark = themeMode === 'system' 
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : themeMode === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
    };
    applyTheme();
  }, [themeMode]);

  const [theme, setTheme] = useState<ThemeMode>('sovereign_pulse');
  const [brownNoisePlaying, setBrownNoisePlaying] = useState(false);
  const [mouseFocus, setMouseFocus] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showAbout, setShowAbout] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showNeuralCommand, setShowNeuralCommand] = useState(false);
  const [showNeuralIdentity, setShowNeuralIdentity] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [missionGoal, setMissionGoal] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [rewardType, setRewardType] = useState<'none' | 'step' | 'final'>('none');
  const [isScenic, setIsScenic] = useState(false);
  const [simplicityLevel, setSimplicityLevel] = useState<'vibrant' | 'surgical'>('vibrant');
  const [focusMode, setFocusMode] = useState<'dastastic' | 'sovereign'>('dastastic');

  const [totalWordsRefracted, setTotalWordsRefracted] = useState(0);
  const [totalMinutesSaved, setTotalMinutesSaved] = useState(0);
  const [isZenLocked, setIsZenLocked] = useState(false);
  const [isGreyedOut, setIsGreyedOut] = useState(false);
  const [storyMode, setStoryMode] = useState(false);
  const [showMissionBrief, setShowMissionBrief] = useState(false);
  const [breakLevel, setBreakLevel] = useState(1);
  const [showRecap, setShowRecap] = useState(false);

  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const toggleTask = (taskIndex: number) => {
    const key = `${data?.id || 'current'}-${taskIndex}`;
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sealMission = () => {
    setRewardType('final');
    setTimeout(() => {
      setShowRecap(true);
      handleReset();
    }, 3000);
  };

  const addTime = (minutes: number) => {
    setTimeLeft(prev => prev + minutes * 60);
    setTimerActive(true);
  };

  const DEFAULT_AVATARS = [
    { id: 'spark', icon: <Sparkles className="text-amber-400" />, label: 'The Spark' },
    { id: 'prism', icon: <Palette className="text-blue-400" />, label: 'The Prism' },
    { id: 'shield', icon: <Shield className="text-emerald-400" />, label: 'The Shield' },
    { id: 'brain', icon: <MorphBrain className="text-[var(--color-accent)]" />, label: 'The Core' },
    { id: 'crown', icon: <Crown className="text-yellow-500" />, label: 'The Sovereign' },
  ];

  const handleAvatarSelect = async (url: string) => {
    if (!user) return;
    setAvatarUrl(url);
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { 
      setUser(session?.user ?? null); 
      if (session?.user) {
        localStorage.setItem('dassahs_prism_tos_accepted', 'true');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        localStorage.setItem('dassahs_prism_tos_accepted', 'true');
      } else {
        setHistory([]);
        setIsPaid(false);
      }
    });

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
      }, 2500);
    } catch (err) {
      alert("Feedback transmitted to vault.");
    }
  };

  const handleSimplify = async (textToSimplify = input) => {
    if (!textToSimplify.trim()) return; 
    setLoading(true);
    setData(null);
    
    const MAX_CHUNK_SIZE = 2000;
    const chunks = [];
    for (let i = 0; i < textToSimplify.length; i += MAX_CHUNK_SIZE) {
      chunks.push(textToSimplify.slice(i, i + MAX_CHUNK_SIZE));
    }
    
    try {
      const cognitiveMode = focusMode === 'sovereign' ? 'ceo' : 'adhd';
      
      const responses = await Promise.all(chunks.map(async (chunk) => {
        const res = await fetch('/api/simplify', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            text: chunk, 
            isScenic, 
            cognitiveMode, 
            missionGoal, 
            isStory: storyMode,
            simplicityLevel 
          }) 
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Refraction failed (Status ${res.status})`);
        }
        return res.json();
      }));

      const rawResult = responses.reduce((acc, curr) => ({
        ...curr,
        tldr: [...(acc.tldr || []), ...(curr.tldr || [])],
        chunks: [...(acc.chunks || []), ...(curr.chunks || [])],
        actions: [...(acc.actions || []), ...(curr.actions || [])],
      }), { tldr: [], chunks: [], actions: [] });

      const safeTldr = (Array.isArray(rawResult.tldr) && rawResult.tldr.length > 0)
        ? rawResult.tldr
        : [`Core Focus: ${textToSimplify.slice(0, 100)}...`];

      const safeChunks = (Array.isArray(rawResult.chunks) && rawResult.chunks.length > 0)
        ? rawResult.chunks
        : [{
            heading: "Executive Substance",
            content: textToSimplify,
            summary: textToSimplify.slice(0, 140) + '...',
            keyTerms: textToSimplify.split(/\s+/).filter(w => w.length > 4).slice(0, 5),
            metaphor: "A clean crystal capturing the signal.",
            dopamineHook: "Focused clarity distilled from noise."
          }];

      const safeActions = (Array.isArray(rawResult.actions) && rawResult.actions.length > 0)
        ? rawResult.actions
        : [{ task: "Review core insight", priority: "medium" as const }];

      const sanitizedResult: SimplifiedData = {
        id: rawResult.id || Date.now().toString(),
        tldr: safeTldr,
        whyCare: rawResult.whyCare || "Distilled for clarity and executive function.",
        readingTime: rawResult.readingTime || "1 min",
        chunks: safeChunks,
        chartData: rawResult.chartData || null,
        actions: safeActions
      };

      setData(sanitizedResult);
      
      const wordCount = textToSimplify.trim().split(/\s+/).length;
      const minutesSaved = parseInt(sanitizedResult.readingTime) || 1;
      
      setTotalWordsRefracted(prev => prev + wordCount);
      setTotalMinutesSaved(prev => prev + minutesSaved);
      setCurrentChunk(-1);
    } catch (err: any) { 
      alert(err.message || 'The Prism encountered an issue during refraction. Please try again.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDownloadSummary = () => { 
    if (!data) return; 
    const content = `# DASSAH'S PRISM: NEURAL REFRACTION\n\n## THE VISION\n> ${data.whyCare}\n\n## CORE TL;DR\n${data.tldr.map(t => `* **${t}**`).join('\n')}\n\n## PRIORITY ROADMAP\n${data.actions.map(a => `* [ ] **[${a.priority.toUpperCase()}]** ${a.task}`).join('\n')}\n\n---\n*Refracted via Dassah's-Prism.*`; 
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

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0]; 
    if (!file) return; 
    setLoading(true);

    try {
      if (file.name.endsWith('.pdf')) {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`;
        const arrayBuffer = await file.arrayBuffer(); 
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise; 
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i); 
          const textContent = await page.getTextContent();
          const strings = textContent.items.map((item: any) => (item as any).str); 
          fullText += strings.join(' ') + '\n';
        }
        if (fullText.trim()) setInput(fullText); 
        else throw new Error("Could not extract readable text from PDF.");
      } else {
        const formData = new FormData(); 
        formData.append('file', file);
        const res = await fetch('/api/parse', { method: 'POST', body: formData });
        if (!res.ok) { 
          const errData = await res.json().catch(() => ({})); 
          throw new Error(errData.error || "Failed to parse document"); 
        }
        const result = await res.json(); 
        if (result.text) setInput(result.text);
      }
    } catch (err: any) { 
      alert(`Upload Issue: ${err.message}`); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleReadAloud = async (text: string) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const sentences = text.split(/([.!?])/);
    let index = 0;
    setIsPlaying(true);
    const speakNext = () => {
      if (index >= sentences.length || !isPlaying) {
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
      const voice = availableVoices.find(v => v.voiceURI === selectedVoiceId);
      if (voice) utterance.voice = voice;
      utterance.onend = () => setTimeout(speakNext, 300);
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
  };

  const handleNext = () => {
    if (data && currentChunk < data.chunks.length) {
      const nextChunk = currentChunk + 1;
      setCurrentChunk(nextChunk);
      setRewardType('step');
      setTimeout(() => setRewardType('none'), 2000);
    } 
    else if (data && currentChunk === data.chunks.length) {
      setRewardType('final'); 
      setIsZenLocked(false); 
      setTimeout(() => { setShowRecap(true); }, 2000);
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
    if (error) alert("Neural Link: " + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
    setIsPaid(false);
  };

  const currentTheme = THEMES[theme] || THEMES.midnight_sovereign;
  const isDark = themeMode === 'dark';
  const colors = isDark 
    ? (currentTheme.dark || { background: '#020617', text: '#f8fafc', accent: '#3b82f6', glass: 'rgba(30,41,59,0.5)', border: 'rgba(255,255,255,0.1)', shadow: 'rgba(0,0,0,0.5)' }) 
    : (currentTheme.light || { background: '#f8fafc', text: '#0f172a', accent: '#2563eb', glass: 'rgba(255,255,255,0.85)', border: 'rgba(37,99,235,0.25)', shadow: 'rgba(0,0,0,0.06)' });
  
  const themeStyles = `
    :root {
      --color-bg-1: ${colors.background};
      --color-bg-2: ${colors.background};
      --color-text: ${colors.text};
      --color-accent: ${colors.accent};
      --color-glass: ${colors.glass};
      --color-border: ${colors.border};
      --color-shadow: ${colors.shadow};
      --fg: ${colors.text};
      --bg: ${colors.background};
      --prism-1: ${currentTheme.prism[0]};
      --prism-2: ${currentTheme.prism[1]};
      --prism-3: ${currentTheme.prism[2]};
    }
    @keyframes prism-refract { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
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
  `;

  return (
    <>
      <style>{themeStyles}</style>

      {showRecap && <CerebralRecap data={data} onFinish={() => { setShowRecap(false); handleReset(); }} />}

      <main 
        onMouseMove={(e) => mouseFocus && setMousePos({ x: e.clientX, y: e.clientY })} 
        className={`min-h-screen font-sans flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-[var(--color-accent)]/40 transition-all duration-1000 bg-fixed ${isGreyedOut ? 'grayscale sepia contrast-50' : ''}`} 
      >
        <div className="fixed inset-0 -z-10 transition-all duration-1000" style={{ background: focusMode === 'sovereign' ? '#000' : `radial-gradient(circle at 50% 50%, var(--color-bg-1) 0%, var(--color-bg-2) 100%)` }} />
        
        <SnakeLightsBackground theme={theme} themeMode={themeMode} mousePos={mousePos} focusMode={focusMode} />

        {/* Top Floating Navigation */}
        <div className="fixed top-0 left-0 right-0 z-[110] flex justify-center p-2 md:p-6 pointer-events-none">
          <nav className={`pointer-events-auto flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-2xl md:rounded-3xl bg-[var(--color-glass)] backdrop-blur-3xl border border-[var(--color-border)] shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-700 ${isZenLocked ? 'opacity-0 -translate-y-20' : 'opacity-100'}`}>
            <button onClick={() => setShowNeuralCommand(true)} title="Neural Command" className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-black/5 dark:bg-white/5 text-blue-600 dark:text-blue-400 hover:text-[var(--fg)] hover:bg-black/10 dark:hover:bg-white/10 transition-all">
              <Compass size={18} className="md:w-5 md:h-5" />
            </button>
            
            <div className="w-[1px] h-6 bg-[var(--color-border)] mx-0.5 md:mx-1" />
            
            <div className="flex items-center gap-2 md:gap-4 px-1 md:px-2">
              <div className="flex flex-col items-center">
                <p className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.3em] text-blue-600/70 dark:text-blue-400/60 leading-none mb-1">Bandwidth</p>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Clock className="text-blue-600 dark:text-blue-400 md:w-[10px] md:h-[10px]" size={8} />
                  <span className="font-black text-[var(--fg)] text-[10px] md:text-xs tabular-nums">{totalMinutesSaved}m</span>
                  <span className="hidden xs:block w-[1px] h-3 bg-[var(--color-border)] mx-0.5 md:mx-1" />
                  <MorphBrain className="hidden xs:block text-[var(--color-accent)] md:w-[10px] md:h-[10px]" size={8} />
                  <span className="hidden xs:block font-black text-[var(--fg)] text-[10px] md:text-xs tabular-nums">{(totalWordsRefracted / 1000).toFixed(1)}k</span>
                </div>
              </div>
            </div>

            <div className="w-[1px] h-6 bg-[var(--color-border)] mx-0.5 md:mx-1" />
            
            <button onClick={() => setShowHistory(true)} title="Achieving Vault" className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-black/5 dark:bg-white/5 text-amber-600 dark:text-amber-500 hover:text-[var(--fg)] hover:bg-black/10 dark:hover:bg-white/10 transition-all">
              <Clock size={18} className="md:w-5 md:h-5" />
            </button>

            <div className="w-[1px] h-6 bg-[var(--color-border)] mx-0.5 md:mx-1" />

            {/* Profile Avatar / Join Button */}
            {user ? (
              <button 
                onClick={() => setShowNeuralIdentity(true)} 
                title="Neural Identity Profile"
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl overflow-hidden border-2 border-blue-500 hover:border-blue-400 hover:scale-105 transition-all shadow-lg flex items-center justify-center bg-blue-500/10 cursor-pointer"
              >
                {avatarUrl ? (
                  DEFAULT_AVATARS.find(a => a.id === avatarUrl) ? (
                    DEFAULT_AVATARS.find(a => a.id === avatarUrl)?.icon
                  ) : (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  )
                ) : user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase">
                    {user.email?.slice(0, 1)}
                  </div>
                )}
              </button>
            ) : (
              <button onClick={handleLogin} className="px-4 md:px-6 py-1.5 md:py-2 rounded-xl md:rounded-2xl bg-[var(--color-accent)] text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg">
                Join
              </button>
            )}
          </nav>
        </div>

        {/* Floating Feedback Trigger */}
        <button onClick={() => setShowFeedback(true)} className="fixed top-24 left-8 z-[120] p-4 rounded-2xl apple-glass text-[var(--fg)] hover:bg-black/5 dark:hover:bg-white/10 transition-all opacity-70 hover:opacity-100 group shadow-2xl">
          <MessageSquare size={20} className="group-hover:scale-110 transition-transform text-blue-500" />
        </button>

        {/* Input & Refraction Zone */}
        {!data ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl lg:max-w-4xl w-full space-y-6 md:space-y-10 z-10 px-4 pt-20 md:pt-24 pb-20">
            <header className="text-center space-y-4 md:space-y-8 relative">
              <h1 className="text-5xl md:text-9xl font-black text-[var(--fg)] leading-[1.2] tracking-tight italic">Dassah&apos;s <span className="prism-text">Prism</span></h1>
              <RefractiveTagline />
            </header>
            
            <NeuralRefractionSlider />
            
            <div className="bg-[var(--color-glass)] backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] border-2 border-[var(--color-border)] p-2 md:p-3 shadow-xl overflow-hidden relative group focus-within:border-blue-500/50 transition-all flex flex-col items-center">
              <div className="pt-4 md:pt-6 pb-2 relative flex flex-col items-center gap-4">
                <RefractiveNeuralCore loading={loading} inputLength={input.length} isVictorious={false} user={user} mousePos={mousePos} focusMode={focusMode} />
                
                <div className="flex flex-col items-center gap-2">
                  {timerActive ? (
                    <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-2xl border border-[var(--color-border)] backdrop-blur-md">
                      <Clock size={14} className="text-blue-500 dark:text-blue-400 animate-pulse" />
                      <span className="text-sm font-black text-[var(--fg)] tabular-nums">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                      <button onClick={() => addTime(5)} className="ml-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 p-1 rounded-lg" title="Add 5 Min">
                        <Zap size={12} fill="currentColor" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => addTime(15)} className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--fg)] opacity-70 hover:opacity-100 hover:text-blue-500 transition-colors py-2">
                      Engage Focus Timer
                    </button>
                  )}
                </div>
              </div>
              
              <div className="w-full relative group">
                <div className="absolute top-4 left-6 right-6 z-10">
                  <input 
                    type="text" 
                    value={missionGoal} 
                    onChange={(e) => setMissionGoal(e.target.value)} 
                    placeholder="Focus Objective (Optional)" 
                    className="w-full bg-black/5 dark:bg-white/5 border border-[var(--color-border)] p-2 md:p-3 rounded-xl text-[10px] md:text-xs font-bold text-[var(--fg)] placeholder:text-[var(--fg)]/40 italic focus:outline-none focus:border-blue-500/40 transition-all backdrop-blur-md"
                  />
                </div>
                <textarea 
                  className="w-full h-48 md:h-80 pt-16 md:pt-20 p-6 md:p-12 text-base md:text-xl bg-black/5 dark:bg-black/40 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-[var(--color-border)] focus:border-[var(--color-accent)] transition-all resize-none focus:outline-none placeholder:text-slate-400 text-[var(--color-text)] leading-relaxed font-medium" 
                  placeholder="Paste the noise here..." 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                />
              </div>
              
              <div className="w-full bg-[var(--color-glass)] p-3 md:p-4 rounded-3xl md:rounded-full flex items-center justify-between gap-2 md:gap-4 border border-[var(--color-border)] shadow-2xl backdrop-blur-3xl">
                <div className="flex items-center gap-1 md:gap-2 pl-2">
                  <button onClick={() => fileInputRef.current?.click()} title="Clean Document (PDF/Word/Text)" className="p-2 md:p-3 text-[var(--fg)] opacity-70 hover:opacity-100 transition-colors bg-black/5 dark:bg-white/5 rounded-full">
                    <Upload size={16} className="text-blue-500" />
                  </button>
                </div>
                
                <button 
                  onClick={() => handleSimplify()} 
                  disabled={loading || !input.trim()} 
                  className="flex-1 max-w-[200px] bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white py-3 md:py-4 rounded-full font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 text-xs md:text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin text-white" size={16} />
                      <span className="text-[8px] animate-pulse text-white">Refracting...</span>
                    </div>
                  ) : <><Disc size={16} className="text-white" /> Discern</>}
                </button>
                
                <div className="flex items-center gap-2 pr-2">
                  <p className="hidden md:block text-[8px] font-black uppercase text-[var(--fg)] opacity-60 tracking-[0.2em]">Ready to Refract</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-2xl lg:max-w-3xl w-full pt-24 md:pt-32 pb-20 z-10 px-4">
            <div className="mb-6 md:mb-8 flex justify-end gap-2 md:gap-4">
              <button onClick={() => setShowMissionBrief(true)} className="p-3 md:p-4 bg-[var(--color-glass)] border border-[var(--color-border)] rounded-xl md:rounded-2xl text-blue-600 dark:text-blue-400 hover:text-[var(--fg)] transition-all flex items-center gap-2 font-black uppercase text-[8px] md:text-[10px] tracking-widest"><Rocket size={16}/><span className="hidden xs:inline">Mission Brief</span></button>
              <button onClick={handleDownloadSummary} className="p-3 md:p-4 bg-[var(--color-glass)] border border-[var(--color-border)] rounded-xl md:rounded-2xl text-[var(--fg)] opacity-70 hover:opacity-100 transition-all flex items-center gap-2 font-black uppercase text-[8px] md:text-[10px] tracking-widest"><Download size={16}/><span className="hidden xs:inline">Save Summary</span></button>
            </div>
            
            <AnimatePresence mode="wait">
              {currentChunk === -1 ? (
                <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="bg-[var(--color-glass)] backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] border border-[var(--color-border)] text-center space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="mx-auto w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 animate-pulse"><Zap size={48} /></div>
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black text-[var(--fg)] italic tracking-tighter">Neural Refraction Complete</h2>
                    <p className="text-[var(--fg)] opacity-70 font-bold uppercase tracking-[0.4em] text-[10px]">Saved {data.readingTime} of Cognitive Noise</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button onClick={() => setCurrentChunk(0)} className="w-full bg-[var(--color-accent)] text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xl shadow-2xl hover:opacity-90 transition-all active:scale-95">Open the Prism <ArrowRight className="inline ml-4"/></button>
                  </div>
                  <button onClick={handleReset} className="absolute top-8 right-8 p-4 text-[var(--fg)] opacity-40 hover:opacity-100 hover:text-red-500 transition-all"><X size={20}/></button>
                </motion.div>
              ) : currentChunk === data.chunks.length ? (
                <motion.div key="roadmap" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-[var(--color-glass)] backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] border-2 border-blue-500/30 space-y-12 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div className="space-y-4">
                      <h2 className="text-[10px] uppercase tracking-[0.5em] text-blue-500 dark:text-blue-400 font-black italic">The Roadmap</h2>
                      <h3 className="text-4xl md:text-5xl font-black text-[var(--fg)] tracking-tight italic">Priority Overview</h3>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {data.actions.map((action, i) => (
                      <div 
                        key={i} 
                        onClick={() => toggleTask(i)}
                        className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          completedTasks[`${data.id || 'current'}-${i}`] 
                          ? 'bg-emerald-500/10 border-emerald-500/50 opacity-60' 
                          : 'bg-black/5 dark:bg-black/20 border-[var(--color-border)] hover:border-blue-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                            completedTasks[`${data.id || 'current'}-${i}`] 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-[var(--color-border)] text-transparent'
                          }`}>
                            <Check size={14} strokeWidth={4} />
                          </div>
                          <p className={`text-lg font-bold ${
                            completedTasks[`${data.id || 'current'}-${i}`] 
                            ? 'text-[var(--fg)] line-through opacity-50' 
                            : 'text-[var(--fg)]'
                          }`}>
                            {action.task}
                          </p>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/50 text-blue-500 bg-blue-500/10">
                          {action.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={sealMission}
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-500 p-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xl shadow-xl hover:scale-[1.02] transition-all active:scale-95 text-white flex items-center justify-center gap-4"
                  >
                    Seal the Mission <ShieldCheck size={24} />
                  </button>
                </motion.div>
              ) : (
                <motion.div key={currentChunk} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0, x: -100 }} className="apple-glass p-10 md:p-16 rounded-[3.5rem] border border-[var(--color-border)] min-h-[600px] flex flex-col shadow-2xl relative overflow-hidden">
                  <div className="absolute top-10 left-10 flex items-center gap-4">
                    <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 opacity-70 uppercase tracking-[0.5em]">Prism Segment {currentChunk + 1} / {data.chunks.length}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleReadAloud(data.chunks[currentChunk].content)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-amber-500 text-white shadow-lg animate-pulse' : 'bg-black/5 dark:bg-white/5 text-[var(--fg)] border border-[var(--color-border)]'}`} title="Neural Playback"><Volume2 size={16}/></button>
                    </div>
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-black mb-4 text-[var(--fg)] tracking-tighter leading-none pt-12">{isBionic ? <BionicText text={data.chunks[currentChunk].heading} /> : data.chunks[currentChunk].heading}</h2>
                  
                  <div className="mb-8 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl">
                    <p className="text-blue-600 dark:text-blue-300 text-xs font-black uppercase tracking-widest mb-1">Segment Snap</p>
                    <p className="text-[var(--fg)] font-bold italic">{isBionic ? <BionicText text={data.chunks[currentChunk].summary} /> : data.chunks[currentChunk].summary}</p>
                  </div>
                  
                  <div className="space-y-8 flex-grow">
                    <div className="bg-blue-500/5 p-8 md:p-12 rounded-[2.5rem] border border-blue-500/10 text-2xl md:text-3xl leading-relaxed font-black text-[var(--fg)] italic shadow-inner">{isBionic ? <BionicText text={data.chunks[currentChunk].content} /> : data.chunks[currentChunk].content}</div>
                    
                    <div className="pt-8">
                      <ProgressPrism progress={(currentChunk + 1) / data.chunks.length} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-amber-500/5 p-8 rounded-[2.5rem] border-2 border-amber-500/10 space-y-4">
                        <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.2em] text-[10px]"><Rocket size={16} /> Dopamine Hook</div>
                        <p className="text-xl font-black text-[var(--fg)] italic leading-tight">&ldquo;{data.chunks[currentChunk].dopamineHook}&rdquo;</p>
                      </div>
                      
                      <div className="bg-purple-500/5 p-8 rounded-[2.5rem] border-2 border-purple-500/10 space-y-4">
                        <div className="flex items-center gap-3 text-[var(--color-accent)] font-black uppercase tracking-[0.2em] text-[10px]"><Brain size={16} /> The Metaphor</div>
                        <p className="text-xl font-black text-[var(--fg)] italic leading-tight">&ldquo;{data.chunks[currentChunk].metaphor}&rdquo;</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex justify-between items-center">
                    <button onClick={() => setCurrentChunk(c => c - 1)} className="px-10 py-6 rounded-2xl font-black uppercase tracking-widest text-[var(--fg)] opacity-70 hover:opacity-100 transition-all">Back</button>
                    <button onClick={handleNext} className="bg-[var(--color-accent)] text-white px-16 py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-90">{currentChunk === data.chunks.length - 1 ? 'Next Step' : 'Next Segment'}</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.csv,.pdf,.docx" />

        {/* About the Prism Modal */}
        <AnimatePresence>
          {showAbout && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[600] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-xl w-full max-h-[85dvh] overflow-y-auto no-scrollbar bg-[var(--color-bg-1)] p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--color-border)] shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-blue-500" size={24} />
                    <h2 className="text-2xl font-black text-[var(--fg)] italic tracking-tight">About Dassah&apos;s Prism</h2>
                  </div>
                  <button onClick={() => setShowAbout(false)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-[var(--fg)] transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4 text-sm font-medium text-[var(--fg)] opacity-90 leading-relaxed">
                  <p>
                    <strong className="text-blue-500 dark:text-blue-400">Dassah&apos;s Prism</strong> was built to transform overwhelming cognitive noise, dense documents, and scattered information into clear, bionic focus in seconds.
                  </p>
                  <p>
                    Engineered specifically for high-capacity thinkers, ADHD, and executive function support, it refracts long texts into structured, bite-sized mental anchors, dopamine hooks, and actionable priorities.
                  </p>
                  
                  <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)]">Core Pillars</p>
                    <ul className="text-xs space-y-1.5 list-disc list-inside opacity-80">
                      <li><strong>Bionic Refraction:</strong> Eye fixation anchors that accelerate reading comprehension.</li>
                      <li><strong>Cognitive Anchors:</strong> Memorable metaphors and dopamine hooks that lock key concepts.</li>
                      <li><strong>Soundscape & Brown Noise:</strong> Frequency masking to shield your attention span.</li>
                      <li><strong>Sovereign Privacy:</strong> Your text and thoughts belong exclusively to you.</li>
                    </ul>
                  </div>

                  <p className="text-xs opacity-70 italic pt-2">
                    Crafted by JG (Louie Gitu) &bull; Rooted in Christ &bull; Dedicated with love to Dchan.
                  </p>
                </div>

                <button 
                  onClick={() => setShowAbout(false)} 
                  className="w-full py-4 rounded-2xl bg-[var(--color-accent)] text-white font-black uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all shadow-lg"
                >
                  Return to Focus
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Neural Identity Profile Modal */}
        <AnimatePresence>
          {showNeuralIdentity && user && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[600] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md w-full max-h-[85dvh] overflow-y-auto no-scrollbar bg-[var(--color-bg-1)] p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--color-border)] shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <Crown className="text-amber-500" size={24} />
                    <h2 className="text-2xl font-black text-[var(--fg)] italic tracking-tight">Neural Identity</h2>
                  </div>
                  <button onClick={() => setShowNeuralIdentity(false)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-[var(--fg)] transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-blue-500/40 p-1 bg-blue-500/10 flex items-center justify-center shadow-xl">
                    {avatarUrl ? (
                      DEFAULT_AVATARS.find(a => a.id === avatarUrl) ? (
                        <div className="scale-150">{DEFAULT_AVATARS.find(a => a.id === avatarUrl)?.icon}</div>
                      ) : (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                      )
                    ) : user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <span className="text-2xl font-black text-blue-500 uppercase">{user.email?.slice(0, 1)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-base text-[var(--fg)]">{user.user_metadata?.full_name || user.email}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{isPaid ? "Sovereign Member" : "Active Explorer"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] text-center">
                    <p className="text-[8px] font-black uppercase text-[var(--fg)] opacity-60 mb-1">Time Saved</p>
                    <p className="text-xl font-black text-[var(--fg)] tabular-nums">{totalMinutesSaved}m</p>
                  </div>
                  <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] text-center">
                    <p className="text-[8px] font-black uppercase text-[var(--fg)] opacity-60 mb-1">Words Refracted</p>
                    <p className="text-xl font-black text-[var(--fg)] tabular-nums">{(totalWordsRefracted / 1000).toFixed(1)}k</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[var(--fg)] opacity-60">Choose Avatar Signature</p>
                  <div className="flex justify-between gap-2">
                    {DEFAULT_AVATARS.map((av) => (
                      <button 
                        key={av.id}
                        onClick={() => handleAvatarSelect(av.id)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${avatarUrl === av.id ? 'border-amber-500 bg-amber-500/20 scale-110 shadow-lg' : 'border-[var(--color-border)] bg-black/5 dark:bg-white/5'}`}
                      >
                        {av.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button 
                    onClick={() => { setShowNeuralIdentity(false); handleLogout(); }}
                    className="w-full py-3.5 rounded-2xl border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} /> Sever Neural Link (Sign Out)
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Feedback Modal */}
        <AnimatePresence>
          {showFeedback && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[600] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md w-full bg-[var(--color-bg-1)] p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--color-border)] shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="text-blue-500" size={24} />
                    <h2 className="text-2xl font-black text-[var(--fg)] italic tracking-tight">Feedback Vault</h2>
                  </div>
                  <button onClick={() => setShowFeedback(false)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-[var(--fg)] transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {feedbackSuccess ? (
                  <div className="py-8 text-center space-y-3">
                    <CheckCircle2 size={48} className="text-emerald-500 mx-auto animate-bounce" />
                    <p className="text-lg font-black text-[var(--fg)]">Transmitted to Creator!</p>
                    <p className="text-xs text-[var(--fg)] opacity-70">Your insight strengthens the Prism.</p>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <textarea 
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="Share your thoughts, suggestions, or reports with Louie..."
                      className="w-full h-32 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border)] text-[var(--fg)] placeholder:text-[var(--fg)]/40 focus:outline-none focus:border-blue-500 text-sm font-medium resize-none"
                      required
                    />
                    <button 
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-all shadow-lg"
                    >
                      Transmit Feedback
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Mission Brief Modal */}
        <AnimatePresence>
          {showMissionBrief && data && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[600] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-lg w-full max-h-[85dvh] overflow-y-auto no-scrollbar bg-[var(--color-bg-1)] p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-[var(--color-border)] shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <Rocket className="text-blue-500" size={24} />
                    <h2 className="text-2xl font-black text-[var(--fg)] italic tracking-tight">Mission Brief</h2>
                  </div>
                  <button onClick={() => setShowMissionBrief(false)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-[var(--fg)] transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">Why This Matters</p>
                    <p className="text-sm font-bold text-[var(--fg)] leading-relaxed italic">{data.whyCare}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--fg)] opacity-70">Core Takeaways (TL;DR)</p>
                    <div className="space-y-2">
                      {data.tldr.map((point, idx) => (
                        <div key={idx} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--color-border)] flex items-start gap-2.5">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-xs font-bold text-[var(--fg)] leading-snug">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowMissionBrief(false)}
                  className="w-full py-4 rounded-2xl bg-[var(--color-accent)] text-white font-black uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all shadow-lg"
                >
                  Resume Prism
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* History Modal */}
        <AnimatePresence>
          {showHistory && (
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-0 bottom-0 w-full sm:w-80 bg-[var(--color-glass)] backdrop-blur-2xl z-[120] p-6 md:p-8 border-r border-[var(--color-border)] shadow-2xl overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <h2 className="font-bold text-xl flex items-center gap-3 text-[var(--fg)]"><Clock size={20} className="text-blue-500 dark:text-blue-400" /> Achieving Vault</h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-[var(--fg)]"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                {history.map((item) => (
                  <button key={item.id} onClick={() => { setData(item.data); setCurrentChunk(-1); setShowHistory(false); }} className="w-full text-left p-5 rounded-[1.5rem] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-[var(--color-border)] hover:border-blue-500/30 transition-all group">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--fg)] opacity-60 mb-2 font-black">{item.date}</p>
                    <p className="text-sm font-bold text-[var(--fg)] group-hover:text-blue-500 line-clamp-2 transition-colors">{item.title}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="w-full py-12 px-4 border-t border-[var(--color-border)] z-10 flex flex-col items-center gap-4 text-center opacity-70 hover:opacity-100 transition-opacity">
          <p className="text-[var(--fg)] font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-3 justify-center">
            JG <IchthysIcon size={12} className="text-blue-500" /> | Rooted in Christ | Dedicated to Dchan.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowAbout(true)} className="mt-2 px-6 py-2 bg-black/5 dark:bg-white/5 border border-[var(--color-border)] rounded-full text-[8px] font-black uppercase tracking-widest text-[var(--fg)] opacity-70 hover:opacity-100 transition-all">About the Prism</button>
          </div>
        </footer>
      </main>
    </>
  );
}
