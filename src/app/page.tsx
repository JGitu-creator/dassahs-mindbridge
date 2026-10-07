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

import { ContextAnchor } from '@/components/prism/ContextAnchor';
import { ProgressPrism } from '@/components/prism/ProgressPrism';
import { ReadAloud } from '@/components/prism/ReadAloud';
import { PrismWeaver } from '@/components/prism/PrismWeaver';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { StackedThemeSelector } from '@/components/morphing/StackedThemeSelector';
import { MorphFish, MorphBrain, MorphZap, MorphRocket, MorphEye, MorphSettings } from '@/components/morphing/MorphIcons';

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
    light: { background: '#e0e7ff', text: '#1e3a8a', accent: '#3b82f6', glass: 'rgba(255,255,255,0.7)', border: 'rgba(59, 130, 246, 0.2)', shadow: "rgba(0,0,0,0.05)" },
    dark: { background: '#020617', text: '#f8fafc', accent: '#3b82f6', glass: 'rgba(30, 41, 59, 0.5)', border: 'rgba(255, 255, 255, 0.1)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#3b82f6', '#8b5cf6', '#06b6d4']
  },
  electric_grace: {
    name: 'Electric Grace',
    icon: Flame,
    light: { background: '#ffe4e6', text: '#881337', accent: '#e11d48', glass: 'rgba(255, 228, 230, 0.7)', border: 'rgba(225, 29, 72, 0.2)', shadow: "rgba(0,0,0,0.05)" },
    dark: { background: '#0f0505', text: '#ffe4e6', accent: '#e11d48', glass: 'rgba(20, 5, 5, 0.5)', border: 'rgba(225, 29, 72, 0.3)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#e11d48', '#fbbf24', '#2dd4bf']
  },
  divine_gold: {
    name: 'Divine Gold',
    icon: Coins,
    light: { background: '#fef3c7', text: '#78350f', accent: '#d97706', glass: 'rgba(255,255,255,0.7)', border: 'rgba(217, 119, 6, 0.2)', shadow: "rgba(0,0,0,0.05)" },
    dark: { background: '#000000', text: '#fffbeb', accent: '#fbbf24', glass: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.4)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#fbbf24', '#f59e0b', '#ffffff']
  },
  hadassah_silk: {
    name: 'Hadassah Silk',
    icon: Gem,
    light: { background: '#d1fae5', text: '#064e3b', accent: '#059669', glass: 'rgba(255,255,255,0.7)', border: 'rgba(5, 150, 105, 0.2)', shadow: "rgba(0,0,0,0.05)" },
    dark: { background: '#022c22', text: '#ecfdf5', accent: '#10b981', glass: 'rgba(6, 78, 59, 0.4)', border: 'rgba(16, 185, 129, 0.2)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#10b981', '#34d399', '#059669']
  },
  sovereign_pulse: {
    name: 'Sovereign Pulse',
    icon: Orbit,
    light: { background: '#f3e8ff', text: '#3b0764', accent: '#7c3aed', glass: 'rgba(255,255,255,0.7)', border: 'rgba(124, 58, 237, 0.2)', shadow: "rgba(0,0,0,0.05)" },
    dark: { background: '#2e1065', text: '#f5f3ff', accent: '#8b5cf6', glass: 'rgba(76, 29, 149, 0.4)', border: 'rgba(139, 92, 246, 0.2)', shadow: "rgba(0,0,0,0.4)" },
    prism: ['#8b5cf6', '#a78bfa', '#7c3aed']
  }
};

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];
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

