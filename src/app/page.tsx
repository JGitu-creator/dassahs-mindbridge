'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Brain, Loader2, RefreshCcw, FileText, 
  CheckCircle2, Upload, BarChart3, Volume2, MessageCircle, 
  X, Send, Sparkles, BookOpen, Clock, Zap, Layers, ChevronRight,
  Headphones, MousePointer2, Type, Star, LogIn, LogOut, User, Crown
} from 'lucide-react';
import Papa from 'papaparse';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
} from 'recharts';
import { supabase } from '@/lib/supabase';

interface SimplifiedData {
  tldr: string[];
  whyCare: string;
  readingTime: string;
  chunks: { heading: string; content: string; keyTerms: string[] }[];
  chartData: {
    type: 'bar' | 'line' | 'pie';
    data: { name: string; value: number }[];
  } | null;
  actions: { task: string; priority: 'high' | 'medium' | 'low' }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const BionicText = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <>
      {text.split(' ').map((word, i) => {
        if (word.length <= 1) return <span key={i} className="mr-1">{word}</span>;
        const half = Math.ceil(word.length / 2);
        const bold = word.slice(0, half);
        const rest = word.slice(half);
        return (
          <span key={i} className="inline-block mr-1">
            <span className="font-black text-white">{bold}</span>
            <span className="opacity-70">{rest}</span>
          </span>
        );
      })}
    </>
  );
};

