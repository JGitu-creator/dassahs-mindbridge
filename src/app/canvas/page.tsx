'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Compass,
  Eye,
  Flame,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  Moon,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Wand2,
  X,
} from 'lucide-react';
import { BionicText } from '@/components/prism/BionicText';
import { ProgressPrism } from '@/components/prism/ProgressPrism';
import { ReadAloud } from '@/components/prism/ReadAloud';
import { NeuralMicroBreak } from '@/components/prism/NeuralMicroBreak';
import {
  DEMO_QUESTS,
  createInstantLocalPrism,
  splitIntoPrismCards,
  type CanvasTopic,
  type PrismCard,
  type PrismCardRefraction,
} from '@/lib/canvas-parser';

type TextSize = 'small' | 'comfortable' | 'big';

const TEXT_SIZE_STYLES: Record<TextSize, string> = {
  small: 'text-base sm:text-[17px] leading-[1.7]',
  comfortable: 'text-lg sm:text-[21px] leading-[1.8]',
  big: 'text-2xl sm:text-[26px] leading-[1.9]',
};

const CANVAS_TOKEN_KEY = 'prism_canvas_token';
const CANVAS_URL_KEY = 'prism_canvas_course_url';
const CANVAS_HANDOFF_KEY = 'prism_canvas_handoff';
const TEXT_SIZE_KEY = 'prism_canvas_text_size';
const DYSLEXIA_KEY = 'prism_canvas_dyslexia';
const BIONIC_KEY = 'prism_canvas_bionic';
const THEME_KEY = 'prism_canvas_theme';

