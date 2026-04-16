"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Crown, Sparkles, Rocket, ArrowRight, X, Clock, Palette, 
  Upload, Volume2, Share2, Download, MessageCircle, Send, CheckCircle2, 
  Lock, Trophy, Sparkle, BarChart3, Fish, MessageSquare, Loader2, Type, Swords, Sun, Ghost, Star, Settings, MoreHorizontal,
  Compass, Check, LogOut, Shield
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

type Theme = 'midnight' | 'emerald' | 'sunset' | 'nebula' | 'ghost' | 'pearl' | 'rose' | 'celestial' | 'iron' | 'eternal';

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
  pearl: {
    name: 'Pearl Wisdom',
    c1: '#f8fafc', c2: '#e2e8f0',
    text: '#0f172a', accent: '#3b82f6',
    glass: 'rgba(255, 255, 255, 0.7)', border: 'rgba(59, 130, 246, 0.2)',
    shadow: 'rgba(0,0,0,0.1)', mesh: 'rgba(59, 130, 246, 0.05)',
    prism: ['#3b82f6', '#60a5fa', '#93c5fd']
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
  chunks: { heading: string; content: string; keyTerms: string[]; metaphor: string; dopamineHook: string; }[];
  chartData: { type: 'bar' | 'line' | 'pie'; data: { name: string; value: number }[] } | null;
  actions: { task: string; priority: 'high' | 'medium' | 'low' }[];
}

