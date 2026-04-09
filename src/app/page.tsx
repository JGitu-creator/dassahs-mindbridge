'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Brain, Loader2, RefreshCcw, FileText, 
  CheckCircle2, Upload, BarChart3, Volume2, MessageCircle, 
  X, Send, Sparkles, BookOpen, Clock, Zap, Layers, ChevronRight,
  Headphones, MousePointer2, Type, Star, LogIn, LogOut, Crown,
  Ghost, Swords, Rocket, Music, Trophy, Sparkle, Palette, Fish
} from 'lucide-react';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie,
} from 'recharts';
import { supabase } from '@/lib/supabase';

// --- THEME & CONSTANTS ---
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

type Theme = 'midnight' | 'forest' | 'cyberpunk';

const THEMES = {
  midnight: { bg: '#050810', accent: '#3b82f6', text: '#f8fafc' },
  forest: { bg: '#061a12', accent: '#10b981', text: '#ecfdf5' },
  cyberpunk: { bg: '#1a0b2e', accent: '#d946ef', text: '#fdf4ff' }
};

interface SimplifiedData {
  tldr: string[];
  whyCare: string;
  readingTime: string;
  chunks: { heading: string; content: string; keyTerms: string[]; metaphor?: string; dopamineHook?: string; }[];
  chartData: { type: 'bar' | 'line' | 'pie'; data: { name: string; value: number }[]; } | null;
  actions: { task: string; priority: 'high' | 'medium' | 'low' }[];
}

// --- NEURO-DOPAMINE COMPONENTS ---

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
      <motion.div
        key={i}
        initial={{ opacity: 1, scale: 0, x: '50vw', y: '50vh' }}
        animate={{ 
          opacity: 0, scale: Math.random() * 2 + 0.5,
          x: `${Math.random() * 100}vw`, y: `${Math.random() * 100}vh`,
          rotate: Math.random() * 720
        }}
        transition={{ duration: isFinal ? 4 : 2, ease: "easeOut" }}
        className="absolute text-amber-400"
      >
        {i % 2 === 0 ? <Star fill="currentColor" size={isFinal ? 32 : 16} /> : <Sparkle fill="currentColor" size={isFinal ? 24 : 12} />}
      </motion.div>
    ))}
  </div>
);