export default function CanvasPrismPlayPage() {
  // Theme & Reading Comfort
  const [darkMode, setDarkMode] = useState(true);
  const [textSize, setTextSize] = useState<TextSize>('comfortable');
  const [bionicOn, setBionicOn] = useState(false);
  const [dyslexiaFriendly, setDyslexiaFriendly] = useState(true);
  const [localOnlyMode, setLocalOnlyMode] = useState(false);

  // Topics & Cards (100% browser-private)
  const [topics, setTopics] = useState<CanvasTopic[]>(DEMO_QUESTS);
  const [activeTopicIdx, setActiveTopicIdx] = useState(0);
  const [cards, setCards] = useState<PrismCard[]>(DEMO_QUESTS[0].cards || []);
  const [cardIdx, setCardIdx] = useState(0);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  // Per-card Prism Refractions
  const [refractions, setRefractions] = useState<Record<string, PrismCardRefraction>>({});
  const [showPrismForCard, setShowPrismForCard] = useState<Record<string, boolean>>({});
  const [refracting, setRefracting] = useState(false);
  const [refractNotice, setRefractNotice] = useState<string | null>(null);

  // Game Loop State
  const [winsToday, setWinsToday] = useState(0);
  const [xp, setXp] = useState(0);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [showStageClear, setShowStageClear] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [breakLevel, setBreakLevel] = useState(1);
  const [winBurst, setWinBurst] = useState(false);
  const [starredContents, setStarredContents] = useState<string[]>([]);

  // Modals & Drawers
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectTab, setConnectTab] = useState<'canvas' | 'paste'>('canvas');
  const [showQuestDrawer, setShowQuestDrawer] = useState(false);

  // Private Canvas Connection (sessionStorage only)
  const [courseUrl, setCourseUrl] = useState('https://moringa.instructure.com/courses/1713/modules');
  const [canvasToken, setCanvasToken] = useState('');
  const [isCanvasConnected, setIsCanvasConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Paste-a-reading form
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteText, setPasteText] = useState('');

  // Load saved reading preferences + extension handoff + session token
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedSize = localStorage.getItem(TEXT_SIZE_KEY) as TextSize | null;
    if (savedSize && ['small', 'comfortable', 'big'].includes(savedSize)) setTextSize(savedSize);
    const savedDyslexia = localStorage.getItem(DYSLEXIA_KEY);
    if (savedDyslexia !== null) setDyslexiaFriendly(savedDyslexia === 'true');
    const savedBionic = localStorage.getItem(BIONIC_KEY);
    if (savedBionic !== null) setBionicOn(savedBionic === 'true');
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) setDarkMode(savedTheme === 'dark');

    try {
      const vault = JSON.parse(localStorage.getItem('prism_starred_items') || '[]');
      if (Array.isArray(vault)) {
        setStarredContents(vault.map((v: { content?: string }) => v.content || ''));
      }
    } catch {
      // Ignore malformed vault
    }

    const savedUrl = sessionStorage.getItem(CANVAS_URL_KEY);
    const savedToken = sessionStorage.getItem(CANVAS_TOKEN_KEY);
    if (savedUrl) setCourseUrl(savedUrl);
    if (savedToken) setCanvasToken(savedToken);

    // Check if the upgraded Chrome Extension handed off a Canvas page
    const loadHandoff = () => {
      const raw = sessionStorage.getItem(CANVAS_HANDOFF_KEY);
      if (!raw) return;
      sessionStorage.removeItem(CANVAS_HANDOFF_KEY);
      try {
        const payload = JSON.parse(raw) as { title?: string; text?: string };
        if (payload?.text?.trim()) {
          const handoffCards = splitIntoPrismCards(payload.title || 'Canvas Reading', payload.text, false);
          const customTopic: CanvasTopic = {
            id: `ext-${Date.now()}`,
            title: payload.title || 'Captured Canvas Reading',
            moduleName: 'Captured via Chrome Extension',
            type: 'Custom',
            cards: handoffCards,
          };
          setTopics((prev) => [customTopic, ...prev]);
          setActiveTopicIdx(0);
          setCards(handoffCards);
          setCardIdx(0);
          setShowStageClear(false);
        }
      } catch {
        // Ignore invalid handoff payload
      }
    };
    loadHandoff();
    window.addEventListener('prism:canvas-handoff', loadHandoff);
    return () => window.removeEventListener('prism:canvas-handoff', loadHandoff);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TEXT_SIZE_KEY, textSize);
    localStorage.setItem(DYSLEXIA_KEY, String(dyslexiaFriendly));
    localStorage.setItem(BIONIC_KEY, String(bionicOn));
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [textSize, dyslexiaFriendly, bionicOn, darkMode]);

  const activeTopic = topics[activeTopicIdx] || DEMO_QUESTS[0];
  const currentCard = cards[cardIdx] || cards[0];
  const currentCardKey = currentCard ? `${activeTopic.id}:${currentCard.id}` : '';
  const currentRefraction = currentCardKey ? refractions[currentCardKey] : undefined;
  const isPrismVisible = currentCardKey ? Boolean(showPrismForCard[currentCardKey]) : false;

  const nextTopic = useMemo(() => {
    if (activeTopicIdx + 1 < topics.length) return topics[activeTopicIdx + 1];
    return null;
  }, [activeTopicIdx, topics]);

  const loadTopicByIndex = async (idx: number, topicList: CanvasTopic[] = topics, tokenOverride?: string, urlOverride?: string) => {
    const target = topicList[idx];
    if (!target) return;
    setActiveTopicIdx(idx);
    setCardIdx(0);
    setShowStageClear(false);
    setTopicError(null);
    setRefractNotice(null);

    if (target.cards && target.cards.length > 0) {
      setCards(target.cards);
      return;
    }

    const tokenToUse = tokenOverride ?? canvasToken;
    const urlToUse = urlOverride ?? courseUrl;
    if (!tokenToUse) {
      setTopicError('Reconnect your Canvas token to open this topic.');
      return;
    }

    setLoadingTopic(true);
    try {
      const res = await fetch('/api/canvas/page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-canvas-token': tokenToUse,
        },
        body: JSON.stringify({
          courseUrl: urlToUse,
          itemType: target.type,
          pageUrl: target.pageUrl,
          contentId: target.contentId,
          title: target.title,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not open this topic.');
      const loadedCards: PrismCard[] = Array.isArray(data.cards) && data.cards.length > 0
        ? data.cards
        : [{ id: 'card-1', heading: target.title, text: 'No readable text found on this Canvas page.', wordCount: 8 }];
      setCards(loadedCards);
      setTopics((prev) => prev.map((t, i) => (i === idx ? { ...t, cards: loadedCards } : t)));
    } catch (err: unknown) {
      setTopicError(err instanceof Error ? err.message : 'Could not load this Canvas topic.');
    } finally {
      setLoadingTopic(false);
    }
  };

  const handleConnectCanvas = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectError(null);
    setConnecting(true);
    try {
      const res = await fetch('/api/canvas/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-canvas-token': canvasToken.trim(),
        },
        body: JSON.stringify({ courseUrl: courseUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not connect to Canvas.');
      const fetchedTopics: CanvasTopic[] = Array.isArray(data.topics) ? data.topics : [];
      if (fetchedTopics.length === 0) {
        throw new Error('Connected to Canvas, but no readable pages were found in this course yet.');
      }

      sessionStorage.setItem(CANVAS_TOKEN_KEY, canvasToken.trim());
      sessionStorage.setItem(CANVAS_URL_KEY, courseUrl.trim());
      setIsCanvasConnected(true);
      setTopics(fetchedTopics);
      setShowConnectModal(false);
      await loadTopicByIndex(0, fetchedTopics, canvasToken.trim(), courseUrl.trim());
    } catch (err: unknown) {
      setConnectError(err instanceof Error ? err.message : 'Could not connect to Canvas.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectCanvas = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CANVAS_TOKEN_KEY);
    }
    setCanvasToken('');
    setIsCanvasConnected(false);
    setTopics(DEMO_QUESTS);
    setActiveTopicIdx(0);
    setCards(DEMO_QUESTS[0].cards || []);
    setCardIdx(0);
    setShowStageClear(false);
  };

  const handleLoadPastedReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;
    const title = pasteTitle.trim() || 'My Pasted Reading';
    const newCards = splitIntoPrismCards(title, pasteText, false);
    const customTopic: CanvasTopic = {
      id: `paste-${Date.now()}`,
      title,
      moduleName: 'Private Browser Reading',
      type: 'Custom',
      cards: newCards,
    };
    const nextList = [customTopic, ...topics];
    setTopics(nextList);
    setActiveTopicIdx(0);
    setCards(newCards);
    setCardIdx(0);
    setShowStageClear(false);
    setPasteTitle('');
    setPasteText('');
    setShowConnectModal(false);
  };

  const handleRefractCard = async () => {
    if (!currentCard || !currentCardKey) return;

    // If already refracted, just toggle visibility
    if (currentRefraction) {
      setShowPrismForCard((prev) => ({ ...prev, [currentCardKey]: !prev[currentCardKey] }));
      return;
    }

    setRefracting(true);
    setRefractNotice(null);

    if (localOnlyMode) {
      const local = createInstantLocalPrism(currentCard.text, currentCard.heading);
      setRefractions((prev) => ({ ...prev, [currentCardKey]: local }));
      setShowPrismForCard((prev) => ({ ...prev, [currentCardKey]: true }));
      setRefracting(false);
      return;
    }

    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${currentCard.heading}\n\n${currentCard.text}`,
          missionGoal: 'Turn this short study card into a tiny plain-language idea, a memorable metaphor, a dopamine boost, and one tiny next move.',
          simplicityLevel: 'concise',
          cognitiveMode: 'adhd',
          isScenic: true,
        }),
      });

      const payload = await res.json().catch(() => null);

      // Never lock out the learner on quota/trial/provider limits — seamlessly use Instant Local Prism!
      if (!res.ok || !payload?.chunks?.[0]) {
        const local = createInstantLocalPrism(currentCard.text, currentCard.heading);
        setRefractions((prev) => ({ ...prev, [currentCardKey]: local }));
        setShowPrismForCard((prev) => ({ ...prev, [currentCardKey]: true }));
        setRefractNotice('Using Instant Local Prism (unlimited, zero token limit).');
        return;
      }

      const firstChunk = payload.chunks[0];
      const fallback = createInstantLocalPrism(currentCard.text, currentCard.heading);
      const refracted: PrismCardRefraction = {
        tinyIdea: payload.tldr?.[0] || firstChunk.summary || fallback.tinyIdea,
        metaphor: firstChunk.metaphor || fallback.metaphor,
        dopamineBoost: firstChunk.dopamineHook || fallback.dopamineBoost,
        oneSmallMove: payload.actions?.[0]?.task || fallback.oneSmallMove,
        keyTerms: Array.isArray(firstChunk.keyTerms) && firstChunk.keyTerms.length > 0 ? firstChunk.keyTerms : fallback.keyTerms,
        source: payload.usage?.provider === 'local' || payload.mode === 'local' ? 'local' : 'ai',
      };

      setRefractions((prev) => ({ ...prev, [currentCardKey]: refracted }));
      setShowPrismForCard((prev) => ({ ...prev, [currentCardKey]: true }));
    } catch {
      const local = createInstantLocalPrism(currentCard.text, currentCard.heading);
      setRefractions((prev) => ({ ...prev, [currentCardKey]: local }));
      setShowPrismForCard((prev) => ({ ...prev, [currentCardKey]: true }));
      setRefractNotice('Using Instant Local Prism (unlimited, works offline too).');
    } finally {
      setRefracting(false);
    }
  };

  const handleStarToVault = (content: string, type: 'metaphor' | 'hook') => {
    if (!content) return;
    try {
      const existing = JSON.parse(localStorage.getItem('prism_starred_items') || '[]');
      const list = Array.isArray(existing) ? existing : [];
      const exists = list.some((i: { content: string }) => i.content === content);
      const updated = exists
        ? list.filter((i: { content: string }) => i.content !== content)
        : [{ heading: type === 'metaphor' ? 'The Metaphor' : 'Dopamine Boost', content, type }, ...list];
      localStorage.setItem('prism_starred_items', JSON.stringify(updated));
      setStarredContents(updated.map((i: { content: string }) => i.content));
    } catch {
      // Ignore storage errors
    }
  };

  const handleClaimWin = () => {
    const nextWins = winsToday + 1;
    setWinsToday(nextWins);
    setXp((prev) => prev + 25);
    setWinBurst(true);
    setTimeout(() => setWinBurst(false), 750);

    const isLastCard = cardIdx >= cards.length - 1;
    if (isLastCard) {
      if (!completedTopics.includes(activeTopic.id)) {
        setCompletedTopics((prev) => [...prev, activeTopic.id]);
      }
      setShowStageClear(true);
      return;
    }

    // Gentle micro-break every 3 card wins
    if (nextWins % 3 === 0) {
      setBreakLevel(Math.floor(nextWins / 3));
      setShowBreak(true);
    }

    setCardIdx((prev) => prev + 1);
    setRefractNotice(null);
  };

  const surfaceBg = darkMode
    ? 'bg-slate-950 text-slate-100'
    : 'bg-slate-50 text-slate-900';

  const glassCard = darkMode
    ? 'bg-slate-900/75 border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.45)]'
    : 'bg-white/90 border-slate-200/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)]';

  const mutedText = darkMode ? 'text-slate-400' : 'text-slate-600';
  const subtlePill = darkMode
    ? 'bg-white/5 border-white/10 text-slate-200'
    : 'bg-slate-100 border-slate-200 text-slate-800';

  return (
    <div className={`min-h-screen transition-colors duration-500 ${surfaceBg}`}>
      {/* Soft ambient background glow (no purple-on-dark cliché) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={`absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-3xl ${darkMode ? 'bg-blue-600/15' : 'bg-blue-400/15'}`} />
        <div className={`absolute bottom-0 right-1/4 h-96 w-96 rounded-full blur-3xl ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-400/15'}`} />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Calm Header — ZERO intimidating totals or countdowns */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition-colors ${subtlePill} hover:border-blue-500/50`}
            >
              <ArrowLeft size={14} /> Prism Home
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white">
                  <Sparkles size={11} /> Prism Play
                </span>
                <span className={`text-xs font-semibold ${mutedText}`}>Canvas Quest</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-bold ${subtlePill}`}>
              <Flame size={14} className="text-amber-500" />
              <span>{winsToday} {winsToday === 1 ? 'win' : 'wins'}</span>
              <span className="opacity-40">·</span>
              <span className="text-emerald-500">{xp} XP</span>
            </div>

            <button
              onClick={() => setShowQuestDrawer(true)}
              className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold transition-colors ${subtlePill} hover:border-blue-500/50`}
            >
              <Compass size={14} className="text-blue-500" /> Switch Quest
            </button>

            <button
              onClick={() => setShowConnectModal(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-500 active:scale-95"
            >
              <KeyRound size={13} /> {isCanvasConnected ? 'Canvas Connected' : 'Connect Canvas'}
            </button>

            <button
              onClick={() => setDarkMode((d) => !d)}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`rounded-2xl border p-2 transition-colors ${subtlePill}`}
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* Privacy & Unlimited Assurance Bar */}
        <div className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-2.5 text-xs ${subtlePill}`}>
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-emerald-500 shrink-0" />
            <span>
              <strong>Private to your browser:</strong> Your Canvas token and notes stay on your device — nobody else can see them.
            </span>
          </div>
          <button
            onClick={() => setLocalOnlyMode((m) => !m)}
            className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition-colors ${
              localOnlyMode
                ? 'bg-emerald-600 text-white'
                : darkMode ? 'bg-white/10 text-slate-200 hover:bg-white/15' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
            }`}
            title="Switch between AI + Unlimited Local Fallback or Instant Local-Only mode"
          >
            {localOnlyMode ? 'Unlimited Local Prism: ON' : 'Unlimited Fallback: Ready'}
          </button>
        </div>

        {/* Working Reading Comfort Controls */}
        <section
          aria-label="Reading comfort controls"
          className={`flex flex-wrap items-center justify-between gap-3 rounded-3xl border p-3 sm:p-4 backdrop-blur-2xl ${glassCard}`}
        >
          {/* Prominent Small / Comfortable / Big */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${mutedText}`}>Text size:</span>
            <div
              className={`inline-flex rounded-2xl border p-1 ${darkMode ? 'border-white/10 bg-slate-950/60' : 'border-slate-200 bg-slate-100'}`}
              role="group"
              aria-label="Text size"
            >
              {(['small', 'comfortable', 'big'] as TextSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  aria-pressed={textSize === size}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                    textSize === size
                      ? 'bg-blue-600 text-white shadow-sm'
                      : `${mutedText} hover:text-blue-500`
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setBionicOn((b) => !b)}
              aria-pressed={bionicOn}
              className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold transition-all ${
                bionicOn
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : `${subtlePill} hover:border-blue-500/40`
              }`}
            >
              <Eye size={13} /> Bionic {bionicOn ? 'On' : 'Off'}
            </button>

            <button
              onClick={() => setDyslexiaFriendly((d) => !d)}
              aria-pressed={dyslexiaFriendly}
              className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold transition-all ${
                dyslexiaFriendly
                  ? 'border-emerald-500 bg-emerald-600 text-white'
                  : `${subtlePill} hover:border-emerald-500/40`
              }`}
            >
              <BookOpen size={13} /> Easy-Read Font
            </button>

            {currentCard && (
              <ReadAloud text={`${currentCard.heading}. ${currentCard.text}`} />
            )}
          </div>
        </section>

        {/* Main Quest Card Surface */}
        <main>
          {loadingTopic ? (
            <div className={`rounded-[2rem] border p-12 text-center backdrop-blur-2xl ${glassCard} space-y-4`}>
              <Loader2 size={32} className="mx-auto animate-spin text-blue-500" />
              <p className="text-lg font-bold">Opening your next tiny quest...</p>
              <p className={`text-sm ${mutedText}`}>Splitting the Canvas page into calm, bite-sized cards.</p>
            </div>
          ) : topicError ? (
            <div className={`rounded-[2rem] border p-8 text-center backdrop-blur-2xl ${glassCard} space-y-4`}>
              <p className="text-base font-bold text-rose-500">{topicError}</p>
              <button
                onClick={() => setShowConnectModal(true)}
                className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500"
              >
                Open Canvas Connection
              </button>
            </div>
          ) : showStageClear ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-[2.25rem] border p-8 sm:p-10 text-center backdrop-blur-2xl ${glassCard} space-y-6`}
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
                <Trophy size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-500">Stage Clear!</p>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{activeTopic.title}</h1>
                <p className={`mx-auto max-w-md text-sm sm:text-base ${mutedText}`}>
                  You finished every card in this quest without opening a single scary dashboard. Your brain earned a real win!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {nextTopic ? (
                  <button
                    onClick={() => void loadTopicByIndex(activeTopicIdx + 1)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-sm font-black text-white shadow-xl transition-all hover:bg-blue-500 active:scale-95"
                  >
                    Play Next Topic: {nextTopic.title.slice(0, 34)}{nextTopic.title.length > 34 ? '…' : ''} <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowQuestDrawer(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-sm font-black text-white shadow-xl transition-all hover:bg-blue-500"
                  >
                    Pick Another Quest <Compass size={16} />
                  </button>
                )}

                <button
                  onClick={() => {
                    setBreakLevel((b) => b + 1);
                    setShowBreak(true);
                  }}
                  className={`rounded-2xl border px-5 py-4 text-sm font-bold transition-colors ${subtlePill}`}
                >
                  Take a 20s Brain Break
                </button>
              </div>
            </motion.div>
          ) : currentCard ? (
            <AnimatePresence mode="wait">
              <motion.article
                key={currentCardKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className={`relative overflow-hidden rounded-[2.25rem] border p-6 sm:p-9 backdrop-blur-2xl ${glassCard} space-y-6`}
              >
                {/* Win Burst Feedback */}
                {winBurst && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute right-6 top-6 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-black text-white shadow-lg"
                  >
                    +25 XP · Nice!
                  </motion.div>
                )}

                {/* Calm Quest Meta — ONLY Today's Quest + Card X of Y */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">
                      Today&apos;s Tiny Quest · {activeTopic.title}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${subtlePill}`}>
                      Card {cardIdx + 1} of {cards.length}
                    </span>
                  </div>

                  <ProgressPrism progress={(cardIdx + 1) / Math.max(1, cards.length)} />

                  <h1 className="pt-1 text-xl sm:text-2xl font-black tracking-tight">
                    {currentCard.heading}
                  </h1>
                </div>

                {/* Readable Card Body */}
                <div
                  className={`rounded-3xl border p-5 sm:p-7 transition-all ${
                    darkMode ? 'border-white/10 bg-slate-950/55' : 'border-slate-200 bg-slate-50/90'
                  } ${TEXT_SIZE_STYLES[textSize]} ${
                    dyslexiaFriendly ? 'tracking-[0.03em] [word-spacing:0.12em]' : ''
                  }`}
                  style={{
                    fontFamily: dyslexiaFriendly ? 'var(--font-reading), Lexend, sans-serif' : 'var(--font-sans), Inter, sans-serif',
                  }}
                >
                  {currentCard.text.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className={pIdx > 0 ? 'mt-4' : ''}>
                      {bionicOn ? <BionicText text={paragraph} /> : paragraph}
                    </p>
                  ))}
                </div>

                {/* Refract with Prism Trigger */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => void handleRefractCard()}
                    disabled={refracting}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
                  >
                    {refracting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Refracting this card...
                      </>
                    ) : isPrismVisible ? (
                      <>
                        <Wand2 size={16} /> Hide Prism Lenses
                      </>
                    ) : (
                      <>
                        <Wand2 size={16} /> Refract with Prism
                      </>
                    )}
                  </button>

                  {refractNotice && (
                    <span className={`text-xs font-medium ${mutedText}`}>{refractNotice}</span>
                  )}
                </div>

                {/* Refracted Prism Cards: The Tiny Idea + The Metaphor + Dopamine Boost + One Small Move */}
                <AnimatePresence>
                  {isPrismVisible && currentRefraction && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden pt-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">
                          Prism View ({currentRefraction.source === 'ai' ? 'AI Prism' : 'Instant Local Prism · Unlimited'})
                        </span>
                        {currentRefraction.keyTerms.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {currentRefraction.keyTerms.map((term) => (
                              <span
                                key={term}
                                className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold ${subtlePill}`}
                              >
                                {term}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* The Tiny Idea */}
                      <div className={`rounded-2xl border p-4 sm:p-5 ${darkMode ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-200 bg-blue-50'}`}>
                        <div className="mb-1.5 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-500">
                          <Sparkles size={14} /> The Tiny Idea
                        </div>
                        <p className="text-base font-bold leading-relaxed">{currentRefraction.tinyIdea}</p>
                      </div>

                      {/* Metaphor & Dopamine Boost */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`rounded-2xl border p-4 sm:p-5 space-y-2 ${darkMode ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-cyan-200 bg-cyan-50'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-500">
                              <Brain size={14} /> The Metaphor
                            </div>
                            <button
                              onClick={() => handleStarToVault(currentRefraction.metaphor, 'metaphor')}
                              aria-label="Save metaphor to Dopamine Vault"
                              className={`rounded-xl p-1.5 transition-colors ${
                                starredContents.includes(currentRefraction.metaphor)
                                  ? 'bg-amber-500 text-slate-950'
                                  : subtlePill
                              }`}
                            >
                              <Star size={14} fill={starredContents.includes(currentRefraction.metaphor) ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                          <p className="text-sm sm:text-base font-semibold leading-relaxed italic">
                            &ldquo;{currentRefraction.metaphor}&rdquo;
                          </p>
                        </div>

                        <div className={`rounded-2xl border p-4 sm:p-5 space-y-2 ${darkMode ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-200 bg-amber-50'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-500">
                              <Rocket size={14} /> Dopamine Boost
                            </div>
                            <button
                              onClick={() => handleStarToVault(currentRefraction.dopamineBoost, 'hook')}
                              aria-label="Save dopamine boost to Dopamine Vault"
                              className={`rounded-xl p-1.5 transition-colors ${
                                starredContents.includes(currentRefraction.dopamineBoost)
                                  ? 'bg-amber-500 text-slate-950'
                                  : subtlePill
                              }`}
                            >
                              <Star size={14} fill={starredContents.includes(currentRefraction.dopamineBoost) ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                          <p className="text-sm sm:text-base font-semibold leading-relaxed italic">
                            &ldquo;{currentRefraction.dopamineBoost}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* One Small Move */}
                      <div className={`rounded-2xl border p-4 ${darkMode ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50'}`}>
                        <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-500">
                          <CheckCircle2 size={14} /> One Small Move
                        </div>
                        <p className="text-sm font-medium leading-relaxed">{currentRefraction.oneSmallMove}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Gentle Game Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setCardIdx((i) => Math.max(0, i - 1))}
                    disabled={cardIdx === 0}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-bold transition-all disabled:opacity-35 ${subtlePill}`}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>

                  <button
                    onClick={handleClaimWin}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-xl transition-all hover:bg-emerald-500 active:scale-95"
                  >
                    <Trophy size={16} />
                    {cardIdx === cards.length - 1 ? 'Claim Stage Win!' : 'Claim Win & Next Card'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.article>
            </AnimatePresence>
          ) : null}
        </main>
      </div>

      {/* Cozy Micro-Break Modal */}
      <AnimatePresence>
        {showBreak && (
          <NeuralMicroBreak
            level={breakLevel}
            onComplete={() => setShowBreak(false)}
          />
        )}
      </AnimatePresence>

      {/* Switch Quest Drawer (Optional — stays hidden so course mountain never scares you) */}
      <AnimatePresence>
        {showQuestDrawer && (
          <div className="fixed inset-0 z-[400] flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.aside
              initial={{ x: 360 }}
              animate={{ x: 0 }}
              exit={{ x: 360 }}
              className={`h-full w-full max-w-md overflow-y-auto border-l p-6 space-y-5 ${
                darkMode ? 'border-white/10 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black flex items-center gap-2">
                    <Layers size={18} className="text-blue-500" /> Choose a Quest
                  </h2>
                  <p className={`text-xs ${mutedText}`}>Pick just one topic that feels doable right now.</p>
                </div>
                <button
                  onClick={() => setShowQuestDrawer(false)}
                  aria-label="Close quest drawer"
                  className={`rounded-xl p-2 ${subtlePill}`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5">
                {topics.map((topic, idx) => {
                  const isActive = idx === activeTopicIdx;
                  const isDone = completedTopics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setShowQuestDrawer(false);
                        void loadTopicByIndex(idx);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-600/15'
                          : darkMode
                            ? 'border-white/10 bg-white/5 hover:border-blue-500/40'
                            : 'border-slate-200 bg-slate-50 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-bold ${mutedText}`}>{topic.moduleName}</span>
                        {isDone && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-500">
                            <CheckCircle2 size={11} /> Cleared
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-bold">{topic.title}</p>
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Connect Canvas or Paste Reading Modal */}
      <AnimatePresence>
        {showConnectModal && (
          <div className="fixed inset-0 z-[450] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-[2rem] border p-6 sm:p-8 space-y-5 ${
                darkMode ? 'border-white/15 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">Bring Your Canvas Notes Here</h2>
                <button
                  onClick={() => setShowConnectModal(false)}
                  aria-label="Close connect dialog"
                  className={`rounded-xl p-2 ${subtlePill}`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 p-1">
                <button
                  onClick={() => setConnectTab('canvas')}
                  className={`rounded-xl py-2 text-xs font-bold transition-colors ${
                    connectTab === 'canvas' ? 'bg-blue-600 text-white' : mutedText
                  }`}
                >
                  Canvas Auto-Sync
                </button>
                <button
                  onClick={() => setConnectTab('paste')}
                  className={`rounded-xl py-2 text-xs font-bold transition-colors ${
                    connectTab === 'paste' ? 'bg-blue-600 text-white' : mutedText
                  }`}
                >
                  Paste a Reading (No Token)
                </button>
              </div>

              {connectTab === 'canvas' ? (
                <form onSubmit={handleConnectCanvas} className="space-y-4">
                  <div className={`rounded-2xl border p-3.5 text-xs space-y-1 ${subtlePill}`}>
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-500" /> 100% Private to You
                    </p>
                    <p className={mutedText}>
                      In Canvas, open <strong>Account → Settings → Approved Integrations → + New Access Token</strong>. Your token stays only in this browser tab and clears when you close it.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold" htmlFor="canvas-course-url">Canvas Course Link</label>
                    <input
                      id="canvas-course-url"
                      type="url"
                      required
                      value={courseUrl}
                      onChange={(e) => setCourseUrl(e.target.value)}
                      placeholder="https://moringa.instructure.com/courses/1713/modules"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 ${
                        darkMode ? 'border-white/15 bg-slate-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold" htmlFor="canvas-access-token">Personal Access Token</label>
                    <input
                      id="canvas-access-token"
                      type="password"
                      required
                      value={canvasToken}
                      onChange={(e) => setCanvasToken(e.target.value)}
                      placeholder="Paste your Canvas access token"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 ${
                        darkMode ? 'border-white/15 bg-slate-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                      }`}
                    />
                  </div>

                  {connectError && (
                    <p className="rounded-xl bg-rose-500/15 px-3.5 py-2.5 text-xs font-semibold text-rose-400">
                      {connectError}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {isCanvasConnected && (
                      <button
                        type="button"
                        onClick={handleDisconnectCanvas}
                        className="rounded-xl border border-rose-500/40 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10"
                      >
                        Disconnect &amp; Clear Token
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={connecting}
                      className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                      {connecting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      {connecting ? 'Loading Quests...' : 'Load My Canvas Quests'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLoadPastedReading} className="space-y-4">
                  <p className={`text-xs ${mutedText}`}>
                    If your school disabled access tokens, paste any Canvas lesson here (or click the upgraded Dassah&apos;s Prism Chrome Extension on any Canvas page).
                  </p>
                  <input
                    type="text"
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    placeholder="Topic name (optional)"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 ${
                      darkMode ? 'border-white/15 bg-slate-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                    }`}
                  />
                  <textarea
                    required
                    rows={6}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste your Canvas notes here — Prism Play will split them into calm cards automatically..."
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 ${
                      darkMode ? 'border-white/15 bg-slate-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                    }`}
                  />
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-500"
                  >
                    Turn Into Calm Prism Cards
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
