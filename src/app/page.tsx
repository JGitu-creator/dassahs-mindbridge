"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Sparkles, Rocket, ArrowRight, X, Clock, Palette, 
  Upload, Volume2, Share2, Download, MessageCircle, Send, CheckCircle2, 
  Lock, Trophy, Sparkle, BarChart3, MessageSquare, Loader2, Type, Swords, Sun, Moon, Ghost, Star, Settings, MoreHorizontal,
  Compass, Check, LogOut, Shield, Anchor, Heart, Eye, Music, Church, ShieldCheck, Disc, Code, Camera, BookOpen, ChevronRight, MoonStar, Flame, Coins, Gem, Orbit,
  Hexagon, Monitor, Zap, Brain, Fish, Copy, RefreshCw, Sliders, Play, Square, Headphones, FileText, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { StackedThemeSelector } from '@/components/morphing/StackedThemeSelector';
import { MorphFish, MorphBrain, MorphZap, MorphRocket, MorphEye, MorphSettings } from '@/components/morphing/MorphIcons';

// Theme Presets with high-contrast vibrancy
const THEMES = [
  { id: 'quantum-emerald', name: 'Quantum Emerald', p1: '#10B981', p2: '#065F46', p3: '#34D399', rgb: '16, 185, 129', bgDark: '#04130d', bgLight: '#f0fdf4' },
  { id: 'prism-violet', name: 'Prism Violet', p1: '#8B5CF6', p2: '#4C1D95', p3: '#C084FC', rgb: '139, 92, 246', bgDark: '#0d071a', bgLight: '#faf5ff' },
  { id: 'cyber-amber', name: 'Cyber Amber', p1: '#F59E0B', p2: '#78350F', p3: '#FCD34D', rgb: '245, 158, 11', bgDark: '#180e03', bgLight: '#fffbeb' },
  { id: 'abyssal-azure', name: 'Abyssal Azure', p1: '#3B82F6', p2: '#1E3A8A', p3: '#60A5FA', rgb: '59, 130, 246', bgDark: '#030d1c', bgLight: '#eff6ff' },
  { id: 'solar-rose', name: 'Solar Rose', p1: '#F43F5E', p2: '#881337', p3: '#FB7185', rgb: '244, 63, 94', bgDark: '#18040a', bgLight: '#fff1f2' },
  { id: 'neon-matrix', name: 'Neon Matrix', p1: '#00FF66', p2: '#003B00', p3: '#66FF99', rgb: '0, 255, 102', bgDark: '#001100', bgLight: '#f0fdf4' },
  { id: 'obsidian-monochrome', name: 'Obsidian Mono', p1: '#E5E7EB', p2: '#374151', p3: '#9CA3AF', rgb: '229, 231, 235', bgDark: '#090a0f', bgLight: '#f8fafc' },
];

