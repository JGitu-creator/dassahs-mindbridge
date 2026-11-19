'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Check,
  Sliders,
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
    ? 'border-white/15 bg-[#0f172a] text-slate-100'
    : 'border-[#d6ccb9] bg-[#faf7f0] text-[#1e293b]';
  const muted = darkMode ? 'text-slate-400' : 'text-[#526071]';
  const optionIdle = darkMode
    ? 'border-white/10 bg-white/5 text-slate-200 hover:border-blue-400/50'
    : 'border-[#d6ccb9] bg-[#f1ece1] text-[#1e293b] hover:border-blue-500/50';
  const optionActive = 'border-blue-500 bg-blue-600 text-white shadow-md';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border p-6 sm:p-8 space-y-6 ${panelBg}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-500">
              <Brain size={12} /> Quick Brain Check-In &amp; Analysis
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-black tracking-tight">
              Tune Prism Play for your unique brain today
            </h2>
            <p className={`mt-1 text-xs sm:text-sm ${muted}`}>
              No two ADHD or neurodivergent brains are identical. Answer 3 quick taps to see your recommended tools (including optional A–H superpowers), or skip straight to reading.
            </p>
          </div>
          <button
            onClick={onSkip}
            aria-label="Skip setup"
            className={`rounded-xl border p-2 ${optionIdle}`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Step 1: Energy & Sound */}
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-blue-500">1. What helps you lock in?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'silence' as const, label: 'Calm & Quiet', sub: 'Silence, zero visual noise' },
              { id: 'noise' as const, label: 'Steady Noise', sub: 'Brown / Pink / Rain bar' },
              { id: 'energized' as const, label: 'Energized Lock-In', sub: 'Playlist pin, 40Hz, fidget, RSVP' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateBaseChoice(() => setEnergy(opt.id))}
                className={`rounded-2xl border p-3 text-left transition-all ${energy === opt.id ? optionActive : optionIdle}`}
              >
                <p className="text-xs font-black">{opt.label}</p>
                <p className={`mt-0.5 text-[11px] ${energy === opt.id ? 'text-blue-100' : muted}`}>{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Eyes & Reading */}
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-500">2. How do your eyes like text?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'clean' as const, label: 'Clean & Simple', sub: 'Standard spacing' },
              { id: 'bionic' as const, label: 'Bionic + Easy-Read', sub: 'Bold word anchors + Lexend' },
              { id: 'big' as const, label: 'Big + Spacious', sub: 'Large font & extra breathing room' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateBaseChoice(() => setEyes(opt.id))}
                className={`rounded-2xl border p-3 text-left transition-all ${eyes === opt.id ? optionActive : optionIdle}`}
              >
                <p className="text-xs font-black">{opt.label}</p>
                <p className={`mt-0.5 text-[11px] ${eyes === opt.id ? 'text-blue-100' : muted}`}>{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Motivation */}
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-amber-500">3. What keeps you moving?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'gentle' as const, label: 'Zero Pressure', sub: 'Quiet & gentle pace' },
              { id: 'playful' as const, label: 'Playful Wins', sub: 'Chimes, XP & shame-free days' },
              { id: 'challenge' as const, label: 'Challenge Mode!', sub: 'Beat-the-Clock & Boss Fight' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateBaseChoice(() => setMotivation(opt.id))}
                className={`rounded-2xl border p-3 text-left transition-all ${motivation === opt.id ? optionActive : optionIdle}`}
              >
                <p className="text-xs font-black">{opt.label}</p>
                <p className={`mt-0.5 text-[11px] ${motivation === opt.id ? 'text-blue-100' : muted}`}>{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Live Brain Fit Analysis + A–H Polarizing Superpowers Picker */}
        <div className={`rounded-2xl border p-4 space-y-3 ${darkMode ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-400/50 bg-blue-50/80'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-blue-500">
                Your Brain Fit Analysis: {analysis.personaName}
              </p>
              <p className={`mt-0.5 text-xs leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                {analysis.summary}
              </p>
            </div>
            <span className="rounded-full bg-blue-600/20 px-2.5 py-1 text-[11px] font-black text-blue-500">
              {activeSuperpowers.length} / 8 A–H tools ON
            </span>
          </div>

          <div className="space-y-1.5">
            <p className={`text-[11px] font-black uppercase tracking-wider ${muted}`}>
              4. Hand-Pick Any Polarizing Superpowers (A–H) — You Decide What Fits:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POLARIZING_SUPERPOWERS.map((tool) => {
                const selected = activeSuperpowers.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSuperpower(tool.id)}
                    className={`rounded-xl border p-2.5 text-left transition-all ${
                      selected
                        ? darkMode
                          ? 'border-emerald-400 bg-emerald-500/20 text-white'
                          : 'border-emerald-600 bg-emerald-100/90 text-slate-900'
                        : optionIdle
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black">
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black ${
                          selected ? 'bg-emerald-600 text-white' : darkMode ? 'bg-white/10 text-slate-300' : 'bg-black/10 text-slate-700'
                        }`}>
                          {tool.id}
                        </span>
                        {tool.shortLabel}
                      </span>
                      {selected && <Check size={14} className="text-emerald-500 shrink-0" />}
                    </div>
                    <p className={`mt-1 text-[10px] leading-snug ${muted}`}>
                      <strong>Works for:</strong> {tool.lovesIt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={onSkip}
            className={`w-full sm:w-auto rounded-2xl border px-5 py-3 text-xs font-bold transition-colors ${optionIdle}`}
          >
            Skip &amp; Just Continue
          </button>
          <button
            type="button"
            onClick={() => onComplete(buildProfileFromCheckIn(energy, eyes, motivation, activeSuperpowers))}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-500 active:scale-95"
          >
            <Sparkles size={15} /> Apply My Neural Setup
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
  items: Array<{ key: BooleanProfileKey; badge?: string; label: string; desc: string }>;
}> = [
  {
    title: 'Sensory & Lock-In Fuel',
    items: [
      { key: 'showSensoryBar', label: 'Soundscape Bar (Brown / Pink / Rain)', desc: 'Zero-login Web Audio focus noise right inside your tab.' },
      { key: 'showGamma40', badge: 'E', label: '40Hz Gamma Focus Pulse Tone', desc: 'Adds the rhythmic 40Hz trance pulse to the Soundscape Bar.' },
      { key: 'showSoundtrackPin', label: 'Pin My Spotify / YouTube Link', desc: 'Optional collapsed mini-player inside the tab.' },
      { key: 'showFidgetCorner', label: 'Quiet Fidget Corner (PrismWeaver)', desc: 'Subtle interactive prism companion for restless hands.' },
      { key: 'kineticMotion', badge: 'F', label: 'Kinetic Ambient Background ("Subway Surfers" Glow)', desc: 'Gentle peripheral-vision light motion for under-stimulated days.' },
      { key: 'reducedMotion', label: 'Calm Shell (Zero-Surprise / Reduced Motion)', desc: 'Disables animations & kinetic motion for sensory calm.' },
    ],
  },
  {
    title: 'Reading & Comprehension Tools',
    items: [
      { key: 'showPrismLens', label: 'Prism Lens (Tap Any Word)', desc: 'Tap a word to Ask DJ or Google definition without leaving the page.' },
      { key: 'showRsvpMode', badge: 'D', label: 'RSVP Speed-Reader (1-Word Flash)', desc: 'Optional 180–480 WPM focal-point speed mode.' },
      { key: 'showVoiceRecap', badge: 'H', label: 'Voice "Talk It Out" Mic (Rubber-Duck Recap)', desc: 'Speak a 1-sentence recap out loud for verbal processing (+10 XP).' },
      { key: 'keyboardFlow', label: 'Keyboard Flow Shortcuts', desc: 'Arrow keys (← / →), R to Refract, B for Bionic.' },
    ],
  },
  {
    title: 'Executive Function & Motivation',
    items: [
      { key: 'lowBatteryMode', label: 'Low-Battery Mode ("Just 1 Card")', desc: 'Hides extra bars so starting feels effortless.' },
      { key: 'showBrainDump', label: 'Brain Dump Distraction Catcher', desc: '2-second drawer to park random thoughts without switching tabs.' },
      { key: 'showBodyDoubling', label: 'Body-Doubling Focus Companion', desc: 'Gentle 5m / 10m / 15m study companion bar.' },
      { key: 'challengeMode', badge: 'B', label: 'Beat-the-Clock Challenge Mode', desc: 'Playful "3 cards in 4 min!" urgency framing on focus sprints.' },
      { key: 'bossFightMode', badge: 'C', label: 'Stage Clear Boss Fight (3 Hearts + Timed Quiz)', desc: 'Optional 3-heart mini-game & 1-line teach-back at Stage Clear.' },
      { key: 'shameFreeStreak', badge: 'G', label: 'Shame-Free "Days Shown Up" (OFF = High-Score Streak)', desc: 'Turn OFF to unlock Competitive High-Score Streak tracking.' },
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
  const drawerBg = darkMode
    ? 'border-white/10 bg-[#0b1224] text-slate-100'
    : 'border-[#d6ccb9] bg-[#f8f4eb] text-[#1e293b]';
  const muted = darkMode ? 'text-slate-400' : 'text-[#526071]';
  const cardIdle = darkMode
    ? 'border-white/10 bg-white/5'
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
    if (key === 'showGamma40' && nextVal) {
      next.showSensoryBar = true;
    }
    if (key === 'challengeMode' && nextVal) {
      next.showBodyDoubling = true;
    }
    onChangeProfile(next);
  };

  return (
    <div className="fixed inset-0 z-[450] flex justify-end bg-black/65 backdrop-blur-sm">
      <motion.aside
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        className={`h-full w-full max-w-md overflow-y-auto border-l p-6 space-y-6 ${drawerBg}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black flex items-center gap-2">
              <Sliders size={18} className="text-blue-500" /> Neural Identity
            </h2>
            <p className={`text-xs ${muted}`}>
              Only the tools you turn ON appear on your screen. Everything else stays out of your way.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Neural Identity"
            className={`rounded-xl border p-2 ${cardIdle}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* 1-Tap Starting Presets */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider text-blue-500">1-Tap Starting Presets</p>
            <button
              type="button"
              onClick={onOpenCheckIn}
              className="text-xs font-bold text-blue-500 hover:underline"
            >
              Re-run Brain Check-In
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.entries(NEURAL_PRESETS) as Array<[Exclude<NeuralPresetId, 'custom'>, (typeof NEURAL_PRESETS)['adhd_flow']]>).map(([id, item]) => {
              const active = profile.preset === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onApplyPreset(id)}
                  className={`rounded-2xl border p-3 text-left transition-all ${
                    active ? 'border-blue-500 bg-blue-600/20' : `${cardIdle} hover:border-blue-500/40`
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black">{item.label}</span>
                    {active && <Check size={14} className="text-blue-500 shrink-0" />}
                  </div>
                  <p className={`mt-1 text-[11px] leading-snug ${muted}`}>{item.tagline}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool A: Preferred Read-Aloud Pace */}
        <div className={`rounded-2xl border p-3.5 space-y-2 ${cardIdle}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-[10px] font-black text-white">A</span>
              <Volume2 size={13} className="text-blue-500" /> Default Read-Aloud Speed
            </p>
            <span className="text-xs font-black text-blue-500">{profile.preferredReadSpeed}x</span>
          </div>
          <p className={`text-[11px] ${muted}`}>
            Racing-thought ADHD brains often lock in at 1.5x–2x. Always adjustable on the Read-Aloud bar.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
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
                className={`rounded-xl border px-2.5 py-1 text-xs font-black transition-all ${
                  profile.preferredReadSpeed === spd
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : `${cardIdle} hover:border-blue-500/40`
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Individual Tool Toggles */}
        <div className="space-y-5">
          {TOGGLE_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <p className={`text-[11px] font-black uppercase tracking-wider ${muted}`}>{group.title}</p>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const enabled = Boolean(profile[item.key]);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      onClick={() => toggleKey(item.key)}
                      className={`w-full rounded-2xl border p-3 text-left transition-all flex items-center justify-between gap-3 ${cardIdle} hover:border-blue-500/40`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold flex items-center gap-1.5">
                          {item.badge && (
                            <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-blue-600/20 text-[10px] font-black text-blue-500">
                              {item.badge}
                            </span>
                          )}
                          <span>{item.label}</span>
                        </p>
                        <p className={`text-[11px] leading-snug ${muted}`}>{item.desc}</p>
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
            </div>
          ))}
        </div>
      </motion.aside>
    </div>
  );
}