const IchthysIcon = ({ size = 24, className = "" }) => <MorphFish className={className} />;

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
        className="absolute inset-0 bg-[var(--color-bg-1)]/90 dark:bg-[var(--color-bg-1)]/80 flex flex-col items-center justify-center p-8 md:p-16 text-center select-none backdrop-blur-md"
        style={{ clipPath: `polygon(0% 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0% 100%)` }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--color-text)]/70 mb-6">The Noise</p>
        <p className="text-xl md:text-3xl text-[var(--color-text)] leading-relaxed font-medium">
          This is a very long and confusing sentence that just keeps going and going and your brain might start to wander off because there is no clear structure or path for your eyes to follow.
        </p>
      </div>
      
      <div
        className="absolute inset-0 apple-glass-dark flex flex-col items-center justify-center p-8 md:p-16 text-center select-none z-10"
        style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--prism-1)]/20 via-transparent to-[var(--prism-3)]/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--color-accent)] mb-6 z-20">The Clarity</p>
        <p className="text-xl md:text-3xl text-white font-black leading-relaxed italic z-20 drop-shadow-lg">
          <span className="text-[var(--prism-1)]">Thi</span>s <span className="text-[var(--prism-2)]">i</span>s <span className="text-[var(--prism-3)]">a</span> <span className="text-[var(--prism-1)]">shor</span>t, <span className="text-[var(--color-accent)]">Bioni</span>c <span className="text-[var(--prism-2)]">pat</span>h. <span className="text-[var(--prism-3)]">You</span>r <span className="text-[var(--prism-1)]">brai</span>n <span className="text-[var(--prism-2)]">lock</span>s <span className="text-[var(--color-accent)]">i</span>n <span className="text-[var(--prism-3)]">instan</span>tly.
        </p>
      </div>

      <motion.div
        className="absolute top-0 bottom-0 w-[6px] bg-white/70 z-20 shadow-[0_0_30px_rgba(255,255,255,0.8)] backdrop-blur-md"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-10 h-10 rounded-full bg-white/50 backdrop-blur-xl border border-white/60 shadow-xl flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
        </div>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 border border-white/20 text-[9px] font-black uppercase tracking-[0.3em] text-white rounded-full z-30 pointer-events-none group-hover:opacity-0 transition-opacity duration-300 backdrop-blur-md">
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
        return <span key={i} className="inline-block mr-1"><span className="font-black text-white">{bold}</span><span className="opacity-80">{rest}</span></span>;
      })}
    </>
  );
};

const RefractiveNeuralCore = ({ loading, inputLength, isVictorious, user, mousePos, focusMode }: { loading: boolean, inputLength: number, isVictorious: boolean, user: any, mousePos: {x:number, y:number}, focusMode: string }) => {
  const isTyping = inputLength > 0;
  const duration = loading ? 0.3 : isTyping ? 0.5 : 3;
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
        <div className="cursor-pointer">
          <NeuralCore state={isVictorious && user ? 'success' : 'dormant'} />
        </div>
      </motion.div>
    </div>
  );
};

