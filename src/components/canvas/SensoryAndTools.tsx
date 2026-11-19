'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  FastForward,
  Headphones,
  Heart,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Music,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  StickyNote,
  Swords,
  Trash2,
  X,
} from 'lucide-react';
import {
  setSoundscapeVolume,
  startSoundscape,
  stopSoundscape,
  type SoundscapeType,
} from '@/lib/prism-audio';
import { parseSoundtrackEmbedUrl } from '@/lib/neural-identity';
import type { PrismCard } from '@/lib/canvas-parser';

/* -------------------------------------------------------------------------- */
/* 1. Sensory Soundscape Bar + Optional Collapsed "Pin Spotify/YouTube" Box   */
/* -------------------------------------------------------------------------- */
export function SensorySoundscapeBar({
  darkMode,
  showSoundtrackPin,
  showGamma40 = true,
  glassCard,
  subtlePill,
  mutedText,
}: {
  darkMode: boolean;
  showSoundtrackPin: boolean;
  showGamma40?: boolean;
  glassCard: string;
  subtlePill: string;
  mutedText: string;
}) {
  const [active, setActive] = useState<SoundscapeType>('silence');
  const [volume, setVolume] = useState(0.32);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinnedEmbed, setPinnedEmbed] = useState<{ embedUrl: string; provider: 'spotify' | 'youtube' } | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => () => stopSoundscape(), []);

  useEffect(() => {
    if (!showGamma40 && active === 'gamma40') {
      setActive('silence');
      stopSoundscape();
    }
  }, [showGamma40, active]);

  const selectSound = (type: SoundscapeType) => {
    setActive(type);
    if (type === 'silence') stopSoundscape();
    else startSoundscape(type, volume);
  };

  const handleVolume = (val: number) => {
    setVolume(val);
    setSoundscapeVolume(val);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    const parsed = parseSoundtrackEmbedUrl(pinInput);
    if (!parsed) {
      setPinError('Paste a valid public Spotify (open.spotify.com/...) or YouTube link.');
      return;
    }
    setPinnedEmbed(parsed);
  };

  const options: Array<{ id: SoundscapeType; label: string }> = [
    { id: 'silence', label: 'Silence' },
    { id: 'brown', label: 'Brown Noise' },
    { id: 'pink', label: 'Pink Noise' },
    { id: 'rain', label: 'Soft Rain' },
    ...(showGamma40 ? [{ id: 'gamma40' as const, label: '40Hz Pulse' }] : []),
  ];

  return (
    <section
      aria-label="Sensory soundscape bar"
      className={`rounded-3xl border px-4 py-3 backdrop-blur-2xl space-y-3 ${glassCard}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold mr-1 ${mutedText}`}>
            <Headphones size={14} className="text-blue-500" /> Sound:
          </span>
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={active === opt.id}
              onClick={() => selectSound(opt.id)}
              className={`rounded-xl border px-2.5 py-1 text-xs font-bold transition-all ${
                active === opt.id
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : `${subtlePill} hover:border-blue-500/40`
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {active !== 'silence' && (
            <input
              type="range"
              min={0.05}
              max={0.8}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolume(Number(e.target.value))}
              aria-label="Soundscape volume"
              className="w-20 accent-blue-500"
            />
          )}
          {showSoundtrackPin && (
            <button
              type="button"
              onClick={() => setPinOpen((o) => !o)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold ${subtlePill}`}
            >
              <Music size={13} className="text-emerald-500" />
              {pinOpen ? 'Hide Playlist' : 'Pin Spotify / YouTube'}
            </button>
          )}
        </div>
      </div>

      {showSoundtrackPin && pinOpen && (
        <div className="space-y-2.5 pt-2 border-t border-black/10 dark:border-white/10">
          <form onSubmit={handlePinSubmit} className="flex flex-wrap gap-2">
            <input
              type="url"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Paste a Spotify playlist/track or YouTube Lo-Fi link..."
              className={`flex-1 min-w-[200px] rounded-xl border px-3 py-2 text-xs outline-none focus:border-blue-500 ${
                darkMode ? 'border-white/15 bg-slate-950 text-white' : 'border-[#cfc5b2] bg-[#f3efe6] text-slate-900'
              }`}
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
            >
              Pin Player
            </button>
            {pinnedEmbed && (
              <button
                type="button"
                onClick={() => {
                  setPinnedEmbed(null);
                  setPinInput('');
                }}
                className={`rounded-xl border px-3 py-2 text-xs font-bold ${subtlePill}`}
              >
                Clear
              </button>
            )}
          </form>
          {pinError && <p className="text-xs font-semibold text-rose-500">{pinError}</p>}
          {pinnedEmbed && (
            <iframe
              src={pinnedEmbed.embedUrl}
              title="Pinned focus soundtrack"
              width="100%"
              height={pinnedEmbed.provider === 'spotify' ? '152' : '180'}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-2xl border border-black/10 dark:border-white/10"
            />
          )}
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Brain Dump Distraction Catcher (2-second thought parking drawer)        */
/* -------------------------------------------------------------------------- */
interface DumpNote {
  id: string;
  text: string;
  done: boolean;
}

const DUMP_STORAGE_KEY = 'prism_canvas_brain_dump_v1';

export function BrainDumpDrawer({
  darkMode,
  onClose,
}: {
  darkMode: boolean;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState<DumpNote[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DUMP_STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) setNotes(saved);
    } catch {
      // Ignore malformed storage
    }
  }, []);

  const persist = (next: DumpNote[]) => {
    setNotes(next);
    try {
      localStorage.setItem(DUMP_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota errors
    }
  };

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    persist([{ id: String(Date.now()), text: input.trim(), done: false }, ...notes]);
    setInput('');
  };

  const drawerBg = darkMode
    ? 'border-white/10 bg-[#0b1224] text-slate-100'
    : 'border-[#d6ccb9] bg-[#f8f4eb] text-[#1e293b]';
  const muted = darkMode ? 'text-slate-400' : 'text-[#526071]';
  const itemBg = darkMode ? 'border-white/10 bg-white/5' : 'border-[#dcd3c2] bg-[#f1ebe0]';

  return (
    <div className="fixed inset-0 z-[450] flex justify-end bg-black/60 backdrop-blur-sm">
      <motion.aside
        initial={{ x: 360 }}
        animate={{ x: 0 }}
        exit={{ x: 360 }}
        className={`h-full w-full max-w-md overflow-y-auto border-l p-6 space-y-5 ${drawerBg}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black flex items-center gap-2">
              <StickyNote size={18} className="text-amber-500" /> Brain Dump
            </h2>
            <p className={`text-xs ${muted}`}>
              Random thought pop up? Park it here in 2 seconds so you don&apos;t open a new tab and lose flow.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close Brain Dump" className={`rounded-xl border p-2 ${itemBg}`}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={addNote} className="flex gap-2">
          <input
            type="text"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Reply to mentor after this quest..."
            className={`flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 ${
              darkMode ? 'border-white/15 bg-slate-950 text-white' : 'border-[#cfc5b2] bg-[#f3efe6] text-slate-900'
            }`}
          />
          <button
            type="submit"
            aria-label="Park thought"
            className="rounded-xl bg-amber-500 px-3.5 py-2.5 text-slate-950 font-black hover:bg-amber-400"
          >
            <Plus size={18} />
          </button>
        </form>

        <div className="space-y-2">
          {notes.length === 0 ? (
            <p className={`rounded-2xl border border-dashed p-5 text-center text-xs ${muted} ${itemBg}`}>
              Your mind is clear — parked thoughts stay private in your browser until you check them off.
            </p>
          ) : (
            notes.map((n) => (
              <div key={n.id} className={`flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 ${itemBg}`}>
                <button
                  type="button"
                  onClick={() => persist(notes.map((x) => (x.id === n.id ? { ...x, done: !x.done } : x)))}
                  className={`flex-1 text-left text-sm flex items-center gap-2 ${n.done ? 'line-through opacity-55' : ''}`}
                >
                  <CheckCircle2 size={15} className={n.done ? 'text-emerald-500 shrink-0' : 'opacity-40 shrink-0'} />
                  <span className="break-words">{n.text}</span>
                </button>
                <button
                  type="button"
                  onClick={() => persist(notes.filter((x) => x.id !== n.id))}
                  aria-label="Delete thought"
                  className="p-1 opacity-60 hover:text-rose-500 hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. RSVP Speed-Reader (Opt-In 1-Word-at-a-Time Flash Mode)                  */
/* -------------------------------------------------------------------------- */
export function RsvpSpeedReader({
  text,
  darkMode,
  subtlePill,
}: {
  text: string;
  darkMode: boolean;
  subtlePill: string;
}) {
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);

  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [text]);

  useEffect(() => {
    if (!playing || words.length === 0) return;
    const ms = Math.round(60000 / wpm);
    const id = setInterval(() => {
      setIdx((prev) => {
        if (prev >= words.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, ms);
    return () => clearInterval(id);
  }, [playing, wpm, words.length]);

  const word = words[idx] || '';
  const pivot = Math.floor(word.length / 2);

  return (
    <div className={`rounded-3xl border p-6 text-center space-y-5 ${darkMode ? 'border-white/10 bg-black/40' : 'border-[#d6ccb9] bg-[#efe9dc]'}`}>
      <div className="flex items-center justify-between text-xs opacity-70">
        <span className="inline-flex items-center gap-1 font-bold"><FastForward size={13} /> RSVP Focus Stream</span>
        <span className="tabular-nums font-bold">{idx + 1} / {words.length} · {wpm} WPM</span>
      </div>

      <div className="py-8 text-3xl sm:text-5xl font-black tracking-tight select-none">
        <span>{word.slice(0, pivot)}</span>
        <span className="text-blue-500">{word.slice(pivot, pivot + 1)}</span>
        <span>{word.slice(pivot + 1)}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (idx >= words.length - 1) setIdx(0);
            setPlaying((p) => !p);
          }}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-5 py-2 text-xs font-black text-white hover:bg-blue-500"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? 'Pause' : 'Start Stream'}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setIdx(0);
          }}
          className={`inline-flex items-center gap-1 rounded-2xl border px-3 py-2 text-xs font-bold ${subtlePill}`}
        >
          <RotateCcw size={13} /> Restart
        </button>
        <label className="inline-flex items-center gap-2 text-xs font-bold">
          <span>Speed:</span>
          <input
            type="range"
            min={180}
            max={480}
            step={20}
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            className="w-24 accent-blue-500"
          />
        </label>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Voice "Talk It Out" Rubber-Duck Recap Mic                               */
/* -------------------------------------------------------------------------- */
export function VoiceTalkItOut({
  subtlePill,
  onXpEarned,
}: {
  subtlePill: string;
  onXpEarned: (amount: number) => void;
}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [awarded, setAwarded] = useState(false);

  const toggleMic = () => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    };
    const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Rec) {
      setNote('Voice mic is supported in Chrome/Edge — you can still say your summary out loud!');
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    const recognition = new Rec();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    setNote(null);
    setListening(true);

    recognition.onresult = (event) => {
      const spoken = event.results?.[0]?.[0]?.transcript || '';
      if (spoken) {
        setTranscript(spoken);
        if (!awarded) {
          setAwarded(true);
          onXpEarned(10);
        }
      }
    };
    recognition.onerror = () => {
      setListening(false);
      setNote('Could not hear the mic — check microphone permission or try again.');
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <div className={`rounded-2xl border p-3.5 space-y-2 ${subtlePill}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold">Talk It Out (1-sentence verbal recap · +10 XP)</span>
        <button
          type="button"
          onClick={toggleMic}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black text-white transition-all ${
            listening ? 'bg-rose-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {listening ? <MicOff size={13} /> : <Mic size={13} />}
          {listening ? 'Listening...' : 'Speak Recap'}
        </button>
      </div>
      {transcript && (
        <p className="text-xs italic opacity-90">&ldquo;{transcript}&rdquo; {awarded && <span className="font-black text-emerald-500 not-italic">· +10 XP!</span>}</p>
      )}
      {note && <p className="text-[11px] opacity-75">{note}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Optional Stage Clear Boss Fight (3 Hearts + 1-Tap Recall Check)         */
/* -------------------------------------------------------------------------- */
export function StageBossFight({
  cards,
  darkMode,
  subtlePill,
  timedMode = false,
  onVictory,
}: {
  cards: PrismCard[];
  darkMode: boolean;
  subtlePill: string;
  timedMode?: boolean;
  onVictory: (bonusXp: number) => void;
}) {
  const [started, setStarted] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [qIdx, setQIdx] = useState(0);
  const [won, setWon] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [teachBack, setTeachBack] = useState('');
  const [teachBackSaved, setTeachBackSaved] = useState(false);
  const [roundSecs, setRoundSecs] = useState(25);
  const [timerOn, setTimerOn] = useState(timedMode);

  useEffect(() => {
    setTimerOn(timedMode);
  }, [timedMode]);

  useEffect(() => {
    if (!started || won || !timerOn) return;
    const id = setInterval(() => {
      setRoundSecs((prev) => {
        if (prev <= 1) {
          setHearts((h) => {
            const nextH = Math.max(0, h - 1);
            if (nextH === 0) {
              setStarted(false);
              setQIdx(0);
              setFeedback('Time ran out — zero penalty, restart anytime!');
              return 3;
            }
            setFeedback('Clock ticked! -1 heart, fresh 25s on the clock.');
            return nextH;
          });
          return 25;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, won, timerOn]);

  const questions = useMemo(() => {
    const headings = cards.map((c) => c.heading);
    return cards.slice(0, 3).map((card, i) => {
      const sentence = card.text.split(/(?<=[.!?])\s+/)[0] || card.text.slice(0, 120);
      const distractors = headings.filter((h) => h !== card.heading);
      const fallbackDistractors = ['Unrelated Side Quest', 'Random Background Noise'];
      const choices = [
        card.heading,
        distractors[0] || fallbackDistractors[0],
        distractors[1] || fallbackDistractors[1],
      ].sort((a, b) => ((a.length + i) % 3) - ((b.length + i) % 3));
      return {
        prompt: `Which card taught this idea: "${sentence.slice(0, 130)}${sentence.length > 130 ? '...' : ''}"`,
        answer: card.heading,
        choices,
      };
    });
  }, [cards]);

  if (won) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-5 text-center space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Boss Defeated! +50 Bonus XP</p>
        <p className="text-sm font-bold">Your recall is locked in — your brain actually remembers this!</p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className={`rounded-2xl border p-4 space-y-3 text-left ${subtlePill}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <Swords size={14} /> Optional Bonus: Boss Fight or 1-Line Teach-Back
            </p>
            <p className="text-xs opacity-75">Zero grades, zero pressure — just bonus XP to lock it into memory.</p>
          </div>
          {questions.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setRoundSecs(25);
                setFeedback(null);
                setStarted(true);
              }}
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400"
            >
              Start Boss Fight (+50 XP)
            </button>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!teachBack.trim() || teachBackSaved) return;
            setTeachBackSaved(true);
            onVictory(20);
          }}
          className="flex flex-wrap gap-2"
        >
          <input
            type="text"
            value={teachBack}
            onChange={(e) => setTeachBack(e.target.value)}
            disabled={teachBackSaved}
            placeholder="Or teach it back in 1 casual sentence (+20 XP)..."
            className={`flex-1 min-w-[200px] rounded-xl border px-3 py-2 text-xs outline-none focus:border-emerald-500 ${
              darkMode ? 'border-white/15 bg-slate-950 text-white' : 'border-[#cfc5b2] bg-[#f3efe6] text-slate-900'
            }`}
          />
          <button
            type="submit"
            disabled={teachBackSaved}
            className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {teachBackSaved ? 'Locked In! +20 XP' : 'Save 1-Liner'}
          </button>
        </form>
      </div>
    );
  }

  const currentQ = questions[qIdx];

  const pickAnswer = (choice: string) => {
    if (choice === currentQ.answer) {
      setFeedback('Direct hit! Nice recall!');
      setRoundSecs(25);
      if (qIdx >= questions.length - 1) {
        setWon(true);
        onVictory(50);
      } else {
        setQIdx((i) => i + 1);
      }
    } else {
      const nextHearts = Math.max(0, hearts - 1);
      setHearts(nextHearts);
      setFeedback(nextHearts === 0 ? 'No worries — try again anytime, zero penalty!' : 'Close! Try another choice.');
      if (nextHearts === 0) {
        setStarted(false);
        setHearts(3);
        setQIdx(0);
      }
    }
  };

  return (
    <div className={`rounded-2xl border p-5 text-left space-y-4 ${subtlePill}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-black uppercase tracking-wider text-amber-500">
          Boss Fight · Round {qIdx + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTimerOn((t) => !t)}
            className="rounded-lg border border-current/20 px-2 py-0.5 text-[11px] font-bold tabular-nums opacity-85 hover:opacity-100"
          >
            {timerOn ? `${roundSecs}s (Timed)` : 'Untimed'}
          </button>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((h) => (
              <Heart
                key={h}
                size={15}
                className={h < hearts ? 'text-rose-500 fill-rose-500' : 'opacity-25'}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm font-bold leading-relaxed">{currentQ.prompt}</p>
      <div className="grid grid-cols-1 gap-2">
        {currentQ.choices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => pickAnswer(choice)}
            className={`rounded-xl border px-4 py-2.5 text-left text-xs font-bold transition-all hover:border-blue-500 ${
              darkMode ? 'border-white/15 bg-slate-900' : 'border-[#cfc5b2] bg-[#faf7f0]'
            }`}
          >
            {choice}
          </button>
        ))}
      </div>
      {feedback && <p className="text-xs font-semibold text-blue-500">{feedback}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. Prism Lens Popup (Tap Any Word -> Ask DJ / Google Definition)           */
/* -------------------------------------------------------------------------- */
export function PrismLensPopup({
  word,
  cardContext,
  darkMode,
  onClose,
}: {
  word: string;
  cardContext: string;
  darkMode: boolean;
  onClose: () => void;
}) {
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  useEffect(() => {
    setAnswer(null);
    setAsking(false);
  }, [word]);

  const askDj = async () => {
    setAsking(true);
    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          context: cardContext,
          question: `In 2 short, super simple ADHD-friendly sentences, what does "${word}" mean in this reading?`,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.answer) {
        setAnswer(data.answer);
      } else {
        setAnswer(`"${word}" is a key term in this card. Re-read the sentence around it or tap Google definition below for an instant lookup!`);
      }
    } catch {
      setAnswer(`"${word}" is a key term here — tap Google definition below if you want a quick dictionary view without losing your card.`);
    } finally {
      setAsking(false);
    }
  };

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      aria-label="Prism Lens word help"
      className={`fixed bottom-5 left-4 right-4 sm:left-6 sm:right-auto sm:w-[370px] z-[380] rounded-3xl border-2 border-blue-500/40 p-5 shadow-2xl backdrop-blur-2xl ${
        darkMode ? 'bg-[#0f172a]/95 text-slate-100' : 'bg-[#faf7f0]/95 text-[#1e293b]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 flex items-center gap-1">
            <Sparkles size={11} /> Prism Lens
          </p>
          <p className="mt-1 text-lg font-black break-words">&ldquo;{word}&rdquo;</p>
          <p className="text-xs opacity-70">Understand this word without leaving your quest.</p>
        </div>
        <button onClick={onClose} aria-label="Close Prism Lens" className="rounded-xl p-1.5 opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      </div>

      {answer && (
        <div className={`mt-3 rounded-2xl border p-3 text-xs leading-relaxed ${darkMode ? 'border-white/10 bg-white/5' : 'border-[#d6ccb9] bg-[#f1ece1]'}`}>
          {answer}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void askDj()}
          disabled={asking}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-black text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {asking ? <Loader2 size={13} className="animate-spin" /> : <MessageCircle size={13} />}
          {asking ? 'Asking DJ...' : 'Ask DJ'}
        </button>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(`${word} simple definition`)}`}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold ${
            darkMode ? 'border-white/15 bg-white/5 text-slate-100' : 'border-[#d6ccb9] bg-[#f1ece1] text-slate-900'
          }`}
        >
          <Search size={13} /> Google
        </a>
      </div>
    </motion.aside>
  );
}