// --- MAIN APPLICATION ---

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
  
  const catchphrases = ["DASTASTIC FOCUS!", "HADASSAH'S HERO!", "PURE DASSA-MAGIC!", "BRIDGE MASTER!", "CLARITY UNLOCKED!"];
  const currentCatchphrase = useMemo(() => catchphrases[Math.floor(Math.random() * catchphrases.length)], [rewardType]);

  const fileInputRef = useRef<HTMLInputElement>(null);
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
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'chat', question: userMsg, context: data })
      });
      const result = await res.json();
      setChatHistory(prev => [...prev, { role: 'ai', text: result.answer }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "The Bridge is a bit shaky, try again!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleReadAloud = (text: string) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlaying(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log("User found on initial session, loading history for:", session.user.id);
        loadHistory(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed. Event:", _event, "Session:", session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log("User session active, loading history for:", session.user.id);
        loadHistory(session.user.id);
      }
      else { 
        console.log("No user session, clearing history.");
        setHistory([]);
      }
    });
    setUsageCount(parseInt(localStorage.getItem('mindbridge_usage') || '0'));
    
    const urlParams = new URLSearchParams(window.location.search);
    const textParam = urlParams.get('text');
    if (textParam) {
      const decodedText = decodeURIComponent(textParam);
      setInput(decodedText);
      handleSimplify(decodedText);
      window.history.replaceState({}, document.title, "/");
    }
    return () => subscription.unsubscribe();
  }, []);

  const loadHistory = async (userId: string) => {
    const { data: dbH } = await supabase.from('history').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (dbH) setHistory(dbH.map(h => ({ id: h.id, date: new Date(h.created_at).toLocaleString(), title: h.title, data: h.data })));
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
  };

  const handleReset = () => { playClick(); setData(null); setInput(''); setCurrentChunk(-1); };

  const playRewardSound = (isFinal = false) => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isFinal ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(isFinal ? 523.25 : 880, ctx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(isFinal ? 1046.5 : 1760, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  const playClick = () => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const playSuspenseSound = () => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 2);
      
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(2, ctx.currentTime);
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(10, ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 4);
      noiseNodeRef.current = osc; // a bit of a hack to have a reference to stop it
    } catch (e) {}
  };

  const playActionSound = () => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.5);
      
      const lfo = ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.setValueAtTime(8, ctx.currentTime);
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.5, ctx.currentTime);
      
      lfo.connect(gain.gain);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1);
      noiseNodeRef.current = osc; // a bit of a hack to have a reference to stop it
    } catch (e) {}
  };

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
    }
    if (noiseNodeRef.current) {
      noiseNodeRef.current.disconnect();
      noiseNodeRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    if (audioMode === 'suspense') {
      playSuspenseSound();
    } else if (audioMode === 'action') {
      playActionSound();
    } else if (audioMode === 'brown') {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
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
      audioCtxRef.current = ctx;
      noiseNodeRef.current = node;
    }

    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
      }
      if (noiseNodeRef.current) {
        noiseNodeRef.current.disconnect();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, [audioMode]);

  const handleSimplify = async (textToSimplify = input) => {
    playClick();
    if (!textToSimplify.trim()) return;
    if (usageCount >= (user ? 10 : 3)) { setShowPaywall(true); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/simplify', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ text: textToSimplify, isScenic }) 
      });
      const result = await res.json();
      setData(result);
      const title = result.tldr[0].slice(0, 30) + '...';
      if (user) { await supabase.from('history').insert({ user_id: user.id, title, data: result }); loadHistory(user.id); }
      setUsageCount(prev => {
        const next = prev + 1;
        localStorage.setItem('mindbridge_usage', next.toString());
        return next;
      });
      setCurrentChunk(-1);
    } catch (err) { alert('The Bridge encountered a storm! Try again.'); } finally { setLoading(false); }
  };
  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse', { method: 'POST', body: formData });
      
      if (!res.ok) {
        // Log the server's error response for debugging
        const errorBody = await res.text();
        console.error("File upload API responded with an error:", res.status, errorBody);
        throw new Error(`Server responded with status ${res.status}`);
      }

      const result = await res.json();
      if (result.text) {
        setInput(result.text);
      } else {
        throw new Error("API response did not contain extracted text.");
      }
    } catch (err: any) {
      console.error("An error occurred during file upload:", err);
      alert(`Failed to read this file. Error: ${err.message}. Please check the console for more details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (data && currentChunk < data.chunks.length - 1) {
      setCurrentChunk(c => c + 1);
      setRewardType('step');
      playRewardSound(false);
      setTimeout(() => setRewardType('none'), 2000);
    } else if (data && currentChunk === data.chunks.length - 1) {
      setRewardType('final');
      playRewardSound(true);
      setTimeout(() => { setRewardType('none'); handleReset(); }, 5000);
    }
  };

  const currentTheme = THEMES[theme];

  const themeStyles = `
    :root {
      --color-bg: ${currentTheme.bg};
      --color-text: ${currentTheme.text};
      --color-accent: ${currentTheme.accent};
    }
  `;

  return (
    <>
      <style>{themeStyles}</style>
      <main 
        onMouseMove={(e) => mouseFocus && setMousePos({ x: e.clientX, y: e.clientY })} 
        className="min-h-screen font-sans flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-blue-500/40 transition-colors duration-1000"
        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
      >
      
      {/* --- DOPAMINE REWARDS --- */}
      <AnimatePresence>
        {rewardType !== 'none' && (
          <>
            <StarParticles count={rewardType === 'final' ? 100 : 30} isFinal={rewardType === 'final'} />
            <motion.div initial={{ opacity: 0, scale: 0.5, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.5 }} className="fixed inset-0 z-[400] flex items-center justify-center pointer-events-none p-4 text-center">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-amber-500 p-8 md:p-16 rounded-[3rem] md:rounded-[5rem] shadow-[0_0_150px_rgba(59,130,246,0.8)] border-4 border-white/30 backdrop-blur-3xl flex flex-col items-center gap-6">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Trophy size={rewardType === 'final' ? 80 : 48} className="text-white" /></motion.div>
                <h2 className="font-black italic text-4xl md:text-8xl text-white tracking-tighter drop-shadow-2xl">{rewardType === 'final' ? "HADASSAH TRIUMPH!" : currentCatchphrase}</h2>
                {rewardType === 'final' && <p className="text-white/80 font-bold uppercase tracking-widest md:text-xl">You conquered the noise!</p>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- FOLLOW-ME ARROW (READING GUIDE) --- */}
      <AnimatePresence>
        {mouseFocus && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: mousePos.x + 20, 
              y: mousePos.y - 20 
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300, mass: 0.5 }}
            className="fixed pointer-events-none z-[100] text-blue-500 filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            style={{ color: currentTheme.accent }}
          >
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            >
              <ArrowRight size={48} strokeWidth={3} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TUNNEL VISION --- */}      <AnimatePresence>
        {mouseFocus && (
          <div className="fixed inset-0 pointer-events-none z-[90] hidden md:block">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-[10px]" style={{ maskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, transparent 80%, black 100%)`, WebkitMaskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, transparent 80%, black 100%)` }} />
          </div>
        )}
      </AnimatePresence>

      {/* --- SMART DYNAMIC TOOLBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-[110] p-4 flex justify-between items-center bg-slate-900/20 backdrop-blur-md border-b border-white/5">
        <div className="flex gap-2">
          <button onClick={() => { playClick(); setShowHistory(true); }} className="p-3 md:p-4 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-blue-400 shadow-xl transition-all active:scale-90"><Clock size={20}/></button>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-xl">
            <button onClick={() => { playClick(); setIsBionic(!isBionic); }} className={`p-2 md:p-3 rounded-xl transition-all ${isBionic ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Type size={20}/></button>
            <button onClick={() => { playClick(); setMouseFocus(!mouseFocus); }} className={`hidden md:flex p-3 rounded-xl transition-all ${mouseFocus ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><MousePointer2 size={20}/></button>
            <div className="flex items-center gap-1 px-2 border-l border-white/10 ml-1">
              {[ {m:'none', i:<X size={12}/>}, {m:'brown', i:<Layers size={12}/>}, {m:'suspense', i:<Ghost size={12}/>}, {m:'action', i:<Swords size={12}/>} ].map((s) => (
                <button key={s.m} onClick={() => { playClick(); setAudioMode(s.m as any); }} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${audioMode === s.m ? 'bg-emerald-600 text-white shadow-md' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}>{s.i}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 px-2 border-l border-white/10 ml-1">
              {(['midnight', 'forest', 'cyberpunk'] as Theme[]).map((t) => (
                <button key={t} onClick={() => setTheme(t)} className={`w-6 h-6 rounded-full border-2 transition-all ${theme === t ? 'border-white scale-110' : 'border-transparent opacity-50'}`} style={{ backgroundColor: THEMES[t].accent }} />
              ))}
              <Palette size={14} className="ml-1 text-slate-500" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={handleLogout} className="bg-white/5 px-4 py-3 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all">Log Out</button>
          ) : (
            <button onClick={handleLogin} className="bg-[var(--color-accent)] hover:opacity-80 px-6 py-3 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-[0_10px_25px_rgba(59,130,246,0.4)] transition-all active:scale-95">Join Hadassah</button>
          )}
        </div>
      </nav>

      {/* --- MAIN UI (MAX WIDTH FIXED) --- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl lg:max-w-4xl w-full space-y-10 z-10 px-4 pt-24">
        <header className="text-center space-y-6">
          <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 8 }} className="mx-auto w-28 h-28 md:w-40 md:h-40 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-400 text-white rounded-[2.5rem] md:rounded-[4rem] flex items-center justify-center shadow-[0_25px_60px_rgba(59,130,246,0.4)] border-2 border-white/20 relative">
            <Brain className="w-16 h-16 md:w-20 md:h-20" />
          </motion.div>
          <h1 className="text-6xl md:text-9xl font-black text-white leading-none tracking-tighter">Dassah's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 italic">MindBridge</span></h1>
          <p className="text-xl md:text-3xl text-slate-400 font-medium tracking-tight flex items-center gap-2">By <span className="text-white border-b-2 border-blue-500 pb-1">DJ</span> <Fish size={24} className="text-blue-500" /></p>
        </header>

        <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-3 shadow-2xl overflow-hidden">
          <textarea className="w-full h-64 md:h-80 p-8 md:p-12 text-lg md:text-xl bg-transparent resize-none focus:outline-none placeholder:text-slate-800 text-slate-200 leading-relaxed font-medium" placeholder="Paste the noise here..." value={input} onChange={(e) => setInput(e.target.value)} />
          <div className="bg-white/5 p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] flex flex-col sm:flex-row justify-between items-center gap-6 border border-white/5">
            <button onClick={() => { playClick(); fileInputRef.current?.click(); }} className="text-xs text-slate-500 font-black uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-4">
              <Upload size={24} className="text-blue-500" /> Clean Document
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button onClick={() => setIsScenic(!isScenic)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all ${isScenic ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                {isScenic ? <Sparkles size={18}/> : <Zap size={18}/>}
                <span className="text-[10px] font-black uppercase tracking-widest">{isScenic ? 'Scenic Route' : 'Quick Bridge'}</span>
              </button>
              <button onClick={() => handleSimplify()} disabled={loading || !input.trim()} className="w-full sm:w-auto bg-gradient-to-r from-[var(--color-accent)] to-blue-400 text-white px-12 md:px-20 py-5 md:py-7 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:shadow-blue-500/50 transition-all active:scale-95 text-lg">
                {loading ? <Loader2 className="animate-spin" /> : 'Bridge It'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- HIDDEN ELEMENTS --- */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.csv,.pdf,.docx" />
      
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900/90 backdrop-blur-3xl z-[120] p-8 border-r border-white/10 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-10"><h2 className="font-bold text-xl flex items-center gap-3 text-white"><Clock size={20} className="text-blue-400" /> Achieving Vault</h2><button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20} /></button></div>
            <div className="space-y-4">{history.map((item) => (
              <button key={item.id} onClick={() => { playClick(); setData(item.data); setCurrentChunk(-1); setShowHistory(false); }} className="w-full text-left p-5 rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all group"><p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-black">{item.date}</p><p className="text-sm font-bold text-slate-300 group-hover:text-blue-400 line-clamp-2 transition-colors">{item.title}</p></button>
            ))}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaywall && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[500] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg w-full bg-slate-900 border-2 border-blue-500/40 p-12 md:p-20 rounded-[4rem] text-center space-y-10 shadow-[0_0_100px_rgba(59,130,246,0.3)]">
              <div className="mx-auto w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 animate-pulse"><Crown size={64} /></div>
              <h2 className="text-5xl font-black text-white tracking-tighter italic">Bridge Overload!</h2>
              <p className="text-slate-400 text-xl leading-relaxed font-medium">{!user ? "You've crossed your 3 free guest bridges! Join DJ's Bridge to cross 10 for free every day." : "You've used your 10 free daily bridges! Go Pro for unlimited clarity."}</p>
              <div className="space-y-6">
                {!user ? <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 py-8 rounded-[2.5rem] font-black uppercase tracking-widest text-xl shadow-2xl transition-all">Sign In with Google</button> : <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 py-8 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl text-xl hover:scale-105 transition-all">Go Pro ($9/mo)</button>}
                <button onClick={() => setShowPaywall(false)} className="w-full text-slate-600 font-bold uppercase text-xs tracking-[0.5em] py-4 hover:text-slate-400">Not Today</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FLOATING CHAT WIDGET --- */}
      <AnimatePresence>
        {data && (
          <div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end gap-4">
            {chatOpen && (
              <motion.div initial={{ opacity: 0, y: 50, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.8 }} className="w-[350px] md:w-[450px] bg-slate-900/95 backdrop-blur-3xl border-2 border-blue-500/30 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden max-h-[500px]">
                <div className="bg-blue-600 p-6 flex justify-between items-center"><h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-3"><MessageCircle size={18}/> Ask DJ</h3><button onClick={() => setChatOpen(false)} className="text-white hover:bg-white/10 p-2 rounded-xl transition-all"><X size={20}/></button></div>
                <div className="flex-grow overflow-y-auto p-6 space-y-4 text-sm font-medium h-[300px]">
                  {chatHistory.length === 0 && <p className="text-slate-500 italic text-center py-10">"Ask me anything about your data!"</p>}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-300 border border-white/5'}`}>{msg.text}</div>
                    </div>
                  ))}
                  {chatLoading && <div className="flex justify-start"><div className="bg-white/5 p-4 rounded-2xl animate-pulse text-slate-500">Thinking...</div></div>}
                </div>
                <form onSubmit={handleChat} className="p-4 border-t border-white/5 bg-white/5 flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target..value)} placeholder="Type a question..." className="flex-grow bg-slate-900/50 p-4 rounded-xl text-white focus:outline-none border border-white/10" />
                  <button type="submit" className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-500 transition-all active:scale-95"><Send size={20}/></button>
                </form>
              </motion.div>
            )}
            <button onClick={() => { playClick(); setChatOpen(!chatOpen); }} className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-400 text-white rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all group relative border-4 border-white/10">
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10 group-hover:rotate-12 transition-transform" />
              {chatHistory.length > 0 && <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full border-2 border-slate-900" />}
            </button>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