export default function DassahsPrismPage() {
  // Theme & Appearance State
  const [currentThemeId, setCurrentThemeId] = useState('quantum-emerald');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('dark');
  const [storyMode, setStoryMode] = useState(false);
  const [bionicReading, setBionicReading] = useState(false);

  // Modals & Panels
  const [aboutOpen, setAboutOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectedLens, setSelectedLens] = useState<'clarity' | 'executive' | 'creative' | 'technical'>('clarity');
  const [activeThinkingMode, setActiveThinkingMode] = useState<'engage' | 'synthesis' | 'bionic' | 'story'>('engage');

  // Input & Refraction State
  const [inputText, setInputText] = useState('');
  const [refractedText, setRefractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Audio / Brown Noise State
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // User Auth State
  const [user, setUser] = useState<any>(null);

  // Hidden File Inputs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const activeTheme = useMemo(() => {
    return THEMES.find(t => t.id === currentThemeId) || THEMES[0];
  }, [currentThemeId]);

  // Apply Theme CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--prism-1', activeTheme.p1);
    root.style.setProperty('--prism-2', activeTheme.p2);
    root.style.setProperty('--prism-3', activeTheme.p3);
    root.style.setProperty('--prism-rgb', activeTheme.rgb);
  }, [activeTheme]);

  // Handle Light / Dark / System Mode
  useEffect(() => {
    const root = document.documentElement;
    const applyMode = (mode: 'light' | 'dark' | 'system') => {
      let isDark = false;
      if (mode === 'dark') isDark = true;
      else if (mode === 'light') isDark = false;
      else isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    applyMode(themeMode);

    if (themeMode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.style.colorScheme = 'light';
        }
      };
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [themeMode]);

  // Fetch Supabase Auth User
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error('Supabase user fetch error:', err);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Web Audio 432Hz / Brown Noise Focus Hum
  const toggleBrownNoise = () => {
    if (audioPlaying) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAudioPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 432;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.08;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start();

        audioContextRef.current = ctx;
        noiseNodeRef.current = noise;
        setAudioPlaying(true);
      } catch (e) {
        console.error('Audio generation failed:', e);
      }
    }
  };

  // Google OAuth Sign In
  const handleSignIn = async () => {
    try {
      localStorage.setItem('dassahs_prism_tos_accepted', 'true');
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Handle File Upload (txt, md, docx, pdf)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(`Loading ${file.name}...`);
    const reader = new FileReader();

    if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputText(content);
        setStatusMessage(`Loaded ${file.name} (${content.length} chars)`);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputText(content);
        setStatusMessage(`Loaded ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  // Handle Refract / Discern API Call
  const handleRefract = async () => {
    if (!inputText.trim()) {
      setStatusMessage('Please enter or upload text to refract.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Refracting through cognitive spectrum...');

    try {
      const endpoint = typeof window !== 'undefined' ? `${window.location.origin}/api/simplify` : '/api/simplify';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          mode: selectedLens,
          storyMode: storyMode || activeThinkingMode === 'story',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to refract document');
      }

      setRefractedText(data.refractedText || data.simplified || data.result || 'Refraction complete.');
      setStatusMessage('Refraction crystal clear.');
    } catch (err: any) {
      console.error('Refraction error:', err);
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!refractedText) return;
    navigator.clipboard.writeText(refractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Bionic Reading Formatter
  const renderBionicText = (content: string) => {
    if (!bionicReading) return content;
    return content.split(' ').map((word, i) => {
      const mid = Math.ceil(word.length / 2);
      const boldPart = word.slice(0, mid);
      const rest = word.slice(mid);
      return (
        <span key={i} className="inline-block mr-1">
          <strong className="font-extrabold text-[var(--prism-1)]">{boldPart}</strong>
          {rest}
        </span>
      );
    });
  };

  const isLight = themeMode === 'light';

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 font-sans selection:bg-[var(--prism-1)] selection:text-black ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#06090e] text-slate-100'
      }`}
      style={{
        backgroundImage: isLight 
          ? 'radial-gradient(circle at 50% 0%, rgba(var(--prism-rgb), 0.08) 0%, transparent 70%)'
          : 'radial-gradient(circle at 50% 0%, rgba(var(--prism-rgb), 0.15) 0%, transparent 70%)'
      }}
    >
      {/* Top Refractive Navbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors ${
        isLight ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-[#080d15]/85 border-slate-800/80 shadow-2xl'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setAboutOpen(true)}>
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[var(--prism-1)] to-[var(--prism-2)] p-[2px] shadow-lg shadow-[var(--prism-1)]/20">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-[#090d14]'}`}>
                <Hexagon size={20} className="text-[var(--prism-1)] animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black tracking-tight text-lg bg-gradient-to-r from-[var(--prism-1)] via-[var(--prism-3)] to-[var(--prism-1)] bg-clip-text text-transparent">
                  Dassah's Prism
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[var(--prism-1)]/30 text-[var(--prism-1)] bg-[var(--prism-1)]/10">
                  Mindbridge
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Cognitive Synthesis & Neurodivergent Sanctuary</p>
            </div>
          </div>

          {/* Center Action Controls: Neural Command & Audio */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Neural Command Button (Compass) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCommandOpen(true)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border font-semibold text-xs transition-all shadow-sm ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' 
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-200 shadow-[0_0_15px_rgba(var(--prism-rgb),0.15)]'
              }`}
            >
              <Compass size={16} className="text-[var(--prism-1)] animate-spin-slow" />
              <span className="hidden sm:inline">Neural Command</span>
            </motion.button>

            {/* 432Hz Brown Noise Generator */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleBrownNoise}
              title="432Hz Neuro-Acoustic Brown Noise"
              className={`p-2 rounded-xl border text-xs transition-all ${
                audioPlaying
                  ? 'bg-[var(--prism-1)]/20 border-[var(--prism-1)] text-[var(--prism-1)] shadow-[0_0_15px_rgba(var(--prism-rgb),0.3)]'
                  : isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600' : 'bg-slate-900/80 border-slate-700 text-slate-400'
              }`}
            >
              {audioPlaying ? <Disc size={16} className="animate-spin text-[var(--prism-1)]" /> : <Headphones size={16} />}
            </motion.button>

            {/* Google Profile / User Authentication */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
                <img 
                  src={user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=Dassah'} 
                  alt={user.user_metadata?.full_name || 'User'} 
                  className="w-8 h-8 rounded-full border-2 border-[var(--prism-1)]"
                />
                <button 
                  onClick={handleSignOut} 
                  title="Sign Out" 
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleSignIn}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[var(--prism-1)] to-[var(--prism-2)] text-black shadow-md shadow-[var(--prism-1)]/20 hover:opacity-95 transition"
              >
                Sign In
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Main Sanctuary Workspace */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Hero Banner / Cognitive Status */}
        <div className={`rounded-3xl p-6 sm:p-8 border backdrop-blur-xl relative overflow-hidden transition-all shadow-xl ${
          isLight 
            ? 'bg-white/80 border-slate-200' 
            : 'bg-gradient-to-br from-slate-900/90 via-[#0a0f18]/90 to-slate-900/90 border-slate-800'
        }`}>
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--prism-1)]/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="flex h-2 w-2 rounded-full bg-[var(--prism-1)] animate-ping" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--prism-1)]">
                  Cognitive Ascension Active • {activeTheme.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Refract Complexity into Luminous Truth.
              </h1>
              <p className={`text-sm mt-1 max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Designed for ADHD and intense cognitive fatigue. Whether a single sentence or a 50-page legal docket, decompose information into clear takeaways.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAboutOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--prism-1)]/40 text-[var(--prism-1)] bg-[var(--prism-1)]/10 hover:bg-[var(--prism-1)]/20 transition flex items-center space-x-1.5"
              >
                <Heart size={14} />
                <span>Our Story</span>
              </button>
            </div>
          </div>
        </div>

        {/* Input Document Container */}
        <div className={`rounded-3xl border p-4 sm:p-6 backdrop-blur-xl transition-all shadow-xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#090e17]/90 border-slate-800'
        }`}>
          {/* Text Area */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your notes, legal briefing, technical document, or research here... (No size limit — full document synthesis supported)"
            rows={7}
            className={`w-full p-4 rounded-2xl border text-sm transition font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[var(--prism-1)]/50 ${
              isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400' 
                : 'bg-black/40 border-slate-800 text-slate-100 placeholder:text-slate-500'
            }`}
          />

          {/* Interactive Toolbar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/50">
            {/* Left Upload & Mode Buttons */}
            <div className="flex items-center space-x-2">
              {/* Document Upload Button */}
              <input 
                ref={fileInputRef} 
                type="file" 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".txt,.md,.doc,.docx,.pdf,.csv"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300' : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title="Upload Document (.txt, .md, .docx, .pdf, .csv)"
              >
                <Upload size={14} className="text-[var(--prism-1)]" />
                <span className="hidden sm:inline">Upload Document</span>
              </motion.button>

              {/* Camera / Photo Capture Button */}
              <input 
                ref={cameraInputRef} 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => cameraInputRef.current?.click()}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300' : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title="Capture or Upload Image / Scan"
              >
                <Camera size={14} className="text-[var(--prism-3)]" />
                <span className="hidden sm:inline">Scan Photo</span>
              </motion.button>

              {/* Story Mode vs Strict Fact Mode Warping Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStoryMode(!storyMode)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                  storyMode
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-400'
                }`}
                title="Toggle between Story Narrative and Strict Fact Mode"
              >
                <motion.div
                  key={storyMode ? 'rocket' : 'anchor'}
                  initial={{ rotate: -90, scale: 0.6 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {storyMode ? <MorphRocket size={16} /> : <Anchor size={16} />}
                </motion.div>
                <span>{storyMode ? 'Story Flight' : 'Strict Anchor'}</span>
              </motion.button>
            </div>

            {/* Right Action: Refract Button */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isLoading}
                onClick={handleRefract}
                className={`flex items-center space-x-2 px-5 py-2 rounded-xl font-bold text-sm text-black transition-all shadow-lg ${
                  isLoading
                    ? 'bg-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[var(--prism-1)] via-[var(--prism-3)] to-[var(--prism-1)] hover:opacity-95 shadow-[var(--prism-1)]/30'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-black" />
                    <span>Refracting...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} className="text-black fill-black" />
                    <span>Refract Document</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {statusMessage && (
            <p className="mt-2 text-xs font-mono text-slate-400 italic">
              {statusMessage}
            </p>
          )}
        </div>

        {/* Refracted Output Display */}
        {refractedText && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl border p-6 backdrop-blur-xl transition-all shadow-2xl ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0a0f19]/95 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/50">
              <div className="flex items-center space-x-2">
                <Sparkles size={18} className="text-[var(--prism-1)]" />
                <h3 className="font-bold text-base tracking-tight">Refracted Spectrum</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--prism-1)]/10 text-[var(--prism-1)] font-mono">
                  {storyMode ? 'Narrative Analogy' : 'Executive Synthesis'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Bionic Reading Toggle */}
                <button
                  onClick={() => setBionicReading(!bionicReading)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                    bionicReading 
                      ? 'bg-[var(--prism-1)]/20 border-[var(--prism-1)] text-[var(--prism-1)]' 
                      : isLight ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title="Bionic Reading (Bolds initial word stems for rapid fixation)"
                >
                  <Type size={14} className="inline mr-1" />
                  Bionic
                </button>

                {/* Copy Output */}
                <button
                  onClick={handleCopy}
                  className={`p-1.5 rounded-lg border text-xs transition ${
                    copied 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                      : isLight ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title="Copy to Clipboard"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className={`prose max-w-none text-sm leading-relaxed whitespace-pre-line font-sans ${
              isLight ? 'text-slate-800' : 'text-slate-200'
            }`}>
              {renderBionicText(refractedText)}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer Navigation & Theme Controls */}
      <footer className={`mt-16 border-t py-8 transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-[#05080e] border-slate-800/80 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Hexagon size={16} className="text-[var(--prism-1)]" />
            <span className="text-xs font-semibold">
              Dassah's Prism • Sanctuary for Neurodivergent Minds
            </span>
          </div>

          {/* Theme Mode Capsule: Sun / MoonStar / Monitor */}
          <div className={`flex items-center space-x-1 p-1 rounded-2xl border shadow-inner ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              onClick={() => setThemeMode('light')}
              className={`p-1.5 rounded-xl transition ${
                themeMode === 'light' ? 'bg-white shadow text-amber-500' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Light Contrast Mode"
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`p-1.5 rounded-xl transition ${
                themeMode === 'dark' ? 'bg-slate-800 shadow text-[var(--prism-1)]' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Obsidian Dark Mode"
            >
              <MoonStar size={16} />
            </button>
            <button
              onClick={() => setThemeMode('system')}
              className={`p-1.5 rounded-xl transition ${
                themeMode === 'system' ? 'bg-slate-800 shadow text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Match System Preferences"
            >
              <Monitor size={16} />
            </button>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium">
            <button onClick={() => setAboutOpen(true)} className="hover:text-[var(--prism-1)] transition">
              About & Testimony
            </button>
            <button onClick={() => setCommandOpen(true)} className="hover:text-[var(--prism-1)] transition">
              Neural Command
            </button>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 1. NEURAL COMMAND MODAL (Full Spectrum of Thinking Modes)  */}
      {/* ======================================================== */}
      <AnimatePresence>
        {commandOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-8 shadow-2xl relative overflow-hidden ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#080d16] border-slate-700/80 text-slate-100'
              }`}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-[var(--prism-1)]/10 border border-[var(--prism-1)]/30 text-[var(--prism-1)]">
                    <Compass size={22} className="animate-spin-slow" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight">Neural Command Center</h2>
                    <p className="text-xs text-slate-400">Configure thinking modes, sensory shielding & chromatic spectrum</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCommandOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Cognitive / Thinking Modes Grid */}
              <div className="mt-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--prism-1)]">
                  Active Thinking Mode
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Engage / Tactical Execution */}
                  <div 
                    onClick={() => { setActiveThinkingMode('engage'); setStoryMode(false); }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      activeThinkingMode === 'engage'
                        ? 'bg-[var(--prism-1)]/15 border-[var(--prism-1)] shadow-md shadow-[var(--prism-1)]/10'
                        : isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Swords size={16} className="text-[var(--prism-1)]" />
                      <span className="font-bold text-sm">Engage / Tactical Mode</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Cuts ADHD paralysis. High signal, fast task prioritization, immediate next steps.
                    </p>
                  </div>

                  {/* Deep Synthesis */}
                  <div 
                    onClick={() => { setActiveThinkingMode('synthesis'); setStoryMode(false); }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      activeThinkingMode === 'synthesis'
                        ? 'bg-[var(--prism-1)]/15 border-[var(--prism-1)] shadow-md shadow-[var(--prism-1)]/10'
                        : isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Brain size={16} className="text-purple-400" />
                      <span className="font-bold text-sm">Deep Synthesis</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Multi-variable correlation, connecting fragmented concepts into cohesive pillars.
                    </p>
                  </div>

                  {/* Bionic Shield */}
                  <div 
                    onClick={() => { setActiveThinkingMode('bionic'); setBionicReading(true); }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      activeThinkingMode === 'bionic'
                        ? 'bg-[var(--prism-1)]/15 border-[var(--prism-1)] shadow-md shadow-[var(--prism-1)]/10'
                        : isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldCheck size={16} className="text-blue-400" />
                      <span className="font-bold text-sm">Bionic Cognitive Shield</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Visual fixation anchors with high-contrast text stems to glide through walls of text.
                    </p>
                  </div>

                  {/* Story Flight */}
                  <div 
                    onClick={() => { setActiveThinkingMode('story'); setStoryMode(true); }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      activeThinkingMode === 'story'
                        ? 'bg-[var(--prism-1)]/15 border-[var(--prism-1)] shadow-md shadow-[var(--prism-1)]/10'
                        : isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Rocket size={16} className="text-amber-400" />
                      <span className="font-bold text-sm">Story Flight Mode</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Converts dry abstraction into living analogies and memorable mental pictures.
                    </p>
                  </div>
                </div>

                {/* Stacked Theme Chromatic Selector */}
                <div className="pt-4 border-t border-slate-700/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--prism-1)] mb-3">
                    Chromatic Spectrum Selection
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setCurrentThemeId(theme.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-2 ${
                          currentThemeId === theme.id
                            ? 'border-white bg-white/10 text-white shadow-md'
                            : isLight ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-slate-800 bg-slate-900/70 text-slate-400'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.p1 }} />
                        <span>{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 2. ABOUT THE PRISM (Unique, Colourful & Heartfelt Story) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {aboutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl my-8 rounded-3xl border-2 p-6 sm:p-10 shadow-[0_0_80px_rgba(var(--prism-rgb),0.35)] relative overflow-hidden bg-gradient-to-br from-[var(--prism-1)]/20 via-[#0a0f1d]/95 to-[var(--prism-3)]/20 border-[var(--prism-1)]/50 backdrop-blur-2xl text-slate-100"
            >
              {/* Decorative Prismatic Radial Beams */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--prism-1)]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--prism-3)]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between pb-6 border-b border-slate-700/60">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--prism-1)] via-[var(--prism-3)] to-[var(--prism-2)] p-[2px] shadow-lg shadow-[var(--prism-1)]/30">
                    <div className="w-full h-full rounded-[14px] bg-[#070b14] flex items-center justify-center">
                      <Sparkles size={24} className="text-[var(--prism-1)] animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-[var(--prism-3)] bg-clip-text text-transparent">
                      About Dassah's Prism
                    </h2>
                    <p className="text-xs font-mono text-[var(--prism-1)]">
                      A Sacred Sanctuary for Divergent Minds & Cognitive Dignity
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAboutOpen(false)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body Content */}
              <div className="relative z-10 mt-6 space-y-6 text-sm leading-relaxed text-slate-200 max-h-[65vh] overflow-y-auto pr-2">
                {/* Vision Card */}
                <div className="p-5 rounded-2xl bg-black/40 border border-[var(--prism-1)]/30 shadow-inner">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Hexagon size={18} className="text-[var(--prism-1)]" />
                    <span>The Genesis & Vision</span>
                  </h3>
                  <p className="mt-2 text-slate-300 text-xs sm:text-sm">
                    Dassah's Prism was born out of an intimate, hard-won journey with ADHD, sensory overwhelm, and chronic cognitive fatigue. When dense walls of text induce paralysis and drain the mind, the Prism acts as an optical decompression chamber—breaking monochromatic information overload into vibrant, digestible spectrums of meaning.
                  </p>
                </div>

                {/* Testimony of Grace & Faith */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--prism-1)]/15 via-black/40 to-transparent border border-[var(--prism-1)]/40">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Church size={18} className="text-amber-400" />
                    <span>Testimony of Faith & Grace</span>
                  </h3>
                  <p className="mt-2 text-slate-300 text-xs sm:text-sm">
                    First and above all, all glory, praise, and honor belong to God and my Lord and Savior Jesus Christ. In seasons where mental fatigue felt insurmountable, His strength was made perfect in weakness. What the world often labels as a limitation was transformed through His grace into a compassionate architecture built to lift up every tired mind.
                  </p>
                </div>

                {/* Living Dedications & Heartfelt Gratitude */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--prism-1)] flex items-center space-x-2">
                    <Heart size={16} className="text-rose-400" />
                    <span>Living Dedications & Deep Gratitude</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Dchan / Chantal Hadassah */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/30">
                      <span className="font-bold text-rose-300 block text-sm">🌸 Dchan (Chantal Hadassah)</span>
                      <p className="text-slate-300 mt-1">
                        The true namesake and radiant heart behind this sanctuary. Your boundless grace, patience, and purity of spirit breathe life into every single refraction.
                      </p>
                    </div>

                    {/* Mum Phido */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30">
                      <span className="font-bold text-amber-300 block text-sm">🛡️ Mum (Phido)</span>
                      <p className="text-slate-300 mt-1">
                        My steadfast pillar of prayer and sacrifice. Your unwavering faith and unconditional love carried me through the darkest storms.
                      </p>
                    </div>

                    {/* Cucu */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30">
                      <span className="font-bold text-emerald-300 block text-sm">🌿 Cucu (Grandmother)</span>
                      <p className="text-slate-300 mt-1">
                        The generational wellspring of wisdom and prayers. Your deep roots of love and godly counsel anchor everything I build.
                      </p>
                    </div>

                    {/* Aunt Sisy */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-sky-500/30">
                      <span className="font-bold text-sky-300 block text-sm">💛 Aunt Sisy</span>
                      <p className="text-slate-300 mt-1">
                        For your enduring warmth, bright laughter, and relentless encouragement that continuously reminded me to keep pressing forward.
                      </p>
                    </div>

                    {/* Eng. Jimmy */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30">
                      <span className="font-bold text-purple-300 block text-sm">⚙️ Eng. Jimmy</span>
                      <p className="text-slate-300 mt-1">
                        For invaluable mentorship in engineering rigor, systemic thinking, and teaching me how to craft solutions with patience and structural excellence.
                      </p>
                    </div>

                    {/* Dr. Kizzie */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-teal-500/30">
                      <span className="font-bold text-teal-300 block text-sm">🩺 Dr. Kizzie</span>
                      <p className="text-slate-300 mt-1">
                        For profound medical empathy, clinical wisdom, and championing the dignity of neurodivergent healing. Your guidance illuminated the path.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Close */}
              <div className="mt-6 pt-4 border-t border-slate-700/60 flex justify-end">
                <button
                  onClick={() => setAboutOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[var(--prism-1)] to-[var(--prism-3)] text-black hover:opacity-95 transition shadow-lg shadow-[var(--prism-1)]/20"
                >
                  Return to Sanctuary
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
