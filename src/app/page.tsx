'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Brain, Loader2, RefreshCcw, FileText, 
  CheckCircle2, Upload, BarChart3, Volume2, MessageCircle, 
  X, Send, Sparkles, BookOpen, Clock, Zap, Layers, ChevronRight,
  Headphones, MousePointer2, Type, Star
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

// Reward Particles Component
const StarParticles = ({ count = 12, isFinal = false }: { count?: number, isFinal?: boolean }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[300]">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 1, 
            scale: 0, 
            x: '50vw', 
            y: '50vh' 
          }}
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

  useEffect(() => {
    const stored = localStorage.getItem('adhd_filter_history');
    if (stored) setHistory(JSON.parse(stored));

    const urlParams = new URLSearchParams(window.location.search);
    const textParam = urlParams.get('text');
    if (textParam) {
      const decodedText = decodeURIComponent(textParam);
      setInput(decodedText);
      handleSimplify(decodedText);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

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

  const saveToHistory = (newData: SimplifiedData) => {
    const entry = { id: Math.random().toString(36).substr(2, 9), date: new Date().toLocaleString(), title: newData.tldr[0].slice(0, 30) + '...', data: newData };
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 10);
      localStorage.setItem('adhd_filter_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSimplify = async (textToSimplify = input) => {
    playClick();
    if (!textToSimplify.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSimplify }),
      });
      const result = await res.json();
      setData(result);
      saveToHistory(result);
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
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInput(text);
      handleSimplify(text);
    };
    reader.readAsText(file);
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
      <div className="h-56 w-full mt-6 bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/10">
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
              <Pie data={chartValues} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value">
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
    <main onMouseMove={(e) => mouseFocus && setMousePos({ y: e.clientY })} className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Dopamine Rewards System */}
      <AnimatePresence>
        {rewardType !== 'none' && (
          <>
            <StarParticles count={rewardType === 'final' ? 50 : 15} isFinal={rewardType === 'final'} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 50 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.5 }} 
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none"
            >
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 p-8 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.5)] flex flex-col items-center gap-4 border border-white/20 backdrop-blur-xl">
                <div className="flex gap-2">
                  <Star size={rewardType === 'final' ? 64 : 32} className="text-white animate-bounce" fill="currentColor" />
                  {rewardType === 'final' && <Sparkles size={64} className="text-white animate-pulse" />}
                </div>
                <span className="font-black uppercase tracking-tighter text-white text-4xl text-center italic drop-shadow-lg">
                  {rewardType === 'final' ? "DASTASTIC TRIUMPH!" : currentCatchphrase}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mouseFocus && (
          <div className="fixed inset-0 pointer-events-none z-[90]">
            <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-[4px]" style={{ maskImage: `linear-gradient(to bottom, black 0%, black calc(${mousePos.y}px - 60px), transparent calc(${mousePos.y}px - 40px), transparent calc(${mousePos.y}px + 40px), black calc(${mousePos.y}px + 60px), black 100%)`, WebkitMaskImage: `linear-gradient(to bottom, black 0%, black calc(${mousePos.y}px - 60px), transparent calc(${mousePos.y}px - 40px), transparent calc(${mousePos.y}px + 40px), black calc(${mousePos.y}px + 60px), black 100%)` }} />
          </div>
        )}
      </AnimatePresence>

      <div className="fixed top-8 left-8 right-8 flex justify-between items-center z-[110]">
        <div className="flex gap-3">
          <button onClick={() => { playClick(); setShowHistory(true); }} className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-slate-400 hover:text-blue-400"><Clock size={16} /></button>
          <div className="flex bg-white/5 backdrop-blur-md p-1 rounded-2xl border border-white/10">
            <button onClick={() => { playClick(); setIsBionic(!isBionic); }} className={`p-3 rounded-xl flex items-center gap-2 ${isBionic ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}><Type size={18} /></button>
            <button onClick={() => { playClick(); setMouseFocus(!mouseFocus); }} className={`p-3 rounded-xl flex items-center gap-2 ${mouseFocus ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400'}`}><MousePointer2 size={18} /></button>
            <div className="flex items-center gap-1 px-2 border-l border-white/10 ml-1">
              {['none', 'brown', 'pink', 'white'].map((mode) => (
                <button key={mode} onClick={() => { playClick(); setAudioMode(mode as any); }} className={`w-6 h-6 rounded-md text-[8px] font-black uppercase flex items-center justify-center transition-all ${audioMode === mode ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'}`}>{mode[0]}</button>
              ))}
              <Headphones size={14} className="ml-1 text-slate-500" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10"><span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 italic">Dassah's MindBridge</span></div>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full space-y-8 z-10">
          <div className="text-center space-y-6 mb-12">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 5 }} className="mx-auto w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(59,130,246,0.3)] border border-white/20"><Brain size={56} /></motion.div>
            <h1 className="text-7xl font-black text-white leading-none tracking-tighter">Mind<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 italic">Bridge</span></h1>
            <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">Turn information chaos into pure <span className="text-blue-400 font-bold">Clarity</span>.</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-2 shadow-2xl">
            <textarea className="w-full h-72 p-10 text-xl bg-transparent resize-none focus:outline-none placeholder:text-slate-700 text-slate-200" placeholder="Paste your noise here..." value={input} onChange={(e) => setInput(e.target.value)} />
            <div className="bg-white/5 p-8 rounded-[2.5rem] flex justify-between items-center border border-white/5">
              <button onClick={() => { playClick(); fileInputRef.current?.click(); }} className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] hover:text-white transition-colors"><Upload size={18} className="inline mr-2" /> Upload</button>
              <button onClick={() => handleSimplify()} disabled={loading} className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-16 py-6 rounded-[2rem] font-black uppercase tracking-[0.1em] shadow-xl hover:shadow-blue-500/40 transition-all active:scale-95">{loading ? 'Bridging...' : 'Simplify'}</button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-2xl w-full pt-10 z-10">
          {currentChunk === -1 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/60 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/10 space-y-12 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="bg-blue-500/10 text-blue-400 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase border border-blue-500/20">Save {data.readingTime}</div>
                <div className="flex gap-4">
                  <button onClick={() => { playClick(); speak(data.whyCare); }} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"><Volume2 size={20} /></button>
                  <button onClick={handleReset} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"><RefreshCcw size={20} /></button>
                </div>
              </div>
              <div className="space-y-6"><h2 className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-black italic">Purpose</h2><p className="text-3xl font-bold">{isBionic ? <BionicText text={data.whyCare} /> : data.whyCare}</p></div>
              <div className="space-y-8">{data.tldr.map((point, i) => (<motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} key={i} className="flex items-start group"><span className="w-12 h-12 rounded-[1.25rem] bg-white/5 text-blue-400 flex items-center justify-center font-black mr-6 border border-white/5 group-hover:border-blue-500/50 transition-all shadow-inner">{i + 1}</span><p className="text-xl mt-2 font-medium text-slate-300">{isBionic ? <BionicText text={point} /> : point}</p></motion.div>))}</div>
              <button onClick={handleNext} className="w-full bg-blue-600 py-7 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-lg shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all">Start Journey</button>
            </motion.div>
          ) : (
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-slate-900/60 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/10 min-h-[550px] flex flex-col shadow-2xl">
              <h2 className="text-5xl font-black mb-10 text-white tracking-tighter">{isBionic ? <BionicText text={data.chunks[currentChunk].heading} /> : data.chunks[currentChunk].heading}</h2>
              <div className="bg-blue-500/5 p-10 rounded-[2.5rem] border border-blue-500/10 flex-grow text-2xl leading-relaxed font-medium text-slate-300 shadow-inner italic">
                {isBionic ? <BionicText text={data.chunks[currentChunk].content} /> : data.chunks[currentChunk].content}
              </div>
              <div className="pt-12 flex justify-between gap-6">
                <button onClick={() => { playClick(); setCurrentChunk(c => c - 1); }} className="flex-1 py-6 rounded-[2rem] font-black uppercase bg-white/5 border border-white/5 hover:bg-white/10 transition-all">Back</button>
                <button onClick={handleNext} className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-400 py-6 rounded-[2rem] font-black uppercase shadow-[0_15px_40px_rgba(59,130,246,0.4)] hover:shadow-blue-500/60 transition-all active:scale-95">{currentChunk < data.chunks.length - 1 ? 'Next Step' : 'Finalize!'}</button>
              </div>
            </motion.div>
          )}
        </div>
      )}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
    </main>
  );
}