const StarParticles = ({ count, isFinal }: { count: number, isFinal: boolean }) => (
  <div className="fixed inset-0 pointer-events-none z-[401]">
    {[...Array(count)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: -20, x: Math.random() * 2000, opacity: 1, scale: Math.random() * 0.5 + 0.5 }}
        animate={{ 
          y: 1200, 
          x: `calc(${Math.random() * 2000}px + ${Math.random() * 100 - 50}px)`, 
          rotate: 360,
          opacity: 0 
        }}
        transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
        className="absolute"
      >
        {isFinal ? <Trophy className="text-amber-400" size={24} /> : <Sparkle className="text-blue-400" size={16} />}
      </motion.div>
    ))}
  </div>
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
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);

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
      {[...Array(isMobile ? 4 : 8)].map((_, i) => (
        <motion.div
          key={`${i}`}
          animate={focusMode === 'sovereign' ? sovereignPulse : currentPulse}
          style={{
            position: 'absolute',
            left: `${(i * 25) % 100}%`,
            top: `${(i * 35) % 100}%`,
            width: `${300 + i * 100}px`,
            height: `${300 + i * 100}px`,
            background: `radial-gradient(circle at center, ${t.prism[i % 3]}${focusMode === 'sovereign' ? '22' : '88'}, transparent)`,
            borderRadius: '50%',
            filter: `blur(${isMobile ? '50px' : '90px'})`,
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

export default function Home() {
  const [input, setInput] = useState('');
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [focusMode, setFocusMode] = useState<'dastastic' | 'sovereign'>('dastastic');
  const [dassahPoints, setDassahPoints] = useState(0);
  const [suspenseIdx, setSuspenseIdx] = useState(0);
  const [actionIdx, setActionIdx] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [isZenLocked, setIsZenLocked] = useState(false);
  const [isGreyedOut, setIsGreyedOut] = useState(false);
  
  const callsign = !user ? "Neural Seeker" : isPaid ? "Prism Architect" : "Sovereign Discernor";
  const syncLevel = !user ? "Seeking Neural Anchor..." : isPaid ? "Sync: Absolute" : "Sync Level: Processing";

  const catchphrases = ["INTEL SECURED!", "OBJECTIVE CAPTURED!", "NEURAL SYNC: 100%", "DATA STREAM PURIFIED!", "FOCUS ANCHORED!"];
  const currentCatchphrase = useMemo(() => catchphrases[Math.floor(Math.random() * catchphrases.length)], [rewardType]);

  const brainPulseDuration = input.length > 500 ? 0.5 : input.length > 100 ? 1 : 3;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<any>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput; setChatInput(''); setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch('/api/simplify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'chat', question: userMsg, context: data }) });
      const result = await res.json();
      setChatHistory(prev => [...prev, { role: 'ai', text: result.answer }]);
      if (user) { await supabase.from('feedback_vault').insert({ user_id: user.id, type: 'chat', content: { question: userMsg, answer: result.answer, contextTitle: data?.tldr?.[0] || 'General Prism' } }); }
    } catch (err) { setChatHistory(prev => [...prev, { role: 'ai', text: "The Filter is shaky, try again!" }]); } finally { setChatLoading(false); }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!feedbackInput.trim()) return;
    try {
      const { error } = await supabase.from('feedback_vault').insert({ user_id: user?.id || null, type: 'feedback', content: { feedback: feedbackInput, timestamp: new Date().toISOString() } });
      if (error) throw error; setFeedbackInput(''); setFeedbackSuccess(true);
      setTimeout(() => { setFeedbackSuccess(false); setShowFeedback(false); }, 2000);
    } catch (err) { alert("Feedback failed to cross the Prism."); }
  };

  const handleReadAloud = (text: string) => {
    if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false); return; }
    const utterance = new SpeechSynthesisUtterance(text); utterance.onend = () => setIsPlaying(false);
    utteranceRef.current = utterance; setIsPlaying(true); window.speechSynthesis.speak(utterance);
  };

  const playClick = () => { 
    try { 
      const audio = new Audio('/audio/click.mp3'); 
      audio.volume = 0.2; 
      audio.onerror = () => {};
      audio.play().catch(() => {});
    } catch(e) {} 
  };

  const loadHistory = async (userId: string) => {
    const { data, error } = await supabase.from('history').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!error && data) setHistory(data.map(h => ({ id: h.id, date: new Date(h.created_at).toLocaleDateString(), title: h.title, data: h.data })));
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('is_paid, avatar_url').eq('id', userId).single();
    if (data) {
      setIsPaid(data.is_paid);
      setAvatarUrl(data.avatar_url);
    }
    if (error && error.code !== 'PGRST116') console.error('Error loading profile:', error);
  };

  const handleLogin = async () => { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); };
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setHistory([]); };

  const handleReset = () => { setData(null); setCurrentChunk(-1); setInput(''); setChatHistory([]); setRewardType('none'); };

  const playSuspenseSound = (variant = suspenseIdx) => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass(); if (ctx.state === 'suspended') ctx.resume();
      audioCtxRef.current = ctx;
      const progressions = [ [261.63, 329.63, 392.00, 523.25], [220.00, 261.63, 329.63, 440.00], [196.00, 246.94, 293.66, 392.00] ];
      const notes = progressions[variant % 3]; let nextNoteTime = ctx.currentTime;
      const scheduleNote = () => {
        while (nextNoteTime < ctx.currentTime + 0.1) {
          const osc = ctx.createOscillator(); const g = ctx.createGain();
          osc.type = variant === 1 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(notes[Math.floor(Math.random() * notes.length)], nextNoteTime);
          if (variant === 2) { 
            const mod = ctx.createOscillator(); const modG = ctx.createGain();
            mod.frequency.setValueAtTime(osc.frequency.value * 2.5, nextNoteTime);
            modG.gain.setValueAtTime(200, nextNoteTime);
            mod.connect(modG); modG.connect(osc.frequency); mod.start(nextNoteTime); mod.stop(nextNoteTime + 1.5);
          }
          g.gain.setValueAtTime(0, nextNoteTime); g.gain.linearRampToValueAtTime(variant === 2 ? 0.015 : 0.03, nextNoteTime + 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + (variant === 1 ? 2.5 : 1.5));
          osc.connect(g); g.connect(ctx.destination); osc.start(nextNoteTime); osc.stop(nextNoteTime + 3);
          nextNoteTime += (variant === 1 ? 1.2 : 0.6);
        }
      };
      const intervalId = setInterval(scheduleNote, 25);
      noiseNodeRef.current = { disconnect: () => clearInterval(intervalId) };
    } catch (e) {}
  };

  const playActionSound = (variant = actionIdx) => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass(); if (ctx.state === 'suspended') ctx.resume();
      audioCtxRef.current = ctx;
      if (variant === 0) {
        const freqs = [130.81, 164.81, 196.00];
        freqs.forEach(f => {
          const osc = ctx.createOscillator(); const g = ctx.createGain();
          osc.type = 'sine'; osc.frequency.setValueAtTime(f, ctx.currentTime);
          const lfo = ctx.createOscillator(); lfo.frequency.setValueAtTime(0.5, ctx.currentTime);
          const lfoG = ctx.createGain(); lfoG.gain.setValueAtTime(0.3, ctx.currentTime);
          lfo.connect(lfoG); lfoG.connect(g.gain); g.gain.setValueAtTime(0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 2);
          osc.connect(g); g.connect(ctx.destination); lfo.start(); osc.start(); noiseNodeRef.current = osc;
        });
      } else if (variant === 1) { 
        let nextDropTime = ctx.currentTime;
        const scheduleDrop = () => {
          while (nextDropTime < ctx.currentTime + 0.1) {
            const osc = ctx.createOscillator(); const g = ctx.createGain();
            osc.type = 'sine'; osc.frequency.setValueAtTime(Math.random() * 500 + 400, nextDropTime);
            osc.frequency.exponentialRampToValueAtTime(100, nextDropTime + 0.1);
            g.gain.setValueAtTime(0.02, nextDropTime); g.gain.exponentialRampToValueAtTime(0.001, nextDropTime + 0.1);
            osc.connect(g); g.connect(ctx.destination); osc.start(nextDropTime); osc.stop(nextDropTime + 0.1);
            nextDropTime += 0.15;
          }
        };
        const intervalId = setInterval(scheduleDrop, 25);
        noiseNodeRef.current = { disconnect: () => clearInterval(intervalId) };
      } else { 
        const bufferSize = ctx.sampleRate * 2; const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource(); noise.buffer = buffer; noise.loop = true;
        const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(400, ctx.currentTime);
        const lfo = ctx.createOscillator(); lfo.frequency.setValueAtTime(0.3, ctx.currentTime);
        const lfoG = ctx.createGain(); lfoG.gain.setValueAtTime(300, ctx.currentTime);
        lfo.connect(lfoG); lfoG.connect(filter.frequency);
        const gain = ctx.createGain(); gain.gain.setValueAtTime(0, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
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
      const ctx = new AudioContextClass(); if (ctx.state === 'suspended') ctx.resume();
      audioCtxRef.current = ctx;
      const bufferSize = ctx.sampleRate * 2; const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0); let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) { const white = Math.random() * 2 - 1; output[i] = (lastOut + (0.02 * white)) / 1.02; lastOut = output[i]; output[i] *= 3.5; }
      const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true;
      const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(400, ctx.currentTime);
      const gain = ctx.createGain(); gain.gain.setValueAtTime(0, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 1);
      source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      source.start(); noiseNodeRef.current = source;
    }
  }, [audioMode, suspenseIdx, actionIdx]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { 
      setUser(session?.user ?? null); 
      if (session?.user) {
        loadHistory(session.user.id);
        loadProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { 
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
    if (textParam) { setInput(decodeURIComponent(textParam)); handleSimplify(decodeURIComponent(textParam)); window.history.replaceState({}, document.title, "/"); }
    return () => subscription.unsubscribe();
  }, []);

  const handleSimplify = async (textToSimplify = input) => {
    playClick(); if (!textToSimplify.trim()) return; 
    const limit = user ? 15 : 5;
    if (usageCount >= limit && !isPaid) { setShowPaywall(true); return; }
    
    setLoading(true);
    setData(null); // CLEAR PREVIOUS DATA TO FORCE NEW DISCERNMENT UI
    try {
      const cognitiveMode = focusMode === 'sovereign' ? 'ceo' : 'adhd';
      const res = await fetch('/api/simplify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: textToSimplify, isScenic, cognitiveMode }) });
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || "The Prism is blurry. Try again."); }
      const result = await res.json(); setData(result);
      const title = result.tldr[0].slice(0, 30) + '...';
      if (user) { await supabase.from('history').insert({ user_id: user.id, title, data: result }); loadHistory(user.id); }
      setUsageCount(prev => { const next = prev + 1; localStorage.setItem('dassahs_prism_usage', next.toString()); return next; });
      setCurrentChunk(-1);
    } catch (err: any) { alert(err.message || 'The Prism encountered a storm!'); } finally { setLoading(false); }
  };

  const handleShare = async () => { 
    if (!data) return; setIsSharing(true); 
    try { 
      const shareText = `I just crushed a massive document in ${data.readingTime} using Dassah's Prism. ⚡️ Sovereignty reclaimed.\n\nCheck out the Prism: ${window.location.origin}/?text=${encodeURIComponent(input.slice(0, 500))}`; 
      await navigator.clipboard.writeText(shareText); alert("Viral share text copied! Go brag on TikTok or X! 🚀"); 
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

  const handleNext = () => {
    if (data && currentChunk < data.chunks.length) { setCurrentChunk(c => c + 1); setRewardType('step'); setTimeout(() => setRewardType('none'), 2000); } 
    else if (data && currentChunk === data.chunks.length) {
      setRewardType('final'); setIsZenLocked(false); if (document.fullscreenElement) document.exitFullscreen();
      setDassahPoints(prev => { const next = prev + 10; localStorage.setItem('dassah_points', next.toString()); return next; });
      setTimeout(() => { setRewardType('none'); handleReset(); }, 5000);
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
    .prism-text {
      background: linear-gradient(110deg, var(--prism-1) 0%, var(--prism-2) 25%, #fff 50%, var(--prism-2) 75%, var(--prism-3) 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: prism-refract 4s linear infinite;
      display: inline-block;
      padding-right: 0.05em;
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
      <main onMouseMove={(e) => mouseFocus && setMousePos({ x: e.clientX, y: e.clientY })} className={`min-h-screen font-sans flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-blue-500/40 transition-all duration-1000 ${isGreyedOut ? 'grayscale sepia contrast-50' : ''}`} style={{ background: `radial-gradient(circle at 50% 50%, var(--color-bg-1) 0%, var(--color-bg-2) 100%)`, color: 'var(--color-text)' }}>
      <FrostedGlassDepth theme={theme} mousePos={mousePos} audioMode={audioMode} isZenLocked={isZenLocked} focusMode={focusMode} />
      <div className="fixed inset-0 pointer-events-none opacity-20"><div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `radial-gradient(var(--color-accent) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} /><div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black/40" /></div>

      <AnimatePresence>{rewardType !== "none" && focusMode === "dastastic" && (
        <><StarParticles count={rewardType === 'final' ? 150 : 40} isFinal={rewardType === 'final'} /><motion.div initial={{ opacity: 0, scale: 0.5, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.5 }} className="fixed inset-0 z-[400] flex items-center justify-center pointer-events-none p-4 text-center"><div className="bg-gradient-to-br from-blue-600 via-purple-600 to-amber-500 p-10 md:p-20 rounded-[3.5rem] md:rounded-[6rem] shadow-[0_0_200px_rgba(59,130,246,1)] border-4 border-white/40 backdrop-blur-3xl flex flex-col items-center gap-8"><RefractiveNeuralCore loading={false} inputLength={0} isVictorious={rewardType === 'final'} user={user} mousePos={mousePos} focusMode={focusMode} /><div className="space-y-2"><p className="text-blue-200 font-black uppercase tracking-[0.4em] text-xs md:text-sm">{rewardType === 'final' ? "Mission Objective: Complete" : "Neural Link Established"}</p><h2 className="font-black italic text-5xl md:text-9xl text-white tracking-tighter drop-shadow-2xl">{rewardType === 'final' ? "SOVEREIGNTY RECLAIMED" : currentCatchphrase}</h2></div>{rewardType === 'final' && (<div className="flex gap-8 pt-4"><div className="text-left border-l-2 border-white/20 pl-6"><p className="text-white/60 text-[10px] font-black uppercase">Rank</p><p className="text-white font-bold text-xl md:text-2xl italic">Master Discernor</p></div><div className="text-left border-l-2 border-white/20 pl-6"><p className="text-white/60 text-[10px] font-black uppercase">Result</p><p className="text-white font-bold text-xl md:text-2xl italic">100% Clarity</p></div></div>)}</div></motion.div></>
      )}</AnimatePresence>

      <div className="fixed top-0 left-0 right-0 z-[110] flex justify-center p-6 pointer-events-none">
        <nav className={`pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-3xl bg-[var(--color-glass)] backdrop-blur-3xl border border-[var(--color-border)] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-700 ${isZenLocked ? 'opacity-0 -translate-y-20' : 'opacity-100'}`}>
          <button onClick={() => { playClick(); setShowCommandCenter(true); }} title="Neural Command" className="p-3 rounded-2xl bg-white/5 text-blue-400 hover:text-white hover:bg-white/10 transition-all group">
            <Compass size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
          
          <div className="w-[1px] h-6 bg-white/10 mx-1" />
          
          {/* Quick Toggles */}
          <div className="flex items-center gap-1">
            <button onClick={() => { playClick(); setIsBionic(!isBionic); }} title="Bionic Reading (T)" className={`p-3 rounded-xl transition-all ${isBionic ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Type size={18} />
            </button>
            {data && (
              <button onClick={handleToggleZenLock} title="Anchor Focus (Lock)" className={`p-3 rounded-xl transition-all ${isZenLocked ? 'bg-red-600 text-white animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Lock size={18} />
              </button>
            )}
          </div>

          <div className="w-[1px] h-6 bg-white/10 mx-1" />
          
          <div className="flex items-center gap-4 px-2">
            <div className="flex flex-col items-center">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400/60 leading-none mb-1">Neural Sync</p>
              <div className="flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" size={10} />
                <span className="font-black text-white text-xs tabular-nums">{dassahPoints}</span>
              </div>
            </div>
          </div>

          <div className="w-[1px] h-6 bg-white/10 mx-1" />

          <button onClick={() => { playClick(); setFocusMode(f => f === "dastastic" ? "sovereign" : "dastastic"); }} className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${focusMode === 'sovereign' ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'text-slate-400 hover:text-white'}`}>
            {focusMode === 'sovereign' ? <Crown size={14} /> : <Zap size={14} />}
            <span className="hidden sm:block">{focusMode === 'sovereign' ? 'Sovereign' : 'Dastastic'}</span>
          </button>

          {user ? (
            <button onClick={() => setShowCommandCenter(true)} className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-blue-500/30 hover:border-blue-400 hover:scale-105 transition-all shadow-lg flex items-center justify-center bg-blue-500/10">
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
      <button onClick={() => setShowFeedback(true)} className="fixed bottom-8 left-8 z-[200] p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 transition-all opacity-40 hover:opacity-100 group shadow-2xl">
        <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageSquare size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
      </button>

      <AnimatePresence>
        {showCommandCenter && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[600] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
              {/* Left Side: Stats & Actions */}
              <div className="space-y-8">
                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-black text-white italic">Neural Profile</h2>
                      <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mt-1">{callsign}</p>
                    </div>
                    <div className="bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 flex items-center gap-2">
                      <Star className="text-amber-500 fill-amber-500" size={14}/><span className="font-black text-white text-xs">{dassahPoints}</span>
                    </div>
                  </div>

                  {/* Neural Identity Section */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 px-2">Neural Identity</p>
                    <div className="flex flex-wrap gap-3 px-2">
                      {DEFAULT_AVATARS.map((av) => (
                        <button key={av.id} onClick={() => handleAvatarSelect(av.id)} className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${avatarUrl === av.id ? 'border-white bg-white/10 scale-110 shadow-lg' : 'border-transparent bg-white/5 opacity-40 hover:opacity-100'}`} title={av.label}>
                          {av.icon}
                        </button>
                      ))}
                      <label className="w-12 h-12 rounded-xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/10 transition-all">
                        <Upload size={18} className="text-slate-400" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => { setShowCommandCenter(false); setShowHistory(true); }} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all text-left group">
                      <Clock className="text-blue-400 mb-3" size={24} />
                      <p className="text-[10px] font-black uppercase text-slate-500">Vault</p>
                      <p className="text-sm font-bold text-white">History</p>
                    </button>
                    <button onClick={() => { playClick(); setFocusMode(f => f === "dastastic" ? "sovereign" : "dastastic"); }} className={`p-6 rounded-[2rem] border transition-all text-left ${focusMode === 'sovereign' ? 'bg-amber-600/20 border-amber-500/50' : 'bg-white/5 border-white/10'}`}>
                      {focusMode === 'sovereign' ? <Crown className="text-amber-400 mb-3" size={24} /> : <Zap className="text-blue-400 mb-3" size={24} />}
                      <p className="text-[10px] font-black uppercase text-slate-500">Mode</p>
                      <p className="text-sm font-bold text-white">{focusMode === 'sovereign' ? 'Sovereign' : 'Dastastic'}</p>
                    </button>
                  </div>

                  {!isPaid && (
                    <button onClick={() => { setShowCommandCenter(false); setShowPaywall(true); }} className="w-full p-8 rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between group overflow-hidden relative shadow-2xl">
                      <div className="relative z-10 text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Architect Access</p>
                        <p className="text-xl font-black italic">Upgrade Neural Link</p>
                      </div>
                      <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform relative z-10" />
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </button>
                  )}
                </div>

                <div className="flex justify-center">
                  <button onClick={() => setShowCommandCenter(false)} className="px-12 py-4 rounded-full bg-white text-black font-black uppercase tracking-[0.5em] text-[10px] hover:scale-105 transition-all">Close</button>
                </div>
              </div>

              {/* Right Side: Settings */}
              <div className="bg-white/5 p-8 md:p-10 rounded-[3rem] border border-white/10 space-y-8 max-h-[80vh] overflow-y-auto no-scrollbar">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Visual Spectrum</p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(THEMES).map(([id, t]) => (
                      <button key={id} onClick={() => { playClick(); setTheme(id as any); }} className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${theme === id ? 'border-white bg-white/10' : 'border-transparent bg-white/5 opacity-60 hover:opacity-100'}`}>
                        <div className="w-8 h-8 rounded-lg shadow-lg flex-shrink-0" style={{ backgroundColor: t.accent }} />
                        <span className="text-[10px] font-bold text-white truncate">{t.name}</span>
                        {theme === id && <Check className="text-white ml-auto" size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Neural Resonance</p>
                  <div className="grid grid-cols-1 gap-3">
                    {[ 
                      {m:'none', i:<X size={18}/>, n:'Silent', d:'Pure focus without sound'}, 
                      {m:'brown', i:<Sun size={18}/>, n:'Neural Resonance', d:'Steady brown noise for deep work'}, 
                      {m:'suspense', i:<Ghost size={18}/>, n:'Atmospheric Harmony', d:'Dynamic soundscape that evolves'}, 
                      {m:'action', i:<Swords size={18}/>, n:'Zen Flow', d:'High-energy focus rhythm'} 
                    ].map((s) => (
                      <button key={s.m} onClick={() => { playClick(); setAudioMode(s.m as any); }} className={`flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${audioMode === s.m ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                        <div className={`p-3 rounded-xl ${audioMode === s.m ? 'bg-white/20' : 'bg-white/5'}`}>{s.i}</div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest">{s.n}</p>
                          <p className={`text-[10px] opacity-60 font-medium ${audioMode === s.m ? 'text-white' : 'text-slate-500'}`}>{s.d}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button onClick={() => { setShowCommandCenter(false); setShowAbout(true); }} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white flex items-center gap-4 text-[10px] font-black uppercase tracking-widest transition-all"><Brain size={18}/> About the Prism</button>
                  {user && <button onClick={handleLogout} className="w-full p-5 rounded-2xl bg-red-600/5 border border-red-600/20 text-red-400 hover:bg-red-600 hover:text-white flex items-center gap-4 text-[10px] font-black uppercase tracking-widest transition-all"><LogOut size={18}/> Disconnect Neural Link</button>}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>{showAbout && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[600] flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }} animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }} className="max-w-3xl w-full refractive-border p-8 md:p-16 rounded-[3rem] md:rounded-[5rem] shadow-[0_0_150px_rgba(255,255,255,0.1)] relative my-auto overflow-hidden">
            {[...Array(12)].map((_, i) => <GlassShard key={i} i={i} color={currentTheme.prism[i % 3]} mousePos={mousePos} />)}
            <motion.div initial={{ x: '-100%', skewX: -20 }} animate={{ x: '200%' }} transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />
            <button onClick={() => setShowAbout(false)} className="absolute top-8 right-8 p-4 hover:bg-white/10 rounded-full text-slate-400 transition-colors z-20"><X size={32}/></button>
            <div className="space-y-12 relative z-10">
              <motion.header style={{ x: (mousePos.x - 1000) * 0.02, y: (mousePos.y - 500) * 0.02 }} className="space-y-4">
                <div className="flex items-center gap-4 text-blue-400 font-black uppercase tracking-[0.3em] text-xs"><div className="w-12 h-[2px] bg-blue-500/50" /> THE HEART OF DASSAH'S PRISM</div>
                <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.4] tracking-tight italic pb-6">From Noise to Divine <span className="prism-text">Clarity</span></h2>
              </motion.header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <motion.div style={{ x: (mousePos.x - 1000) * -0.01, y: (mousePos.y - 500) * -0.01 }} className="space-y-6 text-slate-300 text-lg leading-relaxed font-medium">
                  <p>Dassah's Prism is not merely a tool; it is a living testimony. For those of us navigating the spectrum, Profound Cognitive Intensity is not a deficiency to be 'fixed,' but a high-powered engine awaiting its rightful fuel. Guided by the grace of Christ, I have come to embrace this condition as a divine blessing—a singular, vibrant lens that allows us to perceive the world's complexity with a unique and profound depth.</p>
                  <p>Our mission is to empower every neurodivergent soul to reclaim the sovereignty of their focus. We transmute the overwhelming cacophony of modern information into a purposeful stream of clarity, inviting you to step out of the noise and into the light of the gift we have been given.</p>
                </motion.div>
                <motion.div style={{ x: (mousePos.x - 1000) * 0.03, y: (mousePos.y - 500) * 0.03 }} className="space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 italic">
                  <p className="text-blue-400 font-black uppercase text-xs tracking-widest mb-4">The Origin</p>
                  <p className="text-slate-400">"It started after a long, transformative talk with my brother, longest friend, and ultimate support system, <span className="text-white font-bold">Eng. Jimmy Njuguna</span>, who challenged me to use my tech knowledge for a greater purpose. That spark was ignited when my cousin and mentor, <span className="text-white font-bold">Dr. Kizzie Shako</span>, looked at my struggle and said: <span className="text-blue-400 uppercase font-black tracking-tight">'Then do something about it.'</span>"</p>
                  <p className="text-slate-400 mt-4">— And so, the Dastastic Prism was built.</p>
                </motion.div>
              </div>
              <div className="space-y-8 pt-8 border-t border-white/10">
                <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4"><Zap size={24} className="text-amber-500" /> The Methodology</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { n: "01", t: "Neural Refraction", d: "Capture noise via 'Dastastic' (Dopamine-First) or 'Sovereign' (Executive-Sleek) modes. Our engine maps your chosen cognitive path instantly." },
                    { n: "02", t: "Executive Distillation", d: "The Grace: We strip the fluff, boiling down complex noise into high-impact maps for rapid, sovereign decision-making." },
                    { n: "03", t: "Cognitive Resonance", d: "The Flow: Integrated audio-visual synchronization and Zen-locked focus lock your brain into a state of divine clarity." }
                  ].map((step, i) => (<motion.div style={{ y: (mousePos.y - 500) * (0.01 * (i + 1)) }} key={i} className="space-y-3"><span className="text-4xl font-black text-blue-500/30 tracking-tight">{step.n}</span><p className="text-white font-black uppercase text-sm tracking-widest">{step.t}</p><p className="text-slate-500 text-sm font-medium">{step.d}</p></motion.div>))}
                </div>
              </div>
              <footer className="pt-12 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-white/10">
                <div className="flex items-center gap-6"><div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl"><span className="text-3xl font-black text-white italic">DJ</span></div><div><p className="text-white font-black uppercase text-sm tracking-widest">Founded by DJ</p><p className="text-slate-500 text-xs font-bold uppercase tracking-tighter flex items-center gap-2">DChan + JGitu <motion.div animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block"><Fish size={14} className="text-blue-500" /></motion.div> Rooted in Christ</p></div></div>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] text-center sm:text-right">Dedicated to my forever partner and best friend, Dchan.</p>
              </footer>
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
              <h2 className="text-3xl font-black text-white italic">How's the Prism?</h2>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl lg:max-w-4xl w-full space-y-10 z-10 px-4 pt-24 pb-20">
          <header className="text-center space-y-8 relative">
            <h1 className="text-6xl md:text-9xl font-black text-white leading-[1.2] tracking-tighter italic">Dassah's <span className="prism-text">Prism</span></h1>
            <p className="text-lg md:text-xl text-blue-400/80 font-bold italic tracking-tight text-center">"Turn overwhelming noise into clear focus in seconds."</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto opacity-60 hover:opacity-100 transition-opacity">
            <div className="bg-black/20 p-6 rounded-[2rem] border border-white/5 space-y-3"><p className="text-[8px] uppercase tracking-widest text-slate-500 font-black">The Noise</p><p className="text-xs text-slate-500 leading-relaxed">This is a very long and confusing sentence that just keeps going and going and your brain might start to wander off because there is no clear structure or path for your eyes to follow and it just feels like a wall of text.</p></div>
            <div className="bg-blue-500/5 p-6 rounded-[2rem] border border-blue-500/10 space-y-3 relative overflow-hidden"><div className="absolute top-2 right-4 animate-pulse"><Sparkle size={10} className="text-blue-400" /></div><p className="text-[8px] uppercase tracking-widest text-blue-400 font-black">The Clarity</p><p className="text-xs text-slate-300 leading-relaxed font-bold"><span className="text-white font-black">Thi</span>s <span className="text-white font-black">i</span>s <span className="text-white font-black">a</span> <span className="text-white font-black">shor</span>t, <span className="text-white font-black">Bioni</span>c <span className="text-white font-black">pat</span>h. <span className="text-white font-black">You</span>r <span className="text-white font-black">brai</span>n <span className="text-white font-black">lock</span>s <span className="text-white font-black">i</span>n <span className="text-white font-black">instan</span>tly.</p></div>
          </div>
          <div className="bg-[var(--color-glass)] backdrop-blur-3xl rounded-[3rem] border-2 border-white/10 p-3 shadow-2xl overflow-hidden relative group focus-within:border-blue-500/50 transition-all flex flex-col items-center">
            <div className="pt-6 pb-2"><RefractiveNeuralCore loading={loading} inputLength={input.length} isVictorious={false} user={user} mousePos={mousePos} focusMode={focusMode} /></div>
            <div className="w-full relative group">
              {showNeuroMirror ? (
                <div className="w-full h-64 md:h-80 bg-black/20 rounded-[2.5rem] overflow-y-auto"><NeuroMirrorText text={input || "Paste some text..."} /></div>
              ) : (
                <textarea className="w-full h-64 md:h-80 p-8 md:p-12 text-lg md:text-xl bg-transparent resize-none focus:outline-none placeholder:text-slate-700 text-slate-200 leading-relaxed font-medium" placeholder="Paste the noise here..." value={input} onChange={(e) => setInput(e.target.value)} />
              )}
            </div>
            <div className="w-full bg-[var(--color-glass)] p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-white/5">
              <div className="flex items-center gap-4">
                <button onClick={() => { playClick(); fileInputRef.current?.click(); }} className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-3"><Upload size={20} className="text-blue-500" /> Clean Document</button>
                <button onClick={() => { playClick(); setShowNeuroMirror(!showNeuroMirror); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${showNeuroMirror ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-[var(--color-glass)] border-[var(--color-border)] text-slate-500'}`}><Ghost size={16} /><span className="text-[10px] font-black uppercase tracking-widest">{showNeuroMirror ? 'Stop' : 'Show Noise'}</span></button>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button onClick={() => setIsScenic(!isScenic)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all ${isScenic ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-[var(--color-glass)] border-[var(--color-border)] text-slate-500'}`}>{isScenic ? <Sparkles size={18}/> : <Zap size={18}/>}<span className="text-[10px] font-black uppercase tracking-widest">{isScenic ? 'Scenic' : 'Quick'}</span></button>
                <button onClick={() => handleSimplify()} disabled={loading || !input.trim()} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white px-12 md:px-20 py-5 md:py-7 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(147,51,234,0.3)] hover:shadow-[0_0_60px_rgba(147,51,234,0.5)] transition-all active:scale-95 text-lg">{loading ? <Loader2 className="animate-spin" /> : 'Discern It'}</button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-2xl lg:max-w-3xl w-full pt-32 pb-20 z-10 px-4">
          <div className="mb-8 flex justify-end gap-4"><button onClick={handleDownloadSummary} className="p-4 bg-[var(--color-glass)] border border-[var(--color-border)] rounded-2xl text-slate-400 hover:text-white transition-all flex items-center gap-3 font-black uppercase text-[10px] tracking-widest"><Download size={18}/> Save Summary</button></div>
          <AnimatePresence mode="wait">
            {currentChunk === -1 ? (
              <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="bg-[var(--color-glass)] backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] border border-[var(--color-border)] space-y-12 shadow-2xl"><div className="flex items-center justify-between"><div className="bg-blue-500/10 text-blue-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-3"><Rocket size={18}/> Saved {data.readingTime}</div><button onClick={handleReset} className="p-5 bg-[var(--color-glass)] rounded-3xl text-slate-500 hover:text-red-400 transition-all"><X size={24}/></button></div><div className="space-y-8"><h2 className="text-[10px] uppercase tracking-[0.5em] text-blue-400 font-black italic">The Vision</h2><p className="text-4xl md:text-5xl font-black leading-[1.1] text-white tracking-tight">{isBionic ? <BionicText text={data.whyCare} /> : data.whyCare}</p></div><div className="space-y-10">{data.tldr.map((point, i) => (<motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} key={i} className="flex items-start group"><span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[var(--color-glass)] text-blue-400 flex items-center justify-center font-black mr-8 border border-[var(--color-border)] group-hover:border-blue-500/50 transition-all text-lg">{i + 1}</span><p className="text-xl md:text-2xl font-bold text-slate-300 leading-snug">{isBionic ? <BionicText text={point} /> : point}</p></motion.div>))}</div><button onClick={() => { setCurrentChunk(0); playClick(); }} className="w-full bg-[var(--color-accent)] py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xl shadow-2xl hover:opacity-80 transition-all active:scale-95">Open the Prism <ArrowRight className="inline ml-4"/></button></motion.div>
            ) : currentChunk === data.chunks.length ? (
              <motion.div key="roadmap" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-[var(--color-glass)] backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] border-2 border-blue-500/30 space-y-12 shadow-2xl relative overflow-hidden"><div className="space-y-4"><h2 className="text-[10px] uppercase tracking-[0.5em] text-blue-400 font-black italic">The Roadmap</h2><h3 className="text-4xl md:text-5xl font-black text-white tracking-tight italic">Priority Overview</h3></div><div className="space-y-6">{data.actions.map((action, i) => (<motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all"><div className="flex items-center gap-6"><div className={`w-3 h-3 rounded-full shadow-[0_0_15px] ${action.priority === 'high' ? 'bg-red-500 shadow-red-500' : action.priority === 'medium' ? 'bg-amber-500 shadow-amber-500' : 'bg-blue-500 shadow-blue-500'}`} /><p className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">{action.task}</p></div><span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${action.priority === 'high' ? 'border-red-500/50 text-red-400 bg-red-500/10' : action.priority === 'medium' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-blue-500/50 text-blue-400 bg-blue-500/10'}`}>{action.priority}</span></motion.div>))}</div><div className="flex flex-col sm:flex-row gap-4 mt-12"><button onClick={handleShare} className="flex-1 p-6 bg-[var(--color-glass)] border border-[var(--color-border)] rounded-[2rem] text-slate-400 hover:text-white transition-all flex items-center justify-center gap-3 font-black uppercase text-sm tracking-widest"><Share2 size={24}/> {isSharing ? 'Copying...' : 'Share the Prism'}</button><button onClick={() => { playClick(); handleNext(); }} className="flex-[2] bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 p-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xl shadow-[0_20px_50px_rgba(59,130,246,0.5)] hover:scale-[1.02] transition-all active:scale-95 text-white flex items-center justify-center gap-4">Seal the Prism <CheckCircle2 size={28}/></button></div></motion.div>
            ) : (
              <motion.div key={currentChunk} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0, x: -100 }} className="bg-[var(--color-glass)] backdrop-blur-3xl p-10 md:p-16 rounded-[3.5rem] border border-[var(--color-border)] min-h-[600px] flex flex-col shadow-2xl relative overflow-hidden"><div className="absolute top-10 left-10 flex items-center gap-4"><div className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.5em]">Prism Segment {currentChunk + 1} / {data.chunks.length}</div><button onClick={() => handleReadAloud(data.chunks[currentChunk].content)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-amber-500 text-white shadow-lg animate-pulse' : 'bg-[var(--color-glass)] text-slate-500 hover:text-white border border-[var(--color-border)]'}`}><Volume2 size={16}/></button></div><h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tighter leading-none pt-12">{isBionic ? <BionicText text={data.chunks[currentChunk].heading} /> : data.chunks[currentChunk].heading}</h2><div className="space-y-8 flex-grow"><div className="bg-blue-500/5 p-8 md:p-12 rounded-[2.5rem] border border-blue-500/10 text-2xl md:text-3xl leading-relaxed font-black text-slate-200 italic shadow-inner">{isBionic ? <BionicText text={data.chunks[currentChunk].content} /> : data.chunks[currentChunk].content}</div>{data.chartData && currentChunk === 0 && (<div className="bg-[var(--color-glass)] p-10 rounded-[3rem] border border-[var(--color-border)] space-y-6"><div className="flex items-center gap-3 text-blue-400 font-black uppercase tracking-widest text-xs"><BarChart3 size={20} /> Data Pulse</div><div className="h-[250px] w-full"><ResponsiveContainer width="100%" height="100%">{data.chartData.type === 'bar' ? (<BarChart data={data.chartData.data}><XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />{data.chartData.data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}<Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} /></BarChart>) : data.chartData.type === 'line' ? (<LineChart data={data.chartData.data}><XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} /><Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} /></LineChart>) : (<PieChart><Pie data={data.chartData.data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{data.chartData.data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie></PieChart>)}</ResponsiveContainer></div></div>)}<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-amber-500/5 p-6 rounded-[2rem] border border-amber-500/10 space-y-3"><div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-widest text-[10px]"><Zap size={14}/> Dopamine Hook</div><p className="text-lg font-bold text-amber-200/80 italic">"{data.chunks[currentChunk].dopamineHook}"</p></div><div className="bg-purple-500/5 p-6 rounded-[2rem] border border-purple-500/10 space-y-3"><div className="flex items-center gap-2 text-purple-400 font-black uppercase tracking-widest text-[10px]"><Sparkle size={14}/> Metaphor</div><p className="text-lg font-bold text-purple-200/80 italic">"{data.chunks[currentChunk].metaphor}"</p></div></div></div><div className="mt-12 flex justify-between items-center"><button onClick={() => setCurrentChunk(c => c - 1)} className="px-10 py-6 rounded-2xl font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Back</button><button onClick={handleNext} className="bg-white text-black px-16 py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-90">{currentChunk === data.chunks.length - 1 ? 'Next Step' : 'Next Segment'}</button></div>{data.chunks[currentChunk].metaphor && (<div className="bg-white/5 border-t border-white/10 p-10 md:p-16 flex flex-col md:flex-row gap-10"><div className="flex-1 space-y-4"><div className="flex items-center gap-3 text-amber-400 font-black uppercase tracking-widest text-xs"><Brain size={18} /> The Metaphor</div><p className="text-xl text-slate-400 italic font-medium leading-relaxed">"{data.chunks[currentChunk].metaphor}"</p></div><div className="flex-1 space-y-4"><div className="flex items-center gap-3 text-blue-400 font-black uppercase tracking-widest text-xs"><Sparkles size={18} /> Dopamine Hook</div><p className="text-xl text-slate-300 font-black tracking-tight">{data.chunks[currentChunk].dopamineHook}</p></div></div>)}</motion.div>
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

      <AnimatePresence>{data && !isZenLocked && (<div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end gap-4">{chatOpen && (<motion.div initial={{ opacity: 0, y: 50, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.8 }} className="w-[350px] md:w-[450px] bg-[var(--color-shadow)] backdrop-blur-3xl border-2 border-blue-500/30 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden max-h-[500px]"><div className="bg-blue-600 p-6 flex justify-between items-center"><h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-3"><MessageCircle size={18}/> Ask DJ</h3><button onClick={() => setChatOpen(false)} className="text-white hover:bg-white/10 p-2 rounded-xl transition-all"><X size={20}/></button></div><div className="flex-grow overflow-y-auto p-6 space-y-4 text-sm font-medium h-[300px]">{chatHistory.length === 0 && <p className="text-slate-500 italic text-center py-10">"Ask me anything!"</p>}{chatHistory.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[var(--color-glass)] text-slate-300 border border-[var(--color-border)]'}`}>{msg.text}</div></div>))}{chatLoading && <div className="flex justify-start"><div className="bg-[var(--color-glass)] p-4 rounded-2xl animate-pulse text-slate-500">Thinking...</div></div>}</div><form onSubmit={handleChat} className="p-4 border-t border-[var(--color-border)] bg-[var(--color-glass)] flex gap-2"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a question..." className="flex-grow bg-[var(--color-shadow)] p-4 rounded-xl text-white focus:outline-none border border-[var(--color-border)]" /><button type="submit" className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-500 transition-all active:scale-95"><Send size={18}/></button></form></motion.div>)}<button onClick={() => setChatOpen(!chatOpen)} className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all active:scale-90 border-2 border-white/20"><MessageCircle size={28}/></button></div>)}</AnimatePresence>
      
      <footer className="w-full py-12 px-4 border-t border-white/5 z-10 flex flex-col items-center gap-4 text-center opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-white font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-3 justify-center">
          DJ <Fish size={12} className="text-blue-500" /> | Rooted in Christ | Dedicated to Dchan.
        </p>
        <button onClick={() => setShowAbout(true)} className="mt-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">About the Prism</button>
      </footer>
    </main></>);
}
