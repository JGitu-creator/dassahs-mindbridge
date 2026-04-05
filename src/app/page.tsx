'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Brain, Loader2, RefreshCcw, FileText, 
  CheckCircle2, Upload, BarChart3, Volume2, MessageCircle, 
  X, Send, Sparkles, BookOpen, Clock, Zap, Layers, ChevronRight,
  Headphones, MousePointer2, Type, Star, LogIn, LogOut, Crown,
  Ghost, Swords, Rocket
} from 'lucide-react';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie,
} from 'recharts';
import { supabase } from '@/lib/supabase';

// Theme Colors
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface SimplifiedData {
  tldr: string[];
  whyCare: string;
  readingTime: string;
  chunks: { heading: string; content: string; keyTerms: string[] }[];
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

const StarParticles = ({ count = 15, isFinal = false }: { count?: number, isFinal?: boolean }) => (
  <div className="fixed inset-0 pointer-events-none z-[300]">
    {[...Array(count)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 1, scale: 0, x: '50vw', y: '50vh' }}
        animate={{ 
          opacity: 0, scale: Math.random() * 1.5 + 0.5,
          x: `${Math.random() * 100}vw`, y: `${Math.random() * 100}vh`,
          rotate: Math.random() * 360
        }}
        transition={{ duration: isFinal ? 3 : 1.5, ease: "easeOut" }}
        className="absolute text-amber-400"
      ><Star fill="currentColor" size={isFinal ? 24 : 12} /></motion.div>
    ))}
  </div>
);

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SimplifiedData | null>(null);
  const [currentChunk, setCurrentChunk] = useState(-1);
  const [showChat, setShowChat] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ type: 'user' | 'bot'; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isBionic, setIsBionic] = useState(true);
  const [audioMode, setAudioMode] = useState<'none' | 'brown' | 'white' | 'suspense' | 'action'>('none');
  const [mouseFocus, setMouseFocus] = useState(false);
  const [mousePos, setMousePos] = useState({ y: 0 });
  const [rewardType, setRewardType] = useState<'none' | 'step' | 'final'>('none');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<any>(null);

  const catchphrases = ["Dastastic Focus!", "Hadassah's Hero!", "Mind-Blowing Bridge!", "Pure Dassa-magic!", "Hadassah High-Five!", "Bridge Boss!"];
  const currentCatchphrase = useMemo(() => catchphrases[Math.floor(Math.random() * catchphrases.length)], [rewardType]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadHistory(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadHistory(session.user.id);
      else setHistory([]);
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
    playClick();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleLogout = async () => {
    playClick();
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
  };

  const stopAudio = () => {
    if (noiseNodeRef.current) { noiseNodeRef.current.disconnect(); noiseNodeRef.current = null; }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') { audioCtxRef.current.close(); audioCtxRef.current = null; }
  };

  const playClick = () => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(audioMode === 'action' ? 880 : 440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
      setTimeout(() => { if(ctx.state !== 'closed') ctx.close(); }, 200);
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
            out[i] = white * 0.05 + Math.sin(phase) * 0.02; 
          } else if (audioMode === 'action') {
            phase += 0.1;
            out[i] = white * 0.1 * (Math.sin(phase) > 0 ? 1 : 0.5);
          } else {
            out[i] = white * 0.15;
          }
        }
      };
      node.connect(ctx.destination);
      audioCtxRef.current = ctx; noiseNodeRef.current = node;
    } else stopAudio();
    return () => stopAudio();
  }, [audioMode]);

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
      else { setHistory(prev => [{ id: Math.random().toString(36).substr(2, 9), title, data: result }, ...prev].slice(0, 10)); }
      const newC = usageCount + 1; setUsageCount(newC); localStorage.setItem('mindbridge_usage', newC.toString());
      setCurrentChunk(-1);
    } catch (err) { alert('Hadassah had a small glitch!'); } finally { setLoading(false); }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      let text = event.target?.result as string;
      text = text.replace(/[^\x20-\x7E\n\t]/g, ''); 
      setInput(text.slice(0, 10000));
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleReset = () => { playClick(); setData(null); setInput(''); setCurrentChunk(-1); };

  const handleNext = () => {
    playClick();
    if (data && currentChunk < data.chunks.length - 1) {
      setCurrentChunk(c => c + 1);
      setRewardType('step');
      setTimeout(() => setRewardType('none'), 2000);
    } else if (data && currentChunk === data.chunks.length - 1) {
      setRewardType('final');
      setTimeout(() => { setRewardType('none'); handleReset(); }, 4000);
    }
  };

  return (
    <main onMouseMove={(e) => mouseFocus && setMousePos({ y: e.clientY })} className="min-h-screen bg-[#070b14] text-slate-200 font-sans p-2 md:p-8 flex flex-col items-center justify-center relative overflow-x-hidden">
      <AnimatePresence>
        {rewardType !== 'none' && (
          <>
            <StarParticles count={rewardType === 'final' ? 60 : 20} isFinal={rewardType === 'final'} />
            <motion.div initial={{ opacity: 0, scale: 0.5, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none w-full px-4">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_120px_rgba(59,130,246,0.6)] flex flex-col items-center gap-4 border border-white/20 backdrop-blur-2xl">
                <div className="flex gap-3"><Star size={48} className="text-white animate-bounce" fill="currentColor" />{rewardType === 'final' && <Sparkles size={48} className="text-white animate-pulse" />}</div>
                <span className="font-black uppercase tracking-tighter text-white text-3xl md:text-6xl text-center italic drop-shadow-2xl">{rewardType === 'final' ? "HADASSAH'S TRIUMPH!" : currentCatchphrase}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {mouseFocus && (
        <div className="fixed inset-0 pointer-events-none z-[90] hidden md:block">
          <div className="absolute inset-0 bg-[#070b14]/90 backdrop-blur-[6px]" style={{ maskImage: `radial-gradient(circle 120px at center ${mousePos.y}px, transparent 80%, black 100%)`, WebkitMaskImage: `radial-gradient(circle 120px at center ${mousePos.y}px, transparent 80%, black 100%)` }} />
        </div>
      )}

      <div className="fixed top-2 md:top-8 left-2 md:left-8 right-2 md:right-8 flex justify-between items-center z-[110] bg-slate-900/40 backdrop-blur-lg p-2 rounded-2xl border border-white/5 md:bg-transparent md:border-none">
        <div className="flex gap-1.5 md:gap-3">
          <button onClick={() => setShowHistory(true)} className="p-2.5 md:p-4 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-blue-400"><Clock size={18} /></button>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={() => setIsBionic(!isBionic)} className={`p-2 md:p-3 rounded-lg ${isBionic ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}><Type size={18} /></button>
            <button onClick={() => setMouseFocus(!mouseFocus)} className={`hidden md:flex p-3 rounded-lg ${mouseFocus ? 'bg-purple-600 text-white' : 'text-slate-400'}`}><MousePointer2 size={18} /></button>
            <div className="flex items-center gap-1 px-1.5 border-l border-white/10 ml-1">
              {[ {m:'none', i:<X size={12}/>}, {m:'brown', i:<Layers size={12}/>}, {m:'suspense', i:<Ghost size={12}/>}, {m:'action', i:<Swords size={12}/>} ].map((s) => (
                <button key={s.m} onClick={() => setAudioMode(s.m as any)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${audioMode === s.m ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'}`}>{s.i}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user ? <button onClick={handleLogout} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-red-400"><LogOut size={14}/></button> : <button onClick={handleLogin} className="p-2.5 md:px-5 bg-blue-600 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20">Sign In</button>}
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900/80 backdrop-blur-xl z-[120] p-8 border-r border-white/10 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-10"><h2 className="font-bold text-xl flex items-center gap-3 text-white"><Clock size={20} className="text-blue-400" /> History</h2><button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20} /></button></div>
            <div className="space-y-4">{history.map((item) => (
              <button key={item.id} onClick={() => { setData(item.data); setCurrentChunk(-1); setShowHistory(false); }} className="w-full text-left p-5 rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all group"><p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-black">{item.date}</p><p className="text-sm font-bold text-slate-300 group-hover:text-blue-400 line-clamp-2 transition-colors">{item.title}</p></button>
            ))}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {!data ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full space-y-6 z-10 px-2">
          <div className="text-center space-y-4 md:space-y-6 mb-8 mt-12 md:mt-0">
            <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 6 }} className="mx-auto w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-[2rem] md:rounded-[3rem] flex items-center justify-center shadow-2xl border border-white/20"><Brain size={48} /></motion.div>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter">Mind<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 italic">Bridge</span></h1>
            <p className="text-lg md:text-2xl text-slate-400 max-w-lg mx-auto leading-relaxed font-medium">By <span className="text-white font-bold tracking-widest uppercase text-sm">Hadassah</span></p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] border border-white/10 p-2 shadow-2xl">
            <textarea className="w-full h-64 md:h-80 p-8 md:p-12 text-xl bg-transparent resize-none focus:outline-none placeholder:text-slate-700 text-slate-200" placeholder="Paste the overwhelming noise here..." value={input} onChange={(e) => setInput(e.target.value)} />
            <div className="bg-white/5 p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] flex flex-col sm:flex-row justify-between items-center gap-6 border border-white/5">
              <button onClick={() => fileInputRef.current?.click()} className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-3"><Upload size={20} className="text-blue-500" /> Clean Document Upload</button>
              <button onClick={() => handleSimplify()} disabled={loading || !input.trim()} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-12 md:px-20 py-5 md:py-7 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.1em] shadow-xl hover:shadow-blue-500/40 transition-all active:scale-95 text-lg">
                {loading ? <Loader2 className="animate-spin" /> : 'Cross the Bridge'}
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-2xl w-full pt-20 md:pt-10 z-10 px-2 space-y-6">
          {currentChunk === -1 ? (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/60 backdrop-blur-3xl p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-white/10 space-y-10 md:space-y-14 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="bg-blue-500/10 text-blue-400 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-2"><Rocket size={14}/> Save {data.readingTime}</div>
                <button onClick={handleReset} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-red-500/20 text-slate-400 transition-all"><X size={20} /></button>
              </div>
              <div className="space-y-6"><h2 className="text-[10px] uppercase tracking-[0.4em] text-blue-400 font-black italic">The Big Why</h2><p className="text-3xl md:text-4xl font-bold leading-tight">{isBionic ? <BionicText text={data.whyCare} /> : data.whyCare}</p></div>
              <div className="space-y-10">{data.tldr.map((point, i) => (<motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} key={i} className="flex items-start group"><span className="flex-shrink-0 w-12 h-12 rounded-[1.25rem] bg-white/5 text-blue-400 flex items-center justify-center font-black mr-6 border border-white/5 group-hover:border-blue-500/50 transition-all shadow-inner text-lg">{i + 1}</span><p className="text-xl md:text-2xl mt-2 font-medium text-slate-300 leading-relaxed">{isBionic ? <BionicText text={point} /> : point}</p></motion.div>))}</div>
              <button onClick={() => { setCurrentChunk(0); playClick(); }} className="w-full bg-blue-600 py-7 md:py-9 rounded-[2rem] md:rounded-[3rem] font-black uppercase tracking-[0.2em] text-xl shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95 flex justify-center items-center gap-4">Start Focused Deep Dive <ArrowRight/></button>
            </motion.div>
          ) : (
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-slate-900/60 backdrop-blur-3xl p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-white/10 min-h-[500px] md:min-h-[650px] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-10 md:mb-16"><span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">BRIDGE MODULE {currentChunk + 1}</span><button onClick={handleReset} className="p-3 bg-white/5 rounded-xl text-slate-500"><X size={16}/></button></div>
              <h2 className="text-4xl md:text-6xl font-black mb-8 md:mb-12 text-white tracking-tighter leading-none">{isBionic ? <BionicText text={data.chunks[currentChunk].heading} /> : data.chunks[currentChunk].heading}</h2>
              <div className="bg-blue-500/5 p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-blue-500/10 flex-grow text-2xl md:text-3xl leading-relaxed font-medium text-slate-200 shadow-inner italic">
                {isBionic ? <BionicText text={data.chunks[currentChunk].content} /> : data.chunks[currentChunk].content}
              </div>
              <div className="pt-10 md:pt-16 flex justify-between gap-4 md:gap-8">
                <button onClick={() => { playClick(); setCurrentChunk(c => c - 1); }} className={`flex-1 py-6 md:py-8 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase text-xs transition-all border border-white/5 ${currentChunk === 0 ? 'opacity-20 pointer-events-none' : 'bg-white/5 hover:bg-white/10'}`}>Back</button>
                <button onClick={handleNext} className="flex-[3] bg-gradient-to-r from-blue-600 to-purple-600 py-6 md:py-8 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase shadow-2xl active:scale-95 text-sm md:text-lg">{currentChunk < data.chunks.length - 1 ? 'Next Module' : 'CLAIM TRIUMPH!'}</button>
              </div>
            </motion.div>
          )}
        </div>
      )}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.csv" />
      <AnimatePresence>
        {showPaywall && (
          <div className="fixed inset-0 bg-[#070b14]/98 backdrop-blur-2xl z-[500] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-slate-900 border border-blue-500/30 p-10 rounded-[3rem] text-center space-y-8 shadow-2xl">
              <div className="mx-auto w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 animate-pulse"><Crown size={48} /></div>
              <h2 className="text-4xl font-black text-white">Bridge Full!</h2>
              <p className="text-slate-400 text-xl leading-relaxed">{!user ? "You've crossed 3 bridges today! Sign in to cross 10 for free." : "You've crossed 10 free bridges! Upgrade to Pro for unlimited focus."}</p>
              <div className="space-y-4">
                {!user ? <button onClick={handleLogin} className="w-full bg-blue-600 py-6 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-xl">Join Hadassah</button> : <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl text-lg hover:scale-105 transition-all">Unlock Pro ($9/mo)</button>}
                <button onClick={() => setShowPaywall(false)} className="w-full text-slate-600 font-bold uppercase text-xs py-4">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