const StarParticles = ({ count = 12, isFinal = false }: { count?: number, isFinal?: boolean }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[300]">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: '50vw', y: '50vh' }}
          animate={{ 
            opacity: 0, 
            scale: Math.random() * 1.5 + 0.5,
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            rotate: Math.random() * 360
          }}
          transition={{ duration: isFinal ? 2.5 : 1.5, ease: "easeOut" }}
          className="absolute text-amber-400"
        >
          <Star fill="currentColor" size={isFinal ? 24 : 12} />
        </motion.div>
      ))}
    </div>
  );
};

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SimplifiedData | null>(null);
  const [currentChunk, setCurrentChunk] = useState(-1);
  const [showChat, setShowChat] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ type: 'user' | 'bot'; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [history, setHistory] = useState<{ id: string; date: string; title: string; data: SimplifiedData }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  // Neuro-Friendly Features State
  const [isBionic, setIsBionic] = useState(true);
  const [audioMode, setAudioMode] = useState<'none' | 'brown' | 'white' | 'pink'>('none');
  const [mouseFocus, setMouseFocus] = useState(false);
  const [mousePos, setMousePos] = useState({ y: 0 });
  const [rewardType, setRewardType] = useState<'none' | 'step' | 'final'>('none');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<ScriptProcessorNode | null>(null);

  const catchphrases = ["Dastastic Mind!", "MindBridge Master!", "Pure Dassah Magic!", "Dassah-lightful!", "Mind Refined!"];
  const currentCatchphrase = useMemo(() => catchphrases[Math.floor(Math.random() * catchphrases.length)], [rewardType]);

  // Handle Auth & Load History
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

    // Local usage check
    const localUsage = localStorage.getItem('mindbridge_usage') || '0';
    setUsageCount(parseInt(localUsage));

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
    const { data: dbHistory, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (dbHistory) {
      setHistory(dbHistory.map(h => ({
        id: h.id,
        date: new Date(h.created_at).toLocaleString(),
        title: h.title,
        data: h.data
      })));
    }
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
    if (noiseNodeRef.current) {
      noiseNodeRef.current.disconnect();
      noiseNodeRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
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
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      setTimeout(() => { if(ctx.state !== 'closed') ctx.close(); }, 200);
    } catch (e) {}
  };

  useEffect(() => {
    if (audioMode !== 'none') {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContextClass();
      const bufferSize = 4096;
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let lastOut = 0.0;

      const node = context.createScriptProcessor(bufferSize, 1, 1);
      node.onaudioprocess = (e: any) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (audioMode === 'brown') {
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
          } else if (audioMode === 'pink') {
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11;
            b6 = white * 0.115926;
          } else {
            output[i] = white * 0.2;
          }
        }
      };
      
      node.connect(context.destination);
      audioCtxRef.current = context;
      noiseNodeRef.current = node;
    } else {
      stopAudio();
    }
    return () => stopAudio();
  }, [audioMode]);

  const saveToHistory = async (newData: SimplifiedData) => {
    const entryTitle = newData.tldr[0].slice(0, 30) + '...';
    if (user) {
      await supabase.from('history').insert({
        user_id: user.id,
        title: entryTitle,
        data: newData
      });
      loadHistory(user.id);
    } else {
      const entry = { id: Math.random().toString(36).substr(2, 9), date: new Date().toLocaleString(), title: entryTitle, data: newData };
      setHistory(prev => {
        const updated = [entry, ...prev].slice(0, 10);
        localStorage.setItem('adhd_filter_history', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleSimplify = async (textToSimplify = input) => {
    playClick();
    if (!textToSimplify.trim()) return;

    // Usage check
    const currentLimit = user ? 10 : 3;
    if (usageCount >= currentLimit) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSimplify }),
      });
      const result = await res.json();
      setData(result);
      await saveToHistory(result);
      
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('mindbridge_usage', newCount.toString());
      
      setCurrentChunk(-1);
    } catch (err) {
      alert('Failed to simplify.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Safety check for common ADHD garbage-text formats
    const allowedTypes = ['text/plain', 'text/csv'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      alert("Please upload .txt or .csv files. PDFs and Word docs are too 'noisy' for the bridge right now!");
      return;
    }

    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      Papa.parse(file, {
        complete: (results) => {
          const text = JSON.stringify(results.data);
          setInput(text.slice(0, 10000));
          handleSimplify(text);
        },
        header: true,
      });
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInput(text);
        handleSimplify(text);
      };
      reader.readAsText(file);
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    const userMsg = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { type: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'chat', question: userMsg, context: data }),
      });
      const result = await res.json();
      setChatHistory(prev => [...prev, { type: 'bot', text: result.answer }]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderChart = () => {
    if (!data?.chartData) return null;
    const { type, data: chartValues } = data.chartData;
    return (
      <div className="h-48 md:h-56 w-full mt-6 bg-slate-900/40 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/10">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={chartValues}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', background: '#1e293b', color: '#f8fafc' }} />
              <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                {chartValues.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={chartValues}>
              <Tooltip contentStyle={{ borderRadius: '16px', background: '#1e293b', border: 'none' }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6' }} />
            </LineChart>
          ) : (
            <PieChart>
              <Pie data={chartValues} innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value">
                {chartValues.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '16px', background: '#1e293b', border: 'none' }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const handleNext = () => {
    playClick();
    if (data && currentChunk < data.chunks.length - 1) {
      setCurrentChunk(c => c + 1);
      setRewardType('step');
      setTimeout(() => setRewardType('none'), 2000);
    } else if (data && currentChunk === data.chunks.length - 1) {
      setRewardType('final');
      setTimeout(() => {
        setRewardType('none');
        handleReset();
      }, 4000);
    }
  };

  const handleReset = () => {
    playClick();
    setData(null);
    setInput('');
    setCurrentChunk(-1);
  };

  return (
    <main onMouseMove={(e) => mouseFocus && setMousePos({ y: e.clientY })} className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 md:p-8 flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-blue-500/30">
      {/* Dopamine Rewards System */}
      <AnimatePresence>
        {rewardType !== 'none' && (
          <>
            <StarParticles count={rewardType === 'final' ? 50 : 15} isFinal={rewardType === 'final'} />
            <motion.div initial={{ opacity: 0, scale: 0.5, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none w-full px-4">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.5)] flex flex-col items-center gap-4 border border-white/20 backdrop-blur-xl">
                <div className="flex gap-2"><Star size={48} className="text-white animate-bounce" fill="currentColor" />{rewardType === 'final' && <Sparkles size={48} className="text-white animate-pulse" />}</div>
                <span className="font-black uppercase tracking-tighter text-white text-2xl md:text-4xl text-center italic drop-shadow-lg">{rewardType === 'final' ? "DASTASTIC TRIUMPH!" : currentCatchphrase}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Paywall / Limit Modal */}
      <AnimatePresence>
        {showPaywall && (
          <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-[500] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-slate-900 border border-blue-500/30 p-10 rounded-[3rem] text-center space-y-8 shadow-2xl">
              <div className="mx-auto w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400"><Crown size={40} /></div>
              <h2 className="text-3xl font-black text-white">Bridge Limit Reached</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                {!user 
                  ? "You've crossed 3 bridges today! Sign in to get 10 free bridges per day and save your history."
                  : "You've crossed 10 bridges today! Upgrade to MindBridge Pro for unlimited focus and custom soundscapes."}
              </p>
              <div className="space-y-4">
                {!user ? (
                  <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all">Sign in with Google</button>
                ) : (
                  <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105">Upgrade to Pro ($9/mo)</button>
                )}
                <button onClick={() => setShowPaywall(false)} className="w-full text-slate-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors">Maybe Later</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mouseFocus && (
          <div className="fixed inset-0 pointer-events-none z-[90] hidden md:block">
            <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-[4px]" style={{ maskImage: `linear-gradient(to bottom, black 0%, black calc(${mousePos.y}px - 60px), transparent calc(${mousePos.y}px - 40px), transparent calc(${mousePos.y}px + 40px), black calc(${mousePos.y}px + 60px), black 100%)`, WebkitMaskImage: `linear-gradient(to bottom, black 0%, black calc(${mousePos.y}px - 60px), transparent calc(${mousePos.y}px - 40px), transparent calc(${mousePos.y}px + 40px), black calc(${mousePos.y}px + 60px), black 100%)` }} />
          </div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="fixed top-4 md:top-8 left-4 md:left-8 right-4 md:right-8 flex justify-between items-center z-[110]">
        <div className="flex gap-2 md:gap-3">
          <button onClick={() => { playClick(); setShowHistory(true); }} className="p-3 md:p-4 bg-white/5 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/10 text-slate-400 hover:text-blue-400"><Clock size={16} /></button>
          <div className="flex bg-white/5 backdrop-blur-md p-1 rounded-xl md:rounded-2xl border border-white/10">
            <button onClick={() => { playClick(); setIsBionic(!isBionic); }} className={`p-2 md:p-3 rounded-lg md:rounded-xl flex items-center gap-2 ${isBionic ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}><Type size={18} /></button>
            <button onClick={() => { playClick(); setMouseFocus(!mouseFocus); }} className={`hidden md:flex p-3 rounded-xl items-center gap-2 ${mouseFocus ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400'}`}><MousePointer2 size={18} /></button>
            <div className="flex items-center gap-1 px-1 md:px-2 border-l border-white/10 ml-1">
              {['none', 'brown', 'pink'].map((mode) => (
                <button key={mode} onClick={() => { playClick(); setAudioMode(mode as any); }} className={`w-6 h-6 rounded-md text-[8px] font-black uppercase flex items-center justify-center transition-all ${audioMode === mode ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'}`}>{mode[0]}</button>
              ))}
              <Headphones size={14} className="ml-1 text-slate-500" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <button onClick={handleLogout} className="p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-slate-400 hover:text-red-400 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"><LogOut size={14} /> Logout</button>
          ) : (
            <button onClick={handleLogin} className="p-3 bg-blue-600 rounded-xl text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20"><LogIn size={14} /> Sign In</button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed left-0 top-0 bottom-0 w-72 md:w-80 bg-slate-900/80 backdrop-blur-xl z-[120] p-6 md:p-8 border-r border-white/10 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-10"><h2 className="font-bold text-xl flex items-center gap-3 text-white"><Clock size={20} className="text-blue-400" /> History</h2><button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20} /></button></div>
            <div className="space-y-4">{history.map((item) => (
              <button key={item.id} onClick={() => { setData(item.data); setCurrentChunk(-1); setShowHistory(false); }} className="w-full text-left p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all group"><p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-black">{item.date}</p><p className="text-sm font-bold text-slate-300 group-hover:text-blue-400 line-clamp-2 transition-colors">{item.title}</p></button>
            ))}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {!data ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full space-y-6 md:y-8 z-10 pt-12 md:pt-0">
          <div className="text-center space-y-4 md:space-y-6 mb-8 md:mb-12">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 5 }} className="mx-auto w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(59,130,246,0.3)] border border-white/20"><Brain size={40} md:size={56} /></motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter">Mind<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 italic">Bridge</span></h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-lg mx-auto leading-relaxed px-4">Turn information chaos into pure <span className="text-blue-400 font-bold">Clarity</span>.</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] border border-white/10 p-2 shadow-2xl mx-2">
            <textarea className="w-full h-64 md:h-72 p-6 md:p-10 text-lg md:text-xl bg-transparent resize-none focus:outline-none placeholder:text-slate-700 text-slate-200" placeholder="Paste your noise here..." value={input} onChange={(e) => setInput(e.target.value)} />
            <div className="bg-white/5 p-6 md:p-8 rounded-[1.75rem] md:rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-center gap-4 border border-white/5">
              <button onClick={() => { playClick(); fileInputRef.current?.click(); }} className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] hover:text-white transition-colors w-full sm:w-auto"><Upload size={18} className="inline mr-2" /> Upload</button>
              <button onClick={() => handleSimplify()} disabled={loading} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-400 text-white px-12 md:px-16 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-[0.1em] shadow-xl hover:shadow-blue-500/40 transition-all active:scale-95">{loading ? 'Bridging...' : 'Simplify'}</button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-2xl w-full pt-16 md:pt-10 z-10 px-2">
          {currentChunk === -1 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/60 backdrop-blur-3xl p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-white/10 space-y-8 md:space-y-12 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="bg-blue-500/10 text-blue-400 px-4 md:px-6 py-2 rounded-2xl text-[10px] font-black uppercase border border-blue-500/20">Save {data.readingTime}</div>
                <div className="flex gap-2 md:gap-4">
                  <button onClick={() => { playClick(); speak(data.whyCare); }} className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 hover:bg-white/10 transition-all"><Volume2 size={20} /></button>
                  <button onClick={handleReset} className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 hover:bg-white/10 transition-all"><RefreshCcw size={20} /></button>
                </div>
              </div>
              <div className="space-y-4 md:space-y-6"><h2 className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-black italic">Purpose</h2><p className="text-2xl md:text-3xl font-bold">{isBionic ? <BionicText text={data.whyCare} /> : data.whyCare}</p></div>
              <div className="space-y-6 md:space-y-8">{data.tldr.map((point, i) => (<motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} key={i} className="flex items-start group"><span className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1.25rem] bg-white/5 text-blue-400 flex items-center justify-center font-black mr-4 md:mr-6 border border-white/5 group-hover:border-blue-500/50 transition-all shadow-inner">{i + 1}</span><p className="text-lg md:text-xl mt-1 md:mt-2 font-medium text-slate-300">{isBionic ? <BionicText text={point} /> : point}</p></motion.div>))}</div>
              <button onClick={handleNext} className="w-full bg-blue-600 py-5 md:py-7 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-base md:text-lg shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all">Start Journey</button>
            </motion.div>
          ) : (
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-slate-900/60 backdrop-blur-3xl p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-white/10 min-h-[450px] md:min-h-[550px] flex flex-col shadow-2xl">
              <h2 className="text-3xl md:text-5xl font-black mb-6 md:mb-10 text-white tracking-tighter">{isBionic ? <BionicText text={data.chunks[currentChunk].heading} /> : data.chunks[currentChunk].heading}</h2>
              <div className="bg-blue-500/5 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-blue-500/10 flex-grow text-xl md:text-2xl leading-relaxed font-medium text-slate-300 shadow-inner italic">
                {isBionic ? <BionicText text={data.chunks[currentChunk].content} /> : data.chunks[currentChunk].content}
              </div>
              <div className="pt-8 md:pt-12 flex justify-between gap-4 md:gap-6">
                <button onClick={() => { playClick(); setCurrentChunk(c => c - 1); }} className="flex-1 py-4 md:py-6 rounded-[1.25rem] md:rounded-[2rem] font-black uppercase bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-xs">Back</button>
                <button onClick={handleNext} className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-400 py-4 md:py-6 rounded-[1.25rem] md:rounded-[2rem] font-black uppercase shadow-[0_15px_40px_rgba(59,130,246,0.4)] hover:shadow-blue-500/60 transition-all active:scale-95 text-xs">{currentChunk < data.chunks.length - 1 ? 'Next Step' : 'Finalize!'}</button>
              </div>
            </motion.div>
          )}
        </div>
      )}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv,.txt" />

      {/* Persistent AI Assistant */}
      {data && (
        <div className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-[200]">
          <AnimatePresence>
            {showChat && (
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute bottom-20 md:bottom-28 right-0 w-[85vw] sm:w-[24rem] h-[60vh] md:h-[34rem] bg-slate-900/95 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 md:p-8 flex justify-between items-center shadow-xl">
                  <div className="flex items-center gap-3"><Sparkles size={20} className="animate-pulse" /><span className="font-black uppercase tracking-[0.2em] text-xs">MindBridge AI</span></div>
                  <button onClick={() => setShowChat(false)} className="hover:bg-white/10 p-2 rounded-2xl transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 md:p-5 rounded-[1.25rem] md:rounded-[1.75rem] text-sm leading-relaxed font-medium ${msg.type === 'user' ? 'bg-blue-600 text-white shadow-xl rounded-br-none' : 'bg-white/10 text-slate-200 border border-white/5 rounded-bl-none'}`}>{msg.text}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 p-4 rounded-xl animate-pulse">
                        <Loader2 size={16} className="animate-spin text-blue-400" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 md:p-8 bg-white/5 border-t border-white/10 flex gap-3">
                  <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && askQuestion()} placeholder="Ask anything..." className="flex-grow bg-transparent text-sm focus:outline-none placeholder:text-slate-700 font-bold" />
                  <button onClick={askQuestion} disabled={chatLoading || !question.trim()} className="bg-blue-600 text-white p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-blue-500 shadow-xl transition-all"><Send size={18} /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowChat(!showChat)} className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-2xl md:rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(59,130,246,0.5)] border border-white/20">
            {showChat ? <X size={28} md:size={40} /> : <MessageCircle size={28} md:size={40} />}
          </motion.button>
        </div>
      )}
    </main>
  );
}
