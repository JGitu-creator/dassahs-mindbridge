'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Check,
  Crown,
  Headphones,
  BookOpen,
  Flame,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  NEURAL_PRESETS,
  POLARIZING_SUPERPOWERS,
  analyzeBrainCheckIn,
  buildProfileFromCheckIn,
  type CheckInEnergy,
  type CheckInEyes,
  type CheckInMotivation,
  type NeuralPresetId,
  type NeuralProfile,
  type PolarizingToolId,
  type PreferredReadSpeed,
} from '@/lib/neural-identity';

interface CheckInProps {
  darkMode: boolean;
  onComplete: (result: ReturnType<typeof buildProfileFromCheckIn>) => void;
  onSkip: () => void;
}

const CHECKIN_GROUPS: Array<{
  title: string;
  subtitle: string;
  ids: PolarizingToolId[];
}> = [
  {
    title: 'Sensory & Atmosphere',
    subtitle: 'Sound and gentle visual movement',
    ids: ['E', 'F'],
  },
  {
    title: 'Reading & Verbal Flow',
    subtitle: 'Voice pace, focal streaming, and talking it out',
    ids: ['A', 'D', 'H'],
  },
  {
    title: 'Pacing & Game Motivation',
    subtitle: 'Urgency sprints, boss quizzes, and streak style',
    ids: ['B', 'C', 'G'],
  },
];

