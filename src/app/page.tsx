'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Brain, Loader2, RefreshCcw, FileText, 
  CheckCircle2, Upload, BarChart3, Volume2, MessageCircle, 
  X, Send, Sparkles, BookOpen, Clock, Zap, Layers, ChevronRight,
  Headphones, MousePointer2, Type, Star, LogIn, LogOut, Crown,
  Ghost, Swords, Rocket, Music, Trophy, Sparkle
} from 'lucide-react';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie,
} from 'recharts';
import { supabase } from '@/lib/supabase';

// --- THEME & CONSTANTS ---
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface SimplifiedData {
  tldr: string[];
  whyCare: string;
  readingTime: string;
  chunks: { heading: string; content: string; keyTerms: string[] }[];
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
  // Core State
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SimplifiedData | null>(null);
  const [currentChunk, setCurrentChunk] = useState(-1);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Auth & Monetization State
  const [user, setUser] = useState<any>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  // ADHD Focus Features State
  const [isBionic, setIsBionic] = useState(true);
  const [audioMode, setAudioMode] = useState<'none' | 'brown' | 'suspense' | 'action'>('none');
  const [mouseFocus, setMouseFocus] = useState(false);
  const [mousePos, setMousePos] = useState({ y: 0 });
  const [rewardType, setRewardType] = useState<'none' | 'step' | 'final'>('none');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<any>(null);

  const catchphrases = ["DASTASTIC FOCUS!", "HADASSAH'S HERO!", "PURE DASSA-MAGIC!", "BRIDGE MASTER!", "CLARITY UNLOCKED!"];
  const currentCatchphrase = useMemo(() => catchphrases[Math.floor(Math.random() * catchphrases.length)], [rewardType]);

  // --- INITIALIZATION ---
  useEffect(() => {
    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadHistory(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadHistory(session.user.id);
      else setHistory([]);
    });

    // Local Usage
    setUsageCount(parseInt(localStorage.getItem('mindbridge_usage') || '0'));
    
    // Extension/Query Handling
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

  // --- DATABASE & AUTH ---
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

  // --- AUDIO ENGINE (THE DOPAMINE SOUNDS) ---
  const playRewardSound = (isFinal = false) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isFinal ? 523.25 : 880, ctx.currentTime); // C5 or A5
      osc.frequency.exponentialRampToValueAtTime(isFinal ? 1046.5 : 1760, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  const playClick = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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

  useEffect(() => {
    if (audioMode !== 'none') {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = 4096;
      let lastOut = 0.0;
      let phase = 0;

      const node = ctx.createScriptProcessor(bufferSize, 1, 1);
      node.onaudioprocess = (e: any) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (audioMode === 'brown') {
            out[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = out[i];
            out[i] *= 3.5;
          } else if (audioMode === 'suspense') {
            phase += 0.005;
            out[i] = white * 0.05 + Math.sin(phase) * 0.03; 
          } else if (audioMode === 'action') {
            phase += 0.15;
            out[i] = white * 0.1 * (Math.sin(phase) > 0.5 ? 1 : 0.2); 
          }
        }
      };
      node.connect(ctx.destination);
      audioCtxRef.current = ctx; noiseNodeRef.current = node;
    } else {
      if (noiseNodeRef.current) noiseNodeRef.current.disconnect();
      if (audioCtxRef.current) audioCtxRef.current.close();
    }
    return () => {
      if (noiseNodeRef.current) noiseNodeRef.current.disconnect();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [audioMode]);

  // --- CORE ACTIONS ---
  const handleSimplify = async (textToSimplify = input) => {
    playClick();
    if (!textToSimplify.trim()) return;
    if (usageCount >= (user ? 10 : 3)) { setShowPaywall(true); return; }
    
    setLoading(true);
    try {
      const res = await fetch('/api/simplify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: textToSimplify }) });
      const result = await res.json();
      setData(result);
      
      const title = result.tldr[0].slice(0, 30) + '...';
      if (user) { await supabase.from('history').insert({ user_id: user.id, title, data: result }); loadHistory(user.id); }
      
      const newC = usageCount + 1; 
      setUsageCount(newC); 
      localStorage.setItem('mindbridge_usage', newC.toString());
      setCurrentChunk(-1);
    } catch (err) { alert('The Bridge encountered a storm! Try again.'); } finally { setLoading(false); }
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      let text = event.target?.result as string;
      text = text.replace(/[^\x20-\x7E\n\t]/g, ''); // Clean jargon
      setInput(text.slice(0, 10000));
    };
    reader.readAsText(file);
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
      setTimeout(() => { setRewardType('none'); setData(null); setInput(''); setCurrentChunk(-1); }, 5000);
    }
  };

  return (
    <main onMouseMove={(e) => mouseFocus && setMousePos({ y: e.clientY })} className="min-h-screen bg-[#050810] text-slate-200 font-sans flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-blue-500/40">
      
      {/* --- DOPAMINE REWARDS --- */}
      <AnimatePresence>
        {rewardType !== 'none' && (
          <>
            <StarParticles count={rewardType === 'final' ? 100 : 30} isFinal={rewardType === 'final'} />
            <motion.div initial={{ opacity: 0, scale: 0.5, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.5 }} className="fixed inset-0 z-[400] flex items-center justify-center pointer-events-none p-4">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-amber-500 p-8 md:p-16 rounded-[3rem] md:rounded-[5rem] shadow-[0_0_150px_rgba(59,130,246,0.8)] border-4 border-white/30 backdrop-blur-3xl flex flex-col items-center gap-6 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Trophy size={rewardType === 'final' ? 80 : 48} className="text-white" /></motion.div>
                <h2 className="font-black italic text-4xl md:text-8xl text-white tracking-tighter drop-shadow-2xl">{rewardType === 'final' ? "HADASSAH TRIUMPH!" : currentCatchphrase}</h2>
                {rewardType === 'final' && <p className="text-white/80 font-bold uppercase tracking-widest md:text-xl">You conquered the noise!</p>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- TUNNEL VISION --- */}
      <AnimatePresence>
        {mouseFocus && (
          <div className="fixed inset-0 pointer-events-none z-[90] hidden md:block">
            <div className="absolute inset-0 bg-[#050810]/95 backdrop-blur-[8px]" style={{ maskImage: `radial-gradient(circle 150px at center ${mousePos.y}px, transparent 80%, black 100%)`, WebkitMaskImage: `radial-gradient(circle 150px at center ${mousePos.y}px, transparent 80%, black 100%)` }} />
          </div>
        )}
      </AnimatePresence>

      {/* --- SMART DYNAMIC TOOLBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-[110] p-4 flex justify-between items-center pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button onClick={() => setShowHistory(true)} className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-slate-400 hover:text-blue-400 shadow-xl transition-all active:scale-90"><Clock size={20}/></button>
          <div className="flex bg-white/5 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-xl">
            <button onClick={() => setIsBionic(!isBionic)} className={`p-3 rounded-xl transition-all ${isBionic ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Type size={20}/></button>
            <button onClick={() => setMouseFocus(!mouseFocus)} className={`hidden md:flex p-3 rounded-xl transition-all ${mouseFocus ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><MousePointer2 size={20}/></button>
            <div className="flex items-center gap-1 px-2 border-l border-white/10 ml-1">
              {[ {m:'none', i:<X size={12}/>}, {m:'brown', i:<Layers size={12}/>}, {m:'suspense', i:<Ghost size={12}/>}, {m:'action', i:<Swords size={12}/>} ].map((s) => (
                <button key={s.m} onClick={() => setAudioMode(s.m as any)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${audioMode === s.m ? 'bg-emerald-600 text-white shadow-md' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}>{s.i}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          {user ? (
            <button onClick={handleLogout} className="bg-white/5 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all">Log Out</button>
          ) : (
            <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-[0_10px_25px_rgba(59,130,246,0.4)] transition-all active:scale-95">Join Hadassah</button>
          )}
        </div>
      </nav>

      {/* --- MAIN UI --- */}
      {!data ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl w-full space-y-10 z-10 px-4 pt-20">
          <header className="text-center space-y-6">
            <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 8 }} className="mx-auto w-28 h-28 md:w-40 md:h-40 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-400 text-white rounded-[2.5rem] md:rounded-[4rem] flex items-center justify-center shadow-[0_25px_60px_rgba(59,130,246,0.4)] border border-white/20"><Brain size={64} md:size={80} /></motion.div>
            <h1 className="text-6xl md:text-9xl font-black text-white leading-none tracking-tighter">Mind<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 italic">Bridge</span></h1>
            <p className="text-xl md:text-3xl text-slate-400 font-medium tracking-tight">By <span className="text-white border-b-2 border-blue-500 pb-1">Hadassah</span></p>
          </header>

          <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] md:rounded-[5rem] border border-white/10 p-3 shadow-2xl">
            <textarea className="w-full h-72 md:h-96 p-10 md:p-16 text-xl md:text-2xl bg-transparent resize-none focus:outline-none placeholder:text-slate-800 text-slate-200 leading-relaxed font-medium" placeholder="Paste the noise here..." value={input} onChange={(e) => setInput(e.target.value)} />
            <div className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4.5rem] flex flex-col sm:flex-row justify-between items-center gap-8 border border-white/5">
              <button onClick={() => fileInputRef.current?.click()} className="text-xs text-slate-500 font-black uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-4"><Upload size={24} className="text-blue-500" /> Clean Document</button>
              <button onClick={() => handleSimplify()} disabled={loading || !input.trim()} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-400 text-white px-16 md:px-24 py-6 md:py-8 rounded-[2rem] md:rounded-[3rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:shadow-blue-500/50 transition-all active:scale-95 text-xl">
                {loading ? <Loader2 className="animate-spin" /> : 'Bridge It'}
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-3xl w-full pt-32 pb-20 z-10 px-4">
          <AnimatePresence mode="wait">
            {currentChunk === -1 ? (
              <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="bg-slate-900/60 backdrop-blur-3xl p-10 md:p-20 rounded-[3.5rem] md:rounded-[5rem] border border-white/10 space-y-12 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="bg-blue-500/10 text-blue-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-3"><Rocket size={18}/> Saved {data.readingTime}</div>
                  <button onClick={handleReset} className="p-5 bg-white/5 rounded-3xl text-slate-500 hover:text-red-400 transition-all"><X size={24}/></button>
                </div>
                <div className="space-y-8"><h2 className="text-[10px] uppercase tracking-[0.5em] text-blue-400 font-black italic">The Vision</h2><p className="text-4xl md:text-5xl font-black leading-[1.1] text-white tracking-tight">{isBionic ? <BionicText text={data.whyCare} /> : data.whyCare}</p></div>
                <div className="space-y-12">{data.tldr.map((point, i) => (<motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} key={i} className="flex items-start group"><span className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 text-blue-400 flex items-center justify-center font-black mr-8 border border-white/5 group-hover:border-blue-500/50 transition-all text-xl">{i + 1}</span><p className="text-2xl md:text-3xl font-bold text-slate-300 leading-snug">{isBionic ? <BionicText text={point} /> : point}</p></motion.div>))}</div>
                <button onClick={() => { setCurrentChunk(0); playClick(); }} className="w-full bg-blue-600 py-8 md:py-10 rounded-[2.5rem] md:rounded-[4rem] font-black uppercase tracking-[0.3em] text-2xl shadow-[0_20px_50px_rgba(59,130,246,0.4)] hover:bg-blue-500 transition-all active:scale-95">Open the Bridge <ArrowRight className="inline ml-4"/></button>
              </motion.div>
            ) : (
              <motion.div key={currentChunk} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0, x: -100 }} className="bg-slate-900/60 backdrop-blur-3xl p-10 md:p-20 rounded-[3.5rem] md:rounded-[5rem] border border-white/10 min-h-[600px] flex flex-col shadow-2xl relative">
                <div className="absolute top-10 left-10 text-[10px] font-black text-blue-500/40 uppercase tracking-[0.5em]">Module {currentChunk + 1} / {data.chunks.length}</div>
                <h2 className="text-5xl md:text-8xl font-black mb-12 text-white tracking-tighter leading-none pt-10">{isBionic ? <BionicText text={data.chunks[currentChunk].heading} /> : data.chunks[currentChunk].heading}</h2>
                <div className="bg-blue-500/5 p-10 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-blue-500/10 flex-grow text-3xl md:text-4xl leading-relaxed font-black text-slate-200 italic shadow-inner">{isBionic ? <BionicText text={data.chunks[currentChunk].content} /> : data.chunks[currentChunk].content}</div>
                <div className="pt-16 flex gap-6">
                  <button onClick={() => { playClick(); setCurrentChunk(c => c - 1); }} className={`flex-1 py-8 md:py-10 rounded-[2rem] md:rounded-[3rem] font-black uppercase text-xs transition-all border border-white/5 ${currentChunk === 0 ? 'opacity-10 pointer-events-none' : 'bg-white/5 hover:bg-white/10'}`}>Back</button>
                  <button onClick={handleNext} className="flex-[3] bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 py-8 md:py-10 rounded-[2rem] md:rounded-[3.5rem] font-black uppercase shadow-2xl active:scale-95 text-lg md:text-2xl tracking-widest">{currentChunk < data.chunks.length - 1 ? 'Next' : 'DASTASTIC FINISH!'}</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* --- HIDDEN ELEMENTS --- */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.csv" />
      <AnimatePresence>
        {showPaywall && (
          <div className="fixed inset-0 bg-[#050810]/98 backdrop-blur-3xl z-[500] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg w-full bg-slate-900 border-2 border-blue-500/40 p-12 md:p-20 rounded-[4rem] text-center space-y-10 shadow-[0_0_100px_rgba(59,130,246,0.3)]">
              <div className="mx-auto w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 animate-pulse"><Crown size={64} /></div>
              <h2 className="text-5xl font-black text-white tracking-tighter italic">Bridge Overload!</h2>
              <p className="text-slate-400 text-xl leading-relaxed font-medium">{!user ? "You've crossed your 3 free guest bridges! Join Hadassah to cross 10 for free every day." : "You've used your 10 free daily bridges! Go Pro for unlimited clarity."}</p>
              <div className="space-y-6">
                {!user ? <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 py-8 rounded-[2.5rem] font-black uppercase tracking-widest text-xl shadow-2xl transition-all">Sign In with Google</button> : <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 py-8 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl text-xl hover:scale-105 transition-all">Go Pro ($9/mo)</button>}
                <button onClick={() => setShowPaywall(false)} className="w-full text-slate-600 font-bold uppercase text-xs tracking-[0.5em] py-4 hover:text-slate-400">Not Today</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
