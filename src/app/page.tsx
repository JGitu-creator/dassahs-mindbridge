'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Brain, Loader2, RefreshCcw, FileText, 
  CheckCircle2, Upload, BarChart3, Volume2, MessageCircle, 
  X, Send, Sparkles, BookOpen, Clock, Zap, Layers, ChevronRight,
  Headphones, MousePointer2, Type, Star, LogIn, LogOut, Crown,
  Ghost, Swords, Rocket, Music, Trophy, Sparkle, Palette, Fish,
  Share2, Download, ExternalLink, Heart, Lock
} from 'lucide-react';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie,
} from 'recharts';
import { supabase } from '@/lib/supabase';

// --- THEME & CONSTANTS ---
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const THEMES = {
  midnight: { c1: '#0a0f1e', c2: '#050810', accent: '#3b82f6', text: '#f8fafc', glass: 'rgba(255, 255, 255, 0.03)', border: 'rgba(59, 130, 246, 0.2)', shadow: 'rgba(0, 0, 0, 0.8)', name: 'Deep Space' },
  forest: { c1: '#0a2419', c2: '#04120b', accent: '#10b981', text: '#ecfdf5', glass: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.2)', shadow: 'rgba(4, 18, 11, 0.9)', name: 'Eternal Forest' },
  cyberpunk: { c1: '#1a0b2e', c2: '#0f051a', accent: '#d946ef', text: '#fdf4ff', glass: 'rgba(217, 70, 239, 0.05)', border: 'rgba(217, 70, 239, 0.3)', shadow: 'rgba(15, 5, 26, 0.9)', name: 'Neon Tokyo' },
  sunset: { c1: '#2e1a0b', c2: '#1a0f05', accent: '#f59e0b', text: '#fff7ed', glass: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.3)', shadow: 'rgba(26, 15, 5, 0.9)', name: 'Golden Hour' },
  lavender: { c1: '#1e1b4b', c2: '#0f0e2e', accent: '#818cf8', text: '#eef2ff', glass: 'rgba(129, 140, 248, 0.05)', border: 'rgba(129, 140, 248, 0.3)', shadow: 'rgba(15, 14, 46, 0.9)', name: 'Purple Mist' },
  ocean: { c1: '#083344', c2: '#041d24', accent: '#06b6d4', text: '#ecfeff', glass: 'rgba(6, 182, 212, 0.05)', border: 'rgba(6, 182, 212, 0.3)', shadow: 'rgba(4, 29, 36, 0.9)', name: 'Abyssal Blue' },
  mars: { c1: '#450a0a', c2: '#1a0505', accent: '#ef4444', text: '#fef2f2', glass: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.3)', shadow: 'rgba(28, 5, 5, 0.9)', name: 'Crimson Mars' }
};

type Theme = keyof typeof THEMES;

interface SimplifiedData {
  tldr: string[];
  whyCare: string;
  readingTime: string;
  chunks: { heading: string; content: string; keyTerms: string[]; metaphor?: string; dopamineHook?: string; }[];
  chartData: { type: 'bar' | 'line' | 'pie'; data: { name: string; value: number }[]; } | null;
  actions: { task: string; priority: 'high' | 'medium' | 'low' }[];
}

const BionicText = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <>
      {text.split(' ').map((word, i) => {
        if (word.length <= 1) return <span key={i} className="mr-1">{word}</span>;
        const half = Math.ceil(word.length / 2);
        return (
          <span key={i} className="inline-block mr-1">
            <span className="font-black text-white">{word.slice(0, half)}</span>
            <span className="opacity-70">{word.slice(half)}</span>
          </span>
        );
      })}
    </>
  );
};