export default function Home() {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SimplifiedData | null>(null);
  const [currentChunk, setCurrentChunk] = useState(-1);
  const [user, setUser] = useState<any>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('dark');
  const [theme, setTheme] = useState<ThemeMode>('sovereign_pulse');
  const [storyMode, setStoryMode] = useState(false);
  const [isBionic, setIsBionic] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showNeuralCommand, setShowNeuralCommand] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [totalWordsRefracted, setTotalWordsRefracted] = useState(0);
  const [totalMinutesSaved, setTotalMinutesSaved] = useState(0);
  const [focusMode, setFocusMode] = useState<'dastastic' | 'sovereign'>('dastastic');
  const [missionGoal, setMissionGoal] = useState('');

  // Auto-accept TOS & persist user on mount
  useEffect(() => {
    localStorage.setItem('dassahs_prism_tos_accepted', 'true');
    
    supabase.auth.getSession().then(({ data: { session } }) => { 
      setUser(session?.user ?? null); 
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Theme application
  useEffect(() => {
    const isDark = themeMode === 'system' 
      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      : themeMode === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  }, [themeMode]);

  // FIX 1: Set TOS accepted flag before OAuth redirect so user is never logged out
  const handleLogin = async () => {
    localStorage.setItem('dassahs_prism_tos_accepted', 'true');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // FIX 2: Fixed PDF Worker using reliable Cloudflare CDN (No unpkg fake worker failure)
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
        else throw new Error("Could not extract text from PDF.");
      } else {
        const formData = new FormData(); 
        formData.append('file', file);
        const res = await fetch('/api/parse', { method: 'POST', body: formData });
        if (!res.ok) { 
          const errData = await res.json(); 
          throw new Error(errData.error || "Server error"); 
        }
        const result = await res.json(); 
        if (result.text) setInput(result.text);
      }
    } catch (err: any) { 
      alert(`Upload Failed: ${err.message}`); 
    } finally { 
      setLoading(false); 
    }
  };

  // FIX 3: Safe Refraction with fallback for r.tldr
  const handleSimplify = async (textToSimplify = input) => {
    if (!textToSimplify.trim()) return;
    setLoading(true);
    setData(null);

    try {
      const cognitiveMode = focusMode === 'sovereign' ? 'ceo' : 'adhd';
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSimplify,
          cognitiveMode,
          missionGoal,
          storyMode,
        }),
      });

      const raw = await res.json();

      // Safe TLDR check: prevents undefined is not an object ('r.tldr[0].slice')
      const safeTldr = Array.isArray(raw?.tldr) && raw.tldr.length > 0 
        ? raw.tldr 
        : [raw?.summary || raw?.simplified || raw?.result || textToSimplify.slice(0, 200)];

      const formattedData: SimplifiedData = {
        id: raw.id || 'discernment-' + Date.now(),
        tldr: safeTldr,
        whyCare: raw.whyCare || safeTldr[0],
        readingTime: raw.readingTime || '2 min',
        chunks: Array.isArray(raw.chunks) && raw.chunks.length > 0 ? raw.chunks : [
          {
            heading: 'Core Refraction',
            content: raw.simplified || raw.result || textToSimplify,
            summary: safeTldr[0],
            keyTerms: ['Clarity', 'Focus', 'Sovereignty'],
            metaphor: 'The prism separates noise into clear wavelengths.',
            dopamineHook: 'Cognitive sovereignty established.',
          }
        ],
        chartData: raw.chartData || null,
        actions: Array.isArray(raw.actions) ? raw.actions : [
          { task: 'Review key insights', priority: 'high' }
        ],
      };

      setData(formattedData);
      setCurrentChunk(-1);
    } catch (err: any) {
      alert(`The Prism encountered an error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentTheme = THEMES[theme] || THEMES.sovereign_pulse;
  const isDark = themeMode === 'dark';
  const colors = isDark ? currentTheme.dark : currentTheme.light;

  return (
    <main 
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      className={`min-h-screen font-sans flex flex-col items-center justify-between relative overflow-x-hidden transition-all duration-700 ${
        isDark ? 'bg-[#05070e] text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
      style={{
        '--color-bg-1': colors.background,
        '--color-border': colors.border,
        '--color-glass': colors.glass,
        '--color-accent': colors.accent,
        '--prism-1': currentTheme.prism[0],
        '--prism-2': currentTheme.prism[1],
        '--prism-3': currentTheme.prism[2],
      } as any}
    >
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-[110] flex justify-center p-3 md:p-6 pointer-events-none">
        <nav className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-2xl md:rounded-3xl bg-[var(--color-glass)] backdrop-blur-2xl border border-[var(--color-border)] shadow-xl">
          <button 
            onClick={() => setShowNeuralCommand(true)} 
            title="Neural Command" 
            className="p-2 md:p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:text-white transition-all"
          >
            <Compass size={18} />
          </button>
          
          <div className="flex items-center gap-2 px-2">
            <Clock size={12} className="text-blue-400" />
            <span className="font-mono text-xs font-bold">{totalMinutesSaved}m</span>
          </div>

          {/* User Profile or Join Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <img 
                src={user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=Dassah'} 
                alt="Profile" 
                className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-[var(--color-accent)]" 
              />
              <button onClick={handleLogout} title="Log Out" className="p-1 hover:text-red-400 text-slate-400 transition-colors">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin} 
              className="px-4 py-1.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-black uppercase tracking-wider shadow-lg hover:opacity-90 transition-all"
            >
              Join
            </button>
          )}
        </nav>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl lg:max-w-4xl w-full space-y-6 md:space-y-10 z-10 px-4 pt-24 pb-20">
        <header className="text-center space-y-3">
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tight">
            Dassah&apos;s <span className="text-[var(--color-accent)]">Prism</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-medium">Turn overwhelming noise into clear focus in seconds.</p>
        </header>

        <NeuralRefractionSlider />

        {/* Input Box */}
        <div className="bg-[var(--color-glass)] backdrop-blur-2xl rounded-[2.5rem] border border-[var(--color-border)] p-4 shadow-2xl space-y-4">
          <div className="flex flex-col items-center gap-3 pt-2">
            <RefractiveNeuralCore loading={loading} inputLength={input.length} isVictorious={false} user={user} mousePos={mousePos} focusMode={focusMode} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)]">Engage Focus Timer</span>
          </div>

          <textarea 
            className="w-full h-40 p-4 bg-black/30 rounded-2xl border border-[var(--color-border)] text-sm md:text-base text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[var(--color-accent)] transition-all resize-none" 
            placeholder="Paste the noise here..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                title="Upload Document" 
                className="p-2.5 rounded-xl bg-white/5 text-blue-400 hover:bg-white/10 transition"
              >
                <Upload size={16} />
              </button>
              <button 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'environment';
                  input.onchange = (e) => handleFileUpload(e);
                  input.click();
                }} 
                title="Camera Scan" 
                className="p-2.5 rounded-xl bg-white/5 text-emerald-400 hover:bg-white/10 transition"
              >
                <Camera size={16} />
              </button>
              <button 
                onClick={() => setStoryMode(!storyMode)} 
                title="Toggle Story Mode" 
                className={`p-2.5 rounded-xl border transition ${storyMode ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-white/5 border-transparent text-slate-400'}`}
              >
                {storyMode ? <MorphRocket size={16} /> : <Anchor size={16} />}
              </button>
            </div>

            <button 
              onClick={() => handleSimplify()} 
              disabled={loading || !input.trim()} 
              className="px-6 py-2.5 rounded-xl font-black uppercase tracking-wider text-xs bg-[var(--color-accent)] text-white hover:opacity-90 transition shadow-lg flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              <span>Refract</span>
            </button>
          </div>
        </div>

        {/* Refracted Output */}
        {data && (
          <div className="p-6 md:p-8 rounded-[2.5rem] bg-[var(--color-glass)] border border-[var(--color-border)] shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[var(--color-accent)]">Core Takeaways</h3>
            <ul className="space-y-2">
              {data.tldr.map((point, i) => (
                <li key={i} className="text-sm md:text-base leading-relaxed text-slate-200">
                  • {isBionic ? <BionicText text={point} /> : point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.csv,.pdf,.docx" />

      {/* Footer */}
      <footer className="w-full py-8 px-4 border-t border-white/5 flex flex-col items-center gap-3 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
          JG <IchthysIcon size={12} className="text-blue-500" /> | Rooted in Christ | Dedicated to Dchan.
        </p>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAbout(true)} className="text-xs font-semibold text-slate-400 hover:text-white transition">
            About the Prism
          </button>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={() => setThemeMode('light')} className={`p-1.5 rounded-lg ${themeMode === 'light' ? 'bg-white text-black' : 'text-slate-400'}`}><Sun size={12} /></button>
            <button onClick={() => setThemeMode('dark')} className={`p-1.5 rounded-lg ${themeMode === 'dark' ? 'bg-white/20 text-white' : 'text-slate-400'}`}><MoonStar size={12} /></button>
            <button onClick={() => setThemeMode('system')} className={`p-1.5 rounded-lg ${themeMode === 'system' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}`}><Monitor size={12} /></button>
          </div>
        </div>
      </footer>
    </main>
  );
}