export function QuickBrainCheckIn({ darkMode, onComplete, onSkip }: CheckInProps) {
  const [energy, setEnergy] = useState<CheckInEnergy>('noise');
  const [eyes, setEyes] = useState<CheckInEyes>('bionic');
  const [motivation, setMotivation] = useState<CheckInMotivation>('playful');
  const [customOverrides, setCustomOverrides] = useState<PolarizingToolId[] | null>(null);

  const analysis = useMemo(
    () => analyzeBrainCheckIn(energy, eyes, motivation),
    [energy, eyes, motivation],
  );

  const activeSuperpowers = customOverrides ?? analysis.recommendedIds;

  const updateBaseChoice = (fn: () => void) => {
    setCustomOverrides(null);
    fn();
  };

  const toggleSuperpower = (id: PolarizingToolId) => {
    const current = new Set<PolarizingToolId>(activeSuperpowers);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    setCustomOverrides(Array.from(current));
  };

  const panelBg = darkMode
    ? 'border-white/15 bg-[#0b1224]/95 text-slate-100'
    : 'border-[#d6ccb9] bg-[#faf7f0]/98 text-[#1e293b]';
  const muted = darkMode ? 'text-slate-400' : 'text-[#526071]';
  const optionIdle = darkMode
    ? 'border-white/10 bg-white/5 text-slate-200 hover:border-blue-400/50'
    : 'border-[#d6ccb9] bg-[#f1ece1] text-[#1e293b] hover:border-blue-500/50';
  const optionActive = 'border-blue-500 bg-blue-600 text-white shadow-md';

  const toolById = useMemo(
    () => new Map(POLARIZING_SUPERPOWERS.map((t) => [t.id, t])),
    [],
  );

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.25rem] border p-6 sm:p-10 space-y-8 shadow-2xl ${panelBg}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-500">
              <Brain size={12} /> Quick Brain Check-In
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Set up Prism Play for how your brain works today
            </h2>
            <p className={`text-sm leading-relaxed ${muted}`}>
              Every brain is unique. Tap 3 quick answers below to get a tailored setup — or skip straight to reading. You can fine-tune anything later in <strong>Neural Identity</strong>.
            </p>
          </div>
          <button
            onClick={onSkip}
            aria-label="Skip setup"
            className={`rounded-2xl border p-2.5 shrink-0 ${optionIdle}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Energy & Sound */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-blue-500">1. What helps you lock in?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'silence' as const, label: 'Calm & Quiet', sub: 'Silence and zero visual noise' },
              { id: 'noise' as const, label: 'Steady Soundscape', sub: 'Brown noise, pink noise, or soft rain' },
              { id: 'energized' as const, label: 'Energized Lock-In', sub: 'Playlists, 40Hz pulse, fidget & motion' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateBaseChoice(() => setEnergy(opt.id))}
                className={`rounded-2xl border p-4 text-left transition-all ${energy === opt.id ? optionActive : optionIdle}`}
              >
                <p className="text-sm font-black">{opt.label}</p>
                <p className={`mt-1 text-xs leading-relaxed ${energy === opt.id ? 'text-blue-100' : muted}`}>{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Eyes & Reading */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-500">2. How do your eyes like text?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'clean' as const, label: 'Clean & Simple', sub: 'Standard font and spacing' },
              { id: 'bionic' as const, label: 'Bionic + Easy-Read', sub: 'Bold word anchors + Lexend font' },
              { id: 'big' as const, label: 'Big + Spacious', sub: 'Large text and generous breathing room' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateBaseChoice(() => setEyes(opt.id))}
                className={`rounded-2xl border p-4 text-left transition-all ${eyes === opt.id ? optionActive : optionIdle}`}
              >
                <p className="text-sm font-black">{opt.label}</p>
                <p className={`mt-1 text-xs leading-relaxed ${eyes === opt.id ? 'text-blue-100' : muted}`}>{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Motivation */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-amber-500">3. What keeps you moving?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'gentle' as const, label: 'Zero Pressure', sub: 'Quiet, gentle, untimed pace' },
              { id: 'playful' as const, label: 'Playful Wins', sub: 'Warm chimes, XP, and shame-free days' },
              { id: 'challenge' as const, label: 'Challenge Mode', sub: 'Beat-the-Clock sprints & Boss Fights' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateBaseChoice(() => setMotivation(opt.id))}
                className={`rounded-2xl border p-4 text-left transition-all ${motivation === opt.id ? optionActive : optionIdle}`}
              >
                <p className="text-sm font-black">{opt.label}</p>
                <p className={`mt-1 text-xs leading-relaxed ${motivation === opt.id ? 'text-blue-100' : muted}`}>{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Live Brain Fit Analysis + Optional Power Tools grouped cleanly without A-H codes */}
        <div className={`rounded-3xl border p-5 sm:p-6 space-y-5 ${darkMode ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-400/50 bg-blue-50/75'}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 max-w-xl">
              <p className="text-xs font-black uppercase tracking-wider text-blue-500">
                Suggested Setup: {analysis.personaName}
              </p>
              <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                {analysis.summary}
              </p>
            </div>
            <span className="rounded-full bg-blue-600/20 px-3 py-1 text-xs font-black text-blue-500 shrink-0">
              {activeSuperpowers.length} power tools selected
            </span>
          </div>

          <div className="space-y-5 pt-2 border-t border-black/10 dark:border-white/10">
            {CHECKIN_GROUPS.map((group) => (
              <div key={group.title} className="space-y-2.5">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">{group.title}</p>
                  <p className={`text-[11px] ${muted}`}>{group.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.ids.map((id) => {
                    const tool = toolById.get(id);
                    if (!tool) return null;
                    const selected = activeSuperpowers.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleSuperpower(id)}
                        className={`rounded-2xl border p-3.5 text-left transition-all ${
                          selected
                            ? darkMode
                              ? 'border-emerald-400 bg-emerald-500/20 text-white'
                              : 'border-emerald-600 bg-emerald-100/90 text-slate-900'
                            : optionIdle
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black">{tool.shortLabel}</span>
                          {selected && <Check size={15} className="text-emerald-500 shrink-0" />}
                        </div>
                        <p className={`mt-1 text-[11px] leading-relaxed ${muted}`}>
                          {tool.lovesIt}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={onSkip}
            className={`w-full sm:w-auto rounded-2xl border px-6 py-3.5 text-xs font-bold transition-colors ${optionIdle}`}
          >
            Skip &amp; Just Continue
          </button>
          <button
            type="button"
            onClick={() => onComplete(buildProfileFromCheckIn(energy, eyes, motivation, activeSuperpowers))}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-7 py-3.5 text-sm font-black text-white shadow-lg hover:bg-emerald-500 active:scale-95"
          >
            <Sparkles size={16} /> Apply My Neural Setup
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface DrawerProps {
  darkMode: boolean;
  profile: NeuralProfile;
  onChangeProfile: (next: NeuralProfile) => void;
  onApplyPreset: (presetId: Exclude<NeuralPresetId, 'custom'>) => void;
  onOpenCheckIn: () => void;
  onClose: () => void;
}

type BooleanProfileKey = {
  [K in keyof NeuralProfile]: NeuralProfile[K] extends boolean ? K : never;
}[keyof NeuralProfile];

const TOGGLE_GROUPS: Array<{
  title: string;
  subtitle: string;
  icon: 'sensory' | 'reading' | 'focus';
  items: Array<{ key: BooleanProfileKey; label: string; desc: string }>;
}> = [
  {
    title: 'Sound & Sensory Atmosphere',
    subtitle: 'Controls your bottom Soundscape dock, fidget companion, and living background.',
    icon: 'sensory',
    items: [
      { key: 'showSensoryBar', label: 'Soundscape Studio (Brown / Pink / Rain)', desc: 'Adds the Soundscape button in the bottom studio dock for zero-login focus audio.' },
      { key: 'showGamma40', label: '40Hz Gamma Focus Pulse', desc: 'Adds a gentle rhythmic 40Hz trance pulse inside the Soundscape Studio.' },
      { key: 'showSoundtrackPin', label: 'Pin My Spotify / YouTube Link', desc: 'Lets you pin your own playlist inside the Soundscape Studio without switching tabs.' },
      { key: 'showFidgetCorner', label: 'Quiet Fidget Companion (PrismWeaver)', desc: 'Subtle cursor-following prism shards that pulse whenever you claim a card win.' },
      { key: 'kineticMotion', label: 'Kinetic Living Background', desc: 'Visible drifting prism light ribbons along the outer edges for under-stimulated days.' },
      { key: 'reducedMotion', label: 'Calm Shell (Reduced Motion)', desc: 'Turns off animations and background motion for a completely still reading sanctuary.' },
    ],
  },
  {
    title: 'Reading & Voice Tools',
    subtitle: 'Controls how you interact with words, speed-reading, and verbal recall.',
    icon: 'reading',
    items: [
      { key: 'showPrismLens', label: 'Prism Lens (Tap Any Word)', desc: 'Tap any word on a card to Ask DJ or look it up without leaving your quest.' },
      { key: 'showRsvpMode', label: 'RSVP Speed-Reader (1-Word Flash)', desc: 'Adds a 1-click RSVP Flash toggle on cards for 180–480 WPM focal-point reading.' },
      { key: 'showVoiceRecap', label: 'Voice "Talk It Out" Recap Mic', desc: 'Speak a 1-sentence summary out loud on any card to lock it in (+10 XP).' },
      { key: 'keyboardFlow', label: 'Keyboard Flow Shortcuts', desc: 'Use ← / → arrows to move cards, R to Refract, and B to toggle Bionic.' },
    ],
  },
  {
    title: 'Focus, Pacing & Momentum',
    subtitle: 'Controls your Focus Companion dock, Brain Dump, and game rewards.',
    icon: 'focus',
    items: [
      { key: 'lowBatteryMode', label: 'Low-Battery Mode ("Just 1 Card")', desc: 'Hides extra docks and chrome so starting on tough days feels effortless.' },
      { key: 'showBrainDump', label: 'Brain Dump Distraction Catcher', desc: 'Adds a 2-second thought-parking drawer in the bottom dock.' },
      { key: 'showBodyDoubling', label: 'Body-Doubling Focus Companion', desc: 'Adds gentle 5m / 10m / 15m study sprints to your bottom studio dock.' },
      { key: 'challengeMode', label: 'Beat-the-Clock Challenge Mode', desc: 'Adds a playful "3 cards in 4 minutes!" urgency race to your Focus Companion.' },
      { key: 'bossFightMode', label: 'Stage Clear Boss Fight (3 Hearts)', desc: 'Adds an optional 3-heart recall mini-game & 1-line teach-back at Stage Clear.' },
      { key: 'shameFreeStreak', label: 'Shame-Free "Days Shown Up"', desc: 'Keep ON for zero-guilt total days. Turn OFF for Competitive High-Score Streaks.' },
    ],
  },
];

const SPEED_OPTIONS: PreferredReadSpeed[] = [1, 1.25, 1.5, 1.75, 2];

export function NeuralIdentityDrawer({
  darkMode,
  profile,
  onChangeProfile,
  onApplyPreset,
  onOpenCheckIn,
  onClose,
}: DrawerProps) {
  const modalBg = darkMode
    ? 'border-white/15 bg-[#0b1224]/95 text-slate-100'
    : 'border-[#d6ccb9] bg-[#f8f4eb]/98 text-[#1e293b]';
  const muted = darkMode ? 'text-slate-400' : 'text-[#526071]';
  const cardIdle = darkMode
    ? 'border-white/10 bg-white/[0.04]'
    : 'border-[#dcd3c2] bg-[#f1ebe0]';

  const toggleKey = (key: BooleanProfileKey) => {
    const nextVal = !profile[key];
    const next: NeuralProfile = {
      ...profile,
      preset: 'custom',
      [key]: nextVal,
    };
    if (key === 'reducedMotion' && nextVal) {
      next.kineticMotion = false;
    }
    if (key === 'kineticMotion' && nextVal) {
      next.reducedMotion = false;
    }
    if (key === 'showGamma40' && nextVal) {
      next.showSensoryBar = true;
    }
    if (key === 'challengeMode' && nextVal) {
      next.showBodyDoubling = true;
    }
    onChangeProfile(next);
  };

  return (
    <div className="fixed inset-0 z-[450] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 14 }}
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.25rem] border p-6 sm:p-10 space-y-8 shadow-2xl ${modalBg}`}
      >
        {/* Spacious Header (mirroring main Dassah's Prism Neural Identity) */}
        <div className="flex items-start justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black italic flex items-center gap-3">
              <Crown size={24} className="text-amber-400 shrink-0" /> Neural Identity
            </h2>
            <p className={`text-xs sm:text-sm ${muted}`}>
              Your personal brain profile. Only the tools you switch ON appear on your workspace — everything else stays tucked away.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCheckIn}
              className="rounded-2xl border border-blue-500/40 bg-blue-600/15 px-4 py-2 text-xs font-black text-blue-500 hover:bg-blue-600/25 transition-colors"
            >
              Re-run Brain Check-In
            </button>
            <button
              onClick={onClose}
              aria-label="Close Neural Identity"
              className={`rounded-2xl border p-2.5 ${cardIdle}`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 1-Tap Starting Presets */}
        <section className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">1-Tap Starting Presets</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(Object.entries(NEURAL_PRESETS) as Array<[Exclude<NeuralPresetId, 'custom'>, (typeof NEURAL_PRESETS)['adhd_flow']]>).map(([id, item]) => {
              const active = profile.preset === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onApplyPreset(id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    active ? 'border-blue-500 bg-blue-600/20 shadow-md' : `${cardIdle} hover:border-blue-500/40`
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-black">{item.label}</span>
                    {active && <Check size={15} className="text-blue-500 shrink-0" />}
                  </div>
                  <p className={`mt-1.5 text-xs leading-relaxed ${muted}`}>{item.tagline}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Default Read-Aloud Pace */}
        <section className={`rounded-3xl border p-5 flex flex-wrap items-center justify-between gap-4 ${cardIdle}`}>
          <div className="space-y-1 max-w-md">
            <p className="text-sm font-black flex items-center gap-2">
              <Volume2 size={16} className="text-blue-500" /> Default Read-Aloud Speed
            </p>
            <p className={`text-xs leading-relaxed ${muted}`}>
              Racing-thought ADHD brains often lock in at 1.5x–2x. You can also adjust speed anytime on the reading bar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SPEED_OPTIONS.map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() =>
                  onChangeProfile({
                    ...profile,
                    preset: 'custom',
                    preferredReadSpeed: spd,
                  })
                }
                className={`rounded-xl border px-3.5 py-2 text-xs font-black transition-all ${
                  profile.preferredReadSpeed === spd
                    ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                    : `${cardIdle} hover:border-blue-500/40`
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </section>

        {/* Spacious Categorized Tool Groups */}
        <div className="space-y-8">
          {TOGGLE_GROUPS.map((group) => (
            <section key={group.title} className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                {group.icon === 'sensory' && <Headphones size={16} className="text-cyan-500" />}
                {group.icon === 'reading' && <BookOpen size={16} className="text-emerald-500" />}
                {group.icon === 'focus' && <Flame size={16} className="text-amber-500" />}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">{group.title}</h3>
                  <p className={`text-xs ${muted}`}>{group.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.items.map((item) => {
                  const enabled = Boolean(profile[item.key]);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      onClick={() => toggleKey(item.key)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all flex items-center justify-between gap-4 ${cardIdle} hover:border-blue-500/40`}
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-bold leading-snug">{item.label}</p>
                        <p className={`text-xs leading-relaxed ${muted}`}>{item.desc}</p>
                      </div>
                      <span
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                          enabled ? 'bg-emerald-500' : darkMode ? 'bg-white/15' : 'bg-slate-400/50'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