const StarParticles = ({ count = 20, isFinal = false }: { count?: number, isFinal?: boolean }) => (
  <div className="fixed inset-0 pointer-events-none z-[300]">
    {[...Array(count)].map((_, i) => (
      <motion.div key={i} initial={{ opacity: 1, scale: 0, x: '50vw', y: '50vh' }} animate={{ opacity: 0, scale: Math.random() * 2 + 0.5, x: `${Math.random() * 100}vw`, y: `${Math.random() * 100}vh`, rotate: Math.random() * 720 }} transition={{ duration: isFinal ? 4 : 2, ease: "easeOut" }} className="absolute text-amber-400">
        {i % 2 === 0 ? <Star fill="currentColor" size={isFinal ? 32 : 16} /> : <Sparkle fill="currentColor" size={isFinal ? 24 : 12} />}
      </motion.div>
    ))}
  </div>
);

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

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SimplifiedData | null>(null);
  const [currentChunk, setCurrentChunk] = useState(-1);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isBionic, setIsBionic] = useState(true);
  const [audioMode, setAudioMode] = useState<'none' | 'brown' | 'suspense' | 'action'>('none');
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
  const [showNeuroMirror, setShowNeuroMirror] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [dassahPoints, setDassahPoints] = useState(0);
  const [suspenseIdx, setSuspenseIdx] = useState(0);
  const [actionIdx, setActionIdx] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [isZenLocked, setIsZenLocked] = useState(false);
  
  const catchphrases = ["DASTASTIC FOCUS!", "HADASSAH'S HERO!", "PURE DASSAH-MAGIC!", "FILTER MASTER!", "CLARITY UNLOCKED!"];
  const currentCatchphrase = useMemo(() => catchphrases[Math.floor(Math.random() * catchphrases.length)], [rewardType]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<any>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch('/api/simplify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'chat', question: userMsg, context: data }) });
      const result = await res.json();
      setChatHistory(prev => [...prev, { role: 'ai', text: result.answer }]);
    } catch (err) { setChatHistory(prev => [...prev, { role: 'ai', text: "The Filter is shaky, try again!" }]); } finally { setChatLoading(false); }
  };

  const handleReadAloud = (text: string) => {
    if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); if (session?.user) loadHistory(session.user.id); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); if (session?.user) loadHistory(session.user.id); else setHistory([]); });
    setUsageCount(parseInt(localStorage.getItem('focusfilter_usage') || '0'));
    const urlParams = new URLSearchParams(window.location.search);
    const textParam = urlParams.get('text');
    if (textParam) { setInput(decodeURIComponent(textParam)); handleSimplify(decodeURIComponent(textParam)); window.history.replaceState({}, document.title, "/"); }
    return () => subscription.unsubscribe();
  }, []);

  const loadHistory = async (userId: string) => {
    const { data: dbH } = await supabase.from('history').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (dbH) setHistory(dbH.map(h => ({ id: h.id, date: new Date(h.created_at).toLocaleString(), title: h.title, data: h.data })));
  };

  const handleLogin = async () => { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); };
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setHistory([]); };
  const handleReset = () => { playClick(); setData(null); setInput(''); setCurrentChunk(-1); };

  const playClick = () => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const playSuspenseSound = (variant = suspenseIdx) => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass(); if (ctx.state === 'suspended') ctx.resume();
      audioCtxRef.current = ctx;
      const progressions = [ [261.63, 329.63, 392.00, 523.25], [220.00, 261.63, 329.63, 440.00], [196.00, 246.94, 293.66, 392.00] ];
      const notes = progressions[variant % 3]; let noteIdx = 0;
      const playNote = () => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = variant === 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(notes[noteIdx % notes.length], ctx.currentTime);
        if (variant === 2) { // Add FM synthesis for bells
          const mod = ctx.createOscillator(); const modG = ctx.createGain();
          mod.frequency.setValueAtTime(notes[noteIdx % notes.length] * 2.5, ctx.currentTime);
          modG.gain.setValueAtTime(200, ctx.currentTime);
          mod.connect(modG); modG.connect(osc.frequency); mod.start(); mod.stop(ctx.currentTime + 1.5);
        }
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(variant === 2 ? 0.015 : 0.03, ctx.currentTime + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (variant === 1 ? 2.5 : 1.5));
        osc.connect(g); g.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 3); noteIdx++;
      };
      const interval = setInterval(playNote, variant === 1 ? 1200 : 600);
      noiseNodeRef.current = { disconnect: () => clearInterval(interval) };
    } catch (e) {}
  };

  const playActionSound = (variant = actionIdx) => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass(); if (ctx.state === 'suspended') ctx.resume();
      audioCtxRef.current = ctx;
      if (variant === 0) { // ZEN CHORD
        const freqs = [130.81, 164.81, 196.00];
        freqs.forEach(f => {
          const osc = ctx.createOscillator(); const g = ctx.createGain();
          osc.type = 'sine'; osc.frequency.setValueAtTime(f, ctx.currentTime);
          const lfo = ctx.createOscillator(); lfo.frequency.setValueAtTime(0.5, ctx.currentTime);
          const lfoG = ctx.createGain(); lfoG.gain.setValueAtTime(0.3, ctx.currentTime);
          lfo.connect(lfoG); lfoG.connect(g.gain);
          g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 2);
          osc.connect(g); g.connect(ctx.destination);
          lfo.start(); osc.start(); noiseNodeRef.current = osc;
        });
      } else if (variant === 1) { // DIGITAL RAIN
        const playDrop = () => {
          const osc = ctx.createOscillator(); const g = ctx.createGain();
          osc.type = 'sine'; osc.frequency.setValueAtTime(Math.random() * 500 + 400, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
          g.gain.setValueAtTime(0.02, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.connect(g); g.connect(ctx.destination);
          osc.start(); osc.stop(ctx.currentTime + 0.1);
        };
        const interval = setInterval(playDrop, 150);
        noiseNodeRef.current = { disconnect: () => clearInterval(interval) };
      } else { // OCEANIC BREATH
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer; noise.loop = true;
        const filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
        const lfo = ctx.createOscillator(); lfo.frequency.setValueAtTime(0.3, ctx.currentTime);
        const lfoG = ctx.createGain(); lfoG.gain.setValueAtTime(300, ctx.currentTime);
        lfo.connect(lfoG); lfoG.connect(filter.frequency);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
        noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        lfo.start(); noise.start(); noiseNodeRef.current = noise;
      }
    } catch (e) {}
  };

  useEffect(() => { setDassahPoints(parseInt(localStorage.getItem('dassah_points') || '0')); }, []);

  useEffect(() => {
    if (musicRef.current) { musicRef.current.pause(); musicRef.current = null; }
    if (noiseNodeRef.current) { if (noiseNodeRef.current.disconnect) noiseNodeRef.current.disconnect(); if (noiseNodeRef.current.stop) noiseNodeRef.current.stop(); noiseNodeRef.current = null; }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') { audioCtxRef.current.close(); audioCtxRef.current = null; }
    if (audioMode === 'suspense') playSuspenseSound(suspenseIdx);
    else if (audioMode === 'action') playActionSound(actionIdx);
    else if (audioMode === 'brown') {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass(); const bufferSize = 4096; let lastOut = 0.0;
      const node = ctx.createScriptProcessor(bufferSize, 1, 1);
      node.onaudioprocess = (e: any) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) { const white = Math.random() * 2 - 1; out[i] = (lastOut + (0.02 * white)) / 1.02; lastOut = out[i]; out[i] *= 3.5; }
      };
      node.connect(ctx.destination); audioCtxRef.current = ctx; noiseNodeRef.current = node;
    }
    return () => { if (noiseNodeRef.current && noiseNodeRef.current.disconnect) noiseNodeRef.current.disconnect(); if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') audioCtxRef.current.close(); };
  }, [audioMode, suspenseIdx, actionIdx]);

  const handleSimplify = async (textToSimplify = input) => {
    playClick(); if (!textToSimplify.trim()) return; if (usageCount >= (user ? 10 : 3)) { setShowPaywall(true); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/simplify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: textToSimplify, isScenic }) });
      const result = await res.json(); setData(result);
      const title = result.tldr[0].slice(0, 30) + '...';
      if (user) { await supabase.from('history').insert({ user_id: user.id, title, data: result }); loadHistory(user.id); }
      setUsageCount(prev => { const next = prev + 1; localStorage.setItem('focusfilter_usage', next.toString()); return next; });
      setCurrentChunk(-1);
      } catch (err) { alert('The Filter encountered a storm!'); } finally { setLoading(false); }
  };

  const handleShare = async () => { if (!data) return; setIsSharing(true); try { const shareText = `Check out this Filter I built on Dassah's FocusFilter!\n\n${data.whyCare}\n\nFilter Link: ${window.location.origin}/?text=${encodeURIComponent(input)}`; await navigator.clipboard.writeText(shareText); alert("Link Copied!"); } catch (err) { alert("Could not create share link."); } finally { setIsSharing(false); } };
  const handleDownloadSummary = () => { if (!data) return; const content = `DASSAH'S FOCUSFILTER SUMMARY\n\nTHE VISION:\n${data.whyCare}\n\nTL;DR:\n${data.tldr.map(t => `- ${t}`).join('\n')}\n\nFULL FILTER LINK: ${window.location.origin}/?text=${encodeURIComponent(input)}`; const blob = new Blob([content], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `focusfilter-summary.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0]; if (!file) return; setLoading(true);
    try {
      const formData = new FormData(); formData.append('file', file);
      const res = await fetch('/api/parse', { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Server error");
      const result = await res.json(); if (result.text) setInput(result.text);
    } catch (err: any) { alert(`Failed to read document.`); } finally { setLoading(false); }
  };

  const handleToggleZenLock = () => {
    playClick();
    if (isZenLocked) {
      if (confirm("Wait! Breaking Hadassah's Lock costs 5 Dassah Points. Are you sure?")) {
        setDassahPoints(prev => { const next = Math.max(0, prev - 5); localStorage.setItem('dassah_points', next.toString()); return next; });
        setIsZenLocked(false);
        if (document.fullscreenElement) document.exitFullscreen();
      }
    } else {
      setIsZenLocked(true);
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleNext = () => {
    if (data && currentChunk < data.chunks.length - 1) { setCurrentChunk(c => c + 1); setRewardType('step'); setTimeout(() => setRewardType('none'), 2000); } 
    else if (data && currentChunk === data.chunks.length - 1) {
      setRewardType('final'); setIsZenLocked(false); if (document.fullscreenElement) document.exitFullscreen();
      setDassahPoints(prev => { const next = prev + 10; localStorage.setItem('dassah_points', next.toString()); return next; });
      setTimeout(() => { setRewardType('none'); handleReset(); }, 5000);
    }
  };

  const currentTheme = THEMES[theme];
  const themeStyles = `
    :root {
      --color-bg-1: ${currentTheme.c1}; --color-bg-2: ${currentTheme.c2};
      --color-text: ${currentTheme.text}; --color-accent: ${currentTheme.accent};
      --color-glass: ${currentTheme.glass}; --color-border: ${currentTheme.border};
      --color-shadow: ${currentTheme.shadow};
    }
  `;

  return (
    <>
      <style>{themeStyles}</style>
      <main onMouseMove={(e) => mouseFocus && setMousePos({ x: e.clientX, y: e.clientY })} className="min-h-screen font-sans flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-blue-500/40 transition-all duration-1000" style={{ background: `radial-gradient(circle at 50% 50%, var(--color-bg-1) 0%, var(--color-bg-2) 100%)`, color: 'var(--color-text)' }}>
      <div className="fixed inset-0 pointer-events-none opacity-20"><div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `radial-gradient(var(--color-accent) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} /><div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black/40" /></div>

      <AnimatePresence>{rewardType !== 'none' && (
        <><StarParticles count={rewardType === 'final' ? 100 : 30} isFinal={rewardType === 'final'} /><motion.div initial={{ opacity: 0, scale: 0.5, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.5 }} className="fixed inset-0 z-[400] flex items-center justify-center pointer-events-none p-4 text-center"><div className="bg-gradient-to-br from-blue-600 via-purple-600 to-amber-500 p-8 md:p-16 rounded-[3rem] md:rounded-[5rem] shadow-[0_0_150px_rgba(59,130,246,0.8)] border-4 border-white/30 backdrop-blur-3xl flex flex-col items-center gap-6"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Trophy size={rewardType === 'final' ? 80 : 48} className="text-white" /></motion.div><h2 className="font-black italic text-4xl md:text-8xl text-white tracking-tighter drop-shadow-2xl">{rewardType === 'final' ? "HADASSAH TRIUMPH!" : currentCatchphrase}</h2>{rewardType === 'final' && <p className="text-white/80 font-bold uppercase tracking-widest md:text-xl">You conquered the noise!</p>}</div></motion.div></>
      )}</AnimatePresence>

      <nav className={`fixed top-0 left-0 right-0 z-[110] p-2 md:p-4 flex justify-between items-center bg-[var(--color-glass)] backdrop-blur-md border-b border-[var(--color-border)] transition-all duration-500 ${isZenLocked ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100'}`}>
        <div className="flex gap-1 md:gap-2 items-center sm:max-w-none">
          <button onClick={() => { playClick(); setShowHistory(true); }} className="p-2 md:p-4 bg-[var(--color-glass)] rounded-xl md:rounded-2xl border border-[var(--color-border)] text-slate-400 hover:text-blue-400 shadow-xl transition-all active:scale-90 flex-shrink-0"><Clock size={18}/></button>
          <div className="flex bg-[var(--color-glass)] p-1 rounded-xl md:rounded-2xl border border-[var(--color-border)] shadow-xl flex-shrink-0">
            <button onClick={() => { playClick(); setIsBionic(!isBionic); }} title="Bionic Reading" className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all ${isBionic ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Type size={18}/></button>
            {data && (
              <button onClick={handleToggleZenLock} title="Zen Lock Focus" className={`px-2 md:px-4 py-2 rounded-lg md:rounded-xl transition-all flex items-center gap-1 md:gap-2 ${isZenLocked ? 'bg-red-600 text-white shadow-lg animate-pulse' : 'text-slate-400 hover:text-white'}`}>
                {isZenLocked ? <Crown size={16}/> : <Lock size={16}/>}
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden lg:block">{isZenLocked ? 'Locked' : 'Zen Lock'}</span>
              </button>
            )}
            <div className="flex items-center gap-0.5 md:gap-1 px-1 md:px-2 border-l border-[var(--color-border)] ml-0.5 md:ml-1">
              {[ {m:'none', i:<X size={10}/>, n:'Silent'}, {m:'brown', i:<Layers size={10}/>, n:'White Noise'}, {m:'suspense', i:<Ghost size={10}/>, n:'Mozart Harmony'}, {m:'action', i:<Swords size={10}/>, n:'Zen Baroque'} ].map((s) => (
                <button key={s.m} onClick={() => { playClick(); if (audioMode === s.m) { if (s.m === 'suspense') setSuspenseIdx(i => (i + 1) % 3); if (s.m === 'action') setActionIdx(i => (i + 1) % 3); } setAudioMode(s.m as any); }} title={s.n} className={`w-7 h-7 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center transition-all relative ${audioMode === s.m ? 'bg-emerald-600 text-white shadow-md' : 'bg-[var(--color-glass)] text-slate-500 hover:text-slate-300'}`}>
                  {s.i}{audioMode === s.m && s.m !== 'none' && s.m !== 'brown' && (<span className="absolute -top-1 -right-1 text-[6px] font-black bg-white text-emerald-600 px-1 rounded-full">{(s.m === 'suspense' ? suspenseIdx : actionIdx) + 1}</span>)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="hidden lg:flex items-center bg-[var(--color-glass)] p-1 rounded-2xl border border-[var(--color-border)] shadow-xl ml-2">
            {Object.entries(THEMES).map(([id, t]) => (
              <button key={id} onClick={() => { playClick(); setTheme(id as any); }} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${theme === id ? 'bg-[var(--color-accent)] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{t.name}</button>
            ))}
          </div>

          <div className="lg:hidden relative ml-1" ref={themeMenuRef}>
            <button onClick={(e) => { e.stopPropagation(); setShowThemeMenu(!showThemeMenu); }} className="bg-[var(--color-glass)] p-2.5 rounded-xl text-slate-400 border border-[var(--color-border)] shadow-xl hover:text-blue-400 transition-all"><Palette size={18} /></button>
            <AnimatePresence>
              {showThemeMenu && (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute top-full right-0 mt-2 w-16 bg-[var(--color-shadow)] backdrop-blur-3xl border border-[var(--color-border)] rounded-2xl p-2 z-[200] shadow-2xl flex flex-col gap-2 items-center">
                  {Object.entries(THEMES).map(([id, t]) => (
                    <button key={id} onClick={() => { playClick(); setTheme(id as any); setShowThemeMenu(false); }} className={`w-10 h-10 rounded-full border-2 transition-all flex-shrink-0 ${theme === id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`} style={{ backgroundColor: t.accent }} title={t.name} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => { playClick(); setShowAbout(true); }} className="p-2 md:p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl md:rounded-2xl border border-red-500/20 text-red-400 transition-all active:scale-90" title="Our Story"><Heart size={18} fill={showAbout ? "currentColor" : "none"} /></button>
          <div className="flex items-center gap-1.5 md:gap-2 bg-amber-500/10 px-2 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-amber-500/20 shadow-inner"><Sparkle size={12} className="text-amber-400 animate-pulse" /><span className="text-[10px] md:text-xs font-black text-amber-200 uppercase tracking-tighter">{dassahPoints}<span className="hidden sm:inline"> Points</span></span></div>
          {user ? (
            <button onClick={handleLogout} className="bg-[var(--color-glass)] px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl border border-[var(--color-border)] text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all">Out</button>
          ) : (
            <button onClick={handleLogin} className="bg-[var(--color-accent)] hover:opacity-80 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-[0_10px_25px_rgba(59,130,246,0.4)] transition-all active:scale-95">Join</button>
          )}
        </div>
      </nav>

      <AnimatePresence>{showAbout && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[600] flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="max-w-3xl w-full bg-[var(--color-shadow)] border-2 border-[var(--color-border)] p-8 md:p-16 rounded-[3rem] md:rounded-[5rem] shadow-[0_0_100px_rgba(59,130,246,0.2)] relative my-auto">
            <button onClick={() => setShowAbout(false)} className="absolute top-8 right-8 p-4 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={32}/></button>
            
            <div className="space-y-12">
              <header className="space-y-4">
                <div className="flex items-center gap-4 text-blue-400 font-black uppercase tracking-[0.3em] text-xs">
                  <div className="w-12 h-[2px] bg-blue-500/50" /> THE HEART OF FOCUSFILTER
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter italic">From Noise to Divine <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Clarity</span></h2>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6 text-slate-300 text-lg leading-relaxed font-medium">
                  <p>FocusFilter isn't just a productivity tool; it's a testimony. For those of us on the spectrum, heavy ADHD isn't a deficiency—it's a high-powered engine that needs the right fuel. Guided by my Christian faith, I saw this condition as a divine gift, a unique lens through which to see the world.</p>
                  <p>Our mission is to empower every neurodivergent soul to reclaim their focus. We transform the overwhelming "noise" of modern information into a stream of actionable, engaging clarity.</p>
                </div>
                <div className="space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 italic">
                  <p className="text-blue-400 font-black uppercase text-xs tracking-widest mb-4">The Origin</p>
                  <p className="text-slate-400">"It started as a joke during a conversation about how much I suffered trying to read or concentrate. My cousin and most loving mentor, <span className="text-white font-bold">Dr. Kizzie Shako</span>, looked at me and said: <span className="text-blue-400 uppercase font-black tracking-tight">'Then do something about it.'</span>"</p>
                  <p className="text-slate-400 mt-4">— And so, the Filter was built.</p>
                </div>
              </div>

              <div className="space-y-8 pt-8 border-t border-white/10">
                <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4"><Zap size={24} className="text-amber-500" /> The Methodology</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { n: "01", t: "The Noise", d: "Paste any overwhelming text, article, or document into the Filter." },
                    { n: "02", t: "The Grace", d: "Our expert cognitive logic distills complexity into high-stimulation segments." },
                    { n: "03", t: "The Victory", d: "Experience clarity with Bionic reading, audio harmonies, and Zen focus." }
                  ].map((step, i) => (
                    <div key={i} className="space-y-3">
                      <span className="text-4xl font-black text-blue-500/30 tracking-tighter">{step.n}</span>
                      <p className="text-white font-black uppercase text-sm tracking-widest">{step.t}</p>
                      <p className="text-slate-500 text-sm font-medium">{step.d}</p>
                    </div>
                  ))}
                </div>
              </div>

              <footer className="pt-12 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-white/10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <span className="text-3xl font-black text-white italic">DJ</span>
                  </div>
                  <div>
                    <p className="text-white font-black uppercase text-sm tracking-widest">Founded by DJ</p>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter flex items-center gap-2">
                      DChan + JGitu <Fish size={14} className="text-blue-500" /> Rooted in Christ
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] text-center sm:text-right">Dedicated to my forever partner and best friend, DChan.</p>
              </footer>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {!data ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl lg:max-w-4xl w-full space-y-10 z-10 px-4 pt-24">
          <header className="text-center space-y-6"><motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 8 }} className="mx-auto w-28 h-28 md:w-40 md:h-40 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-400 text-white rounded-[2.5rem] md:rounded-[4rem] flex items-center justify-center shadow-[0_25px_60px_rgba(59,130,246,0.4)] border-2 border-white/20 relative"><Brain className="w-16 h-16 md:w-20 md:h-20" /></motion.div><h1 className="text-6xl md:text-9xl font-black text-white leading-none tracking-tighter italic text-center">Dassah's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">FocusFilter</span></h1><p className="text-xl md:text-3xl text-slate-400 font-medium tracking-tight flex items-center gap-2 justify-center">By <span className="text-white border-b-2 border-blue-500 pb-1">DJ</span> <Fish size={24} className="text-blue-500" /></p></header>
          <div className="bg-[var(--color-glass)] backdrop-blur-3xl rounded-[3rem] border border-[var(--color-border)] p-3 shadow-2xl overflow-hidden relative">
            {showNeuroMirror ? (<div className="w-full h-64 md:h-80 bg-black/20 rounded-[2.5rem] overflow-y-auto"><NeuroMirrorText text={input || "Paste some text..."} /></div>) : (<textarea className="w-full h-64 md:h-80 p-8 md:p-12 text-lg md:text-xl bg-transparent resize-none focus:outline-none placeholder:text-slate-800 text-slate-200 leading-relaxed font-medium" placeholder="Paste the noise here..." value={input} onChange={(e) => setInput(e.target.value)} />)}
            <div className="bg-[var(--color-glass)] p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] flex flex-col sm:flex-row justify-between items-center gap-6 border border-[var(--color-border)]"><div className="flex items-center gap-4"><button onClick={() => { playClick(); fileInputRef.current?.click(); }} className="text-xs text-slate-500 font-black uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-4"><Upload size={24} className="text-blue-500" /> Clean Document</button><button onClick={() => { playClick(); setShowNeuroMirror(!showNeuroMirror); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${showNeuroMirror ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-[var(--color-glass)] border-[var(--color-border)] text-slate-500'}`}><Ghost size={16} /><span className="text-[10px] font-black uppercase tracking-widest">{showNeuroMirror ? 'Stop the Noise' : 'Show the Noise'}</span></button></div><div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"><button onClick={() => setIsScenic(!isScenic)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all ${isScenic ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-[var(--color-glass)] border-[var(--color-border)] text-slate-500'}`}>{isScenic ? <Sparkles size={18}/> : <Zap size={18}/>}<span className="text-[10px] font-black uppercase tracking-widest">{isScenic ? 'Scenic Route' : 'Quick Filter'}</span></button><button onClick={() => handleSimplify()} disabled={loading || !input.trim()} className="w-full sm:w-auto bg-gradient-to-r from-[var(--color-accent)] to-blue-400 text-white px-12 md:px-20 py-5 md:py-7 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:shadow-blue-500/50 transition-all active:scale-95 text-lg">{loading ? <Loader2 className="animate-spin" /> : 'Filter It'}</button></div></div>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-2xl lg:max-w-3xl w-full pt-32 pb-20 z-10 px-4">
          <div className="mb-8 flex justify-end gap-4">
            <button onClick={handleShare} className="p-4 bg-[var(--color-glass)] border border-[var(--color-border)] rounded-2xl text-slate-400 hover:text-white transition-all flex items-center gap-3 font-black uppercase text-[10px] tracking-widest">
              <Share2 size={18}/> {isSharing ? 'Copying...' : 'Share Filter'}
            </button>
            <button onClick={handleDownloadSummary} className="p-4 bg-[var(--color-glass)] border border-[var(--color-border)] rounded-2xl text-slate-400 hover:text-white transition-all flex items-center gap-3 font-black uppercase text-[10px] tracking-widest">
              <Download size={18}/> Save Summary
            </button>
          </div>
          <AnimatePresence mode="wait">
            {currentChunk === -1 ? (
              <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="bg-[var(--color-glass)] backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] border border-[var(--color-border)] space-y-12 shadow-2xl"><div className="flex items-center justify-between"><div className="bg-blue-500/10 text-blue-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-3"><Rocket size={18}/> Saved {data.readingTime}</div><button onClick={handleReset} className="p-5 bg-[var(--color-glass)] rounded-3xl text-slate-500 hover:text-red-400 transition-all"><X size={24}/></button></div><div className="space-y-8"><h2 className="text-[10px] uppercase tracking-[0.5em] text-blue-400 font-black italic">The Vision</h2><p className="text-4xl md:text-5xl font-black leading-[1.1] text-white tracking-tight">{isBionic ? <BionicText text={data.whyCare} /> : data.whyCare}</p></div><div className="space-y-10">{data.tldr.map((point, i) => (<motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} key={i} className="flex items-start group"><span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[var(--color-glass)] text-blue-400 flex items-center justify-center font-black mr-8 border border-[var(--color-border)] group-hover:border-blue-500/50 transition-all text-lg">{i + 1}</span><p className="text-xl md:text-2xl font-bold text-slate-300 leading-snug">{isBionic ? <BionicText text={point} /> : point}</p></motion.div>))}</div><button onClick={() => { setCurrentChunk(0); playClick(); }} className="w-full bg-[var(--color-accent)] py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xl shadow-2xl hover:opacity-80 transition-all active:scale-95">Open the Filter <ArrowRight className="inline ml-4"/></button></motion.div>
            ) : (
              <motion.div key={currentChunk} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0, x: -100 }} className="bg-[var(--color-glass)] backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] border border-[var(--color-border)] min-h-[600px] flex flex-col shadow-2xl relative overflow-hidden"><div className="absolute top-10 left-10 flex items-center gap-4"><div className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.5em]">Filter Segment {currentChunk + 1} / {data.chunks.length}</div><button onClick={() => handleReadAloud(data.chunks[currentChunk].content)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-amber-500 text-white shadow-lg animate-pulse' : 'bg-[var(--color-glass)] text-slate-500 hover:text-white border border-[var(--color-border)]'}`}><Volume2 size={16}/></button></div><h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tighter leading-none pt-12">{isBionic ? <BionicText text={data.chunks[currentChunk].heading} /> : data.chunks[currentChunk].heading}</h2><div className="space-y-8 flex-grow"><div className="bg-blue-500/5 p-8 md:p-12 rounded-[2.5rem] border border-blue-500/10 text-2xl md:text-3xl leading-relaxed font-black text-slate-200 italic shadow-inner">{isBionic ? <BionicText text={data.chunks[currentChunk].content} /> : data.chunks[currentChunk].content}</div>{data.chartData && currentChunk === 0 && (<div className="bg-[var(--color-glass)] p-10 rounded-[3rem] border border-[var(--color-border)] space-y-6"><div className="flex items-center gap-3 text-blue-400 font-black uppercase tracking-widest text-xs"><BarChart3 size={20} /> Data Pulse</div><div className="h-[250px] w-full"><ResponsiveContainer width="100%" height="100%">{data.chartData.type === 'bar' ? (<BarChart data={data.chartData.data}><XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff' }} /><Bar dataKey="value" radius={[10, 10, 0, 0]}>{data.chartData.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart>) : data.chartData.type === 'line' ? (<LineChart data={data.chartData.data}><XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff' }} /><Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6' }} /></LineChart>) : (<PieChart><Pie data={data.chartData.data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>{data.chartData.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff' }} /></PieChart>)}</ResponsiveContainer></div></div>)}{data.actions && data.actions.length > 0 && currentChunk === data.chunks.length - 1 && (<div className="bg-emerald-500/5 p-10 rounded-[3rem] border border-emerald-500/10 space-y-8"><div className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-widest text-xs"><CheckCircle2 size={20} /> Mission Checklist</div><div className="space-y-4">{data.actions.map((action, i) => (<div key={i} className="flex items-center gap-6 p-6 bg-[var(--color-glass)] rounded-2xl border border-[var(--color-border)] group hover:border-emerald-500/30 transition-all"><div className={`w-3 h-3 rounded-full ${action.priority === 'high' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : action.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} /><p className="flex-grow text-xl font-bold text-slate-300 group-hover:text-white transition-colors">{action.task}</p><div className="text-[10px] font-black uppercase tracking-widest opacity-30">{action.priority}</div></div>))}</div></div>)}{data.chunks[currentChunk].metaphor && (<motion.div initial={{ opacity: 0, scale: 0.9, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} className="bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent border-2 border-amber-500/30 p-10 rounded-[3rem] space-y-4 relative overflow-hidden group shadow-[0_20px_50px_rgba(245,158,11,0.2)]"><div className="absolute -right-6 -bottom-6 text-amber-500/10 group-hover:text-amber-500/30 transition-all duration-700">{currentChunk % 3 === 0 ? <Rocket size={180} /> : currentChunk % 3 === 1 ? <Trophy size={180} /> : <Star size={180} />}</div><div className="flex items-center gap-3"><div className="p-3 bg-amber-500 rounded-2xl shadow-lg animate-bounce"><Palette size={20} className="text-white" /></div><div className="text-amber-500 font-black uppercase tracking-[0.2em] text-[12px]">Dassah's Visual Journey</div></div><p className="text-2xl md:text-3xl text-amber-100 font-black italic leading-tight drop-shadow-md">{isBionic ? <BionicText text={`"${data.chunks[currentChunk].metaphor}"`} /> : `"${data.chunks[currentChunk].metaphor}"`}</p><motion.div animate={{ x: [0, 50, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" /></motion.div>)}{data.chunks[currentChunk].dopamineHook && (<div className="flex items-center gap-4 p-4 text-emerald-400 font-bold tracking-tight bg-emerald-500/5 rounded-2xl border border-emerald-500/10"><Zap size={18} className="text-emerald-500 animate-bounce" /><span>{data.chunks[currentChunk].dopamineHook}</span></div>)}</div><div className="pt-12 flex gap-6"><button onClick={() => { playClick(); setCurrentChunk(c => c - 1); }} className={`flex-1 py-6 rounded-[2rem] font-black uppercase text-xs transition-all border border-[var(--color-border)] ${currentChunk === 0 ? 'opacity-10 pointer-events-none' : 'bg-[var(--color-glass)] hover:bg-white/10'}`}>Back</button><button onClick={handleNext} className="flex-[3] bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 py-8 md:py-10 rounded-[2rem] md:rounded-[3.5rem] font-black uppercase shadow-2xl active:scale-95 text-lg tracking-widest">{currentChunk < data.chunks.length - 1 ? 'Next' : 'DASTASTIC FINISH!'}</button></div></motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.csv,.pdf,.docx" />
      
      <AnimatePresence>{showHistory && (
        <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-0 bottom-0 w-full sm:w-80 bg-[var(--color-shadow)] backdrop-blur-3xl z-[120] p-6 md:p-8 border-r border-[var(--color-border)] shadow-2xl overflow-y-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-bold text-xl flex items-center gap-3 text-white"><Clock size={20} className="text-blue-400" /> Achieving Vault</h2>
            <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-[var(--color-glass)] rounded-full transition-colors"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            {history.map((item) => (
              <button key={item.id} onClick={() => { playClick(); setData(item.data); setCurrentChunk(-1); setShowHistory(false); }} className="w-full text-left p-5 rounded-[1.5rem] bg-[var(--color-glass)] hover:bg-white/10 border border-[var(--color-border)] hover:border-blue-500/30 transition-all group">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-black">{item.date}</p>
                <p className="text-sm font-bold text-slate-300 group-hover:text-blue-400 line-clamp-2 transition-colors">{item.title}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}</AnimatePresence>

      <AnimatePresence>{showPaywall && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[500] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="max-w-md w-full bg-slate-900 border-2 border-[var(--color-accent)] p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-center space-y-6 shadow-[0_0_100px_rgba(59,130,246,0.3)] max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="mx-auto w-20 h-20 bg-[var(--color-accent)]/10 rounded-full flex items-center justify-center text-[var(--color-accent)] animate-pulse">
              <Crown size={40} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter italic">Hadassah's Royal Rest</h2>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed font-medium">Your mind has crossed 10 Golden Filters today! To keep the Dassah-Magic flowing and unlock unlimited clarity, join DJ's Inner Circle.</p>
            <div className="space-y-4 pt-4">
              {!user ? (
                <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-lg shadow-2xl transition-all active:scale-95">Sign In with Google</button>
              ) : (
                <button onClick={() => alert("Connecting to DJ's Royal Treasury for checkout...")} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl text-lg hover:scale-105 transition-all active:scale-95">Join the Circle ($9/mo)</button>
              )}
              <button onClick={() => setShowPaywall(false)} className="w-full text-slate-600 font-bold uppercase text-[10px] tracking-[0.5em] py-4 hover:text-slate-400 transition-colors">Not Today</button>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      <AnimatePresence>
        {isZenLocked && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={handleToggleZenLock}
            className="fixed top-8 right-8 z-[500] bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-6 rounded-full border-2 border-red-600/50 backdrop-blur-3xl shadow-2xl transition-all group"
          >
            <X size={32} className="group-hover:rotate-90 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>{data && !isZenLocked && (<div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end gap-4">{chatOpen && (<motion.div initial={{ opacity: 0, y: 50, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.8 }} className="w-[350px] md:w-[450px] bg-[var(--color-shadow)] backdrop-blur-3xl border-2 border-blue-500/30 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden max-h-[500px]"><div className="bg-blue-600 p-6 flex justify-between items-center"><h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-3"><MessageCircle size={18}/> Ask DJ</h3><button onClick={() => setChatOpen(false)} className="text-white hover:bg-white/10 p-2 rounded-xl transition-all"><X size={20}/></button></div><div className="flex-grow overflow-y-auto p-6 space-y-4 text-sm font-medium h-[300px]">{chatHistory.length === 0 && <p className="text-slate-500 italic text-center py-10">"Ask me anything!"</p>}{chatHistory.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[var(--color-glass)] text-slate-300 border border-[var(--color-border)]'}`}>{msg.text}</div></div>))}{chatLoading && <div className="flex justify-start"><div className="bg-[var(--color-glass)] p-4 rounded-2xl animate-pulse text-slate-500">Thinking...</div></div>}</div><form onSubmit={handleChat} className="p-4 border-t border-[var(--color-border)] bg-[var(--color-glass)] flex gap-2"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a question..." className="flex-grow bg-[var(--color-shadow)] p-4 rounded-xl text-white focus:outline-none border border-[var(--color-border)]" /><button type="submit" className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-500 transition-all active:scale-95"><Send size={20}/></button></form></motion.div>)}<button onClick={() => { playClick(); setChatOpen(!chatOpen); }} className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-400 text-white rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all group relative border-4 border-[var(--color-border)]"><MessageCircle className="w-8 h-8 md:w-10 md:h-10 group-hover:rotate-12 transition-transform" />{chatHistory.length > 0 && <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full border-2 border-slate-900" />}</button></div>)}</AnimatePresence>
    </main></>);
}
