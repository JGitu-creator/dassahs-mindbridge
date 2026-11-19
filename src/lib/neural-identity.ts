export type NeuralPresetId =
  | 'adhd_flow'
  | 'adhd_energy'
  | 'dyslexia_comfort'
  | 'low_sensory'
  | 'custom';

export type PolarizingToolId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
export type PreferredReadSpeed = 1 | 1.25 | 1.5 | 1.75 | 2;

export interface NeuralProfile {
  preset: NeuralPresetId;
  showSensoryBar: boolean;
  showGamma40: boolean;
  showFidgetCorner: boolean;
  showSoundtrackPin: boolean;
  showPrismLens: boolean;
  showBrainDump: boolean;
  showBodyDoubling: boolean;
  challengeMode: boolean;
  bossFightMode: boolean;
  showRsvpMode: boolean;
  showVoiceRecap: boolean;
  kineticMotion: boolean;
  lowBatteryMode: boolean;
  shameFreeStreak: boolean;
  keyboardFlow: boolean;
  reducedMotion: boolean;
  preferredReadSpeed: PreferredReadSpeed;
}

export interface PolarizingToolMeta {
  id: PolarizingToolId;
  title: string;
  shortLabel: string;
  lovesIt: string;
  watchOut: string;
}

export const POLARIZING_SUPERPOWERS: PolarizingToolMeta[] = [
  {
    id: 'A',
    title: 'Fast Read-Aloud Speed (1.5x–2x)',
    shortLabel: 'Read-Aloud 1.5x',
    lovesIt: 'Racing-thought ADHD brains often lock in faster at 1.5x–2x instead of zoning out at 1x.',
    watchOut: 'Can feel too fast for auditory processing differences (always adjustable 1x–2x).',
  },
  {
    id: 'B',
    title: 'Beat-the-Clock Challenge Mode',
    shortLabel: 'Beat-the-Clock',
    lovesIt: 'Uses INCUP urgency ("3 cards in 4 min!") to wake up an under-stimulated brain.',
    watchOut: 'Skip if timers trigger freeze or anxiety.',
  },
  {
    id: 'C',
    title: 'Module Boss Fight (3 Hearts + Timed Quiz)',
    shortLabel: 'Boss Fight',
    lovesIt: 'Turns the end of a topic into a 3-heart video game with bonus XP.',
    watchOut: 'Skip if quiz rounds feel like a stressful school exam.',
  },
  {
    id: 'D',
    title: 'RSVP Speed-Reader (1-Word Flash)',
    shortLabel: 'RSVP Flash',
    lovesIt: 'Locks eyes onto one center word at 180–480 WPM to stop eye-wandering on dry intros.',
    watchOut: 'Harder for dense code/math or glancing back.',
  },
  {
    id: 'E',
    title: '40Hz Gamma Focus Pulse Tone',
    shortLabel: '40Hz Pulse',
    lovesIt: 'Low rhythmic 40Hz hum that some ADHD listeners love for trance lock-in.',
    watchOut: 'Skip if you are sound-sensitive or prone to ear fatigue.',
  },
  {
    id: 'F',
    title: 'Kinetic Ambient Background ("Subway Surfers" Effect)',
    shortLabel: 'Kinetic Glow',
    lovesIt: 'Gentle peripheral light motion keeps the bored part of the brain busy while reading.',
    watchOut: 'Can overload visually sensitive or AuDHD readers.',
  },
  {
    id: 'G',
    title: 'Competitive High-Score Streak Mode',
    shortLabel: 'High-Score Streak',
    lovesIt: 'Tracks strict daily streak & personal bests for competitive dopamine.',
    watchOut: 'Leave OFF for Shame-Free "Days Shown Up" if broken streaks trigger RSD.',
  },
  {
    id: 'H',
    title: 'Voice "Talk It Out" Mic (Rubber-Duck Recap)',
    shortLabel: 'Voice Recap',
    lovesIt: 'Verbal-processing brains understand concepts 2x faster by speaking a 1-line summary.',
    watchOut: 'Awkward in quiet libraries or public spaces.',
  },
];

export const NEURAL_PRESETS: Record<Exclude<NeuralPresetId, 'custom'>, {
  label: string;
  tagline: string;
  profile: NeuralProfile;
  recommendedTextSize: 'small' | 'comfortable' | 'big';
  recommendedBionic: boolean;
  recommendedEasyRead: boolean;
}> = {
  adhd_flow: {
    label: 'ADHD Flow',
    tagline: 'Balanced calm: soundscape, brain dump, Prism Lens, gentle body-doubling & shame-free wins.',
    recommendedTextSize: 'comfortable',
    recommendedBionic: true,
    recommendedEasyRead: true,
    profile: {
      preset: 'adhd_flow',
      showSensoryBar: true,
      showGamma40: false,
      showFidgetCorner: false,
      showSoundtrackPin: true,
      showPrismLens: true,
      showBrainDump: true,
      showBodyDoubling: true,
      challengeMode: false,
      bossFightMode: true,
      showRsvpMode: false,
      showVoiceRecap: false,
      kineticMotion: false,
      lowBatteryMode: false,
      shameFreeStreak: true,
      keyboardFlow: true,
      reducedMotion: false,
      preferredReadSpeed: 1.25,
    },
  },
  adhd_energy: {
    label: 'ADHD High-Energy',
    tagline: 'All A–H superpowers ON: 1.5x voice, Beat-the-Clock, Boss Fight, RSVP, 40Hz, Kinetic Glow, High-Score Streak & Voice Mic.',
    recommendedTextSize: 'comfortable',
    recommendedBionic: true,
    recommendedEasyRead: false,
    profile: {
      preset: 'adhd_energy',
      showSensoryBar: true,
      showGamma40: true,
      showFidgetCorner: true,
      showSoundtrackPin: true,
      showPrismLens: true,
      showBrainDump: true,
      showBodyDoubling: true,
      challengeMode: true,
      bossFightMode: true,
      showRsvpMode: true,
      showVoiceRecap: true,
      kineticMotion: true,
      lowBatteryMode: false,
      shameFreeStreak: false,
      keyboardFlow: true,
      reducedMotion: false,
      preferredReadSpeed: 1.5,
    },
  },
  dyslexia_comfort: {
    label: 'Dyslexia Comfort',
    tagline: 'Generous spacing, bigger text, Prism Lens word help, calm 1x audio + Voice Recap, zero visual clutter.',
    recommendedTextSize: 'big',
    recommendedBionic: false,
    recommendedEasyRead: true,
    profile: {
      preset: 'dyslexia_comfort',
      showSensoryBar: false,
      showGamma40: false,
      showFidgetCorner: false,
      showSoundtrackPin: false,
      showPrismLens: true,
      showBrainDump: false,
      showBodyDoubling: false,
      challengeMode: false,
      bossFightMode: false,
      showRsvpMode: false,
      showVoiceRecap: true,
      kineticMotion: false,
      lowBatteryMode: false,
      shameFreeStreak: true,
      keyboardFlow: true,
      reducedMotion: true,
      preferredReadSpeed: 1,
    },
  },
  low_sensory: {
    label: 'Low-Sensory Calm',
    tagline: 'Zero animations, zero surprises, clean reading only — quiet sanctuary mode.',
    recommendedTextSize: 'comfortable',
    recommendedBionic: false,
    recommendedEasyRead: true,
    profile: {
      preset: 'low_sensory',
      showSensoryBar: false,
      showGamma40: false,
      showFidgetCorner: false,
      showSoundtrackPin: false,
      showPrismLens: true,
      showBrainDump: true,
      showBodyDoubling: false,
      challengeMode: false,
      bossFightMode: false,
      showRsvpMode: false,
      showVoiceRecap: false,
      kineticMotion: false,
      lowBatteryMode: false,
      shameFreeStreak: true,
      keyboardFlow: true,
      reducedMotion: true,
      preferredReadSpeed: 1,
    },
  },
};

export const DEFAULT_NEURAL_PROFILE: NeuralProfile = NEURAL_PRESETS.adhd_flow.profile;

export type CheckInEnergy = 'silence' | 'noise' | 'energized';
export type CheckInEyes = 'clean' | 'bionic' | 'big';
export type CheckInMotivation = 'gentle' | 'playful' | 'challenge';

/**
 * Analyzes the 3 quick brain check-in answers and recommends which polarizing
 * superpowers (A–H) fit best — while letting the user override any of A–H.
 */
export function analyzeBrainCheckIn(
  energy: CheckInEnergy,
  eyes: CheckInEyes,
  motivation: CheckInMotivation,
): {
  personaName: string;
  summary: string;
  recommendedIds: PolarizingToolId[];
} {
  const recommended = new Set<PolarizingToolId>();

  if (energy === 'energized') {
    recommended.add('A');
    recommended.add('D');
    recommended.add('E');
    recommended.add('F');
  } else if (energy === 'noise') {
    recommended.add('A');
  }

  if (motivation === 'challenge') {
    recommended.add('B');
    recommended.add('C');
    recommended.add('G');
    recommended.add('H');
  } else if (motivation === 'playful') {
    recommended.add('C');
    recommended.add('H');
  }

  if (eyes === 'big' && motivation === 'gentle') {
    recommended.add('H');
  }

  let personaName = 'Balanced Flow Explorer';
  let summary = 'A calm, uncluttered setup with steady focus support and zero pressure.';

  if (energy === 'energized' && motivation === 'challenge') {
    personaName = 'High-Voltage INCUP Lock-In';
    summary = 'Your brain thrives on novelty, speed, and game stakes — we recommend fast voice (A), Beat-the-Clock (B), Boss Fight (C), RSVP (D), 40Hz Pulse (E), Kinetic Glow (F), High-Score Streak (G), and Voice Recap (H).';
  } else if (energy === 'silence' && motivation === 'gentle') {
    personaName = 'Quiet Sanctuary Reader';
    summary = 'Maximum calm with zero visual overload or timer pressure. All A–H power tools start OFF unless you hand-pick one below.';
  } else if (eyes === 'big') {
    personaName = 'Comfort-First Clarity';
    summary = 'Big spacious typography, Prism Lens word help, and gentle pacing — with optional Voice Recap (H) if speaking helps you retain ideas.';
  } else if (motivation === 'challenge') {
    personaName = 'Game-Driven Challenger';
    summary = 'Urgency and game mechanics wake your focus up — we recommend Beat-the-Clock (B), Boss Fight (C), and High-Score Streak (G).';
  } else if (energy === 'energized') {
    personaName = 'Sensory Trance Seeker';
    summary = 'Your brain locks in with movement and rhythm — we recommend Fast Read-Aloud (A), RSVP Flash (D), 40Hz Pulse (E), and Kinetic Glow (F).';
  }

  return {
    personaName,
    summary,
    recommendedIds: Array.from(recommended),
  };
}

export function buildProfileFromCheckIn(
  energy: CheckInEnergy,
  eyes: CheckInEyes,
  motivation: CheckInMotivation,
  selectedSuperpowers?: PolarizingToolId[],
): {
  profile: NeuralProfile;
  textSize: 'small' | 'comfortable' | 'big';
  bionicOn: boolean;
  dyslexiaFriendly: boolean;
  chimesOn: boolean;
} {
  const analysis = analyzeBrainCheckIn(energy, eyes, motivation);
  const activeSet = new Set<PolarizingToolId>(
    selectedSuperpowers ?? analysis.recommendedIds,
  );

  const hasA = activeSet.has('A');
  const hasB = activeSet.has('B');
  const hasC = activeSet.has('C');
  const hasD = activeSet.has('D');
  const hasE = activeSet.has('E');
  const hasF = activeSet.has('F');
  const hasG = activeSet.has('G');
  const hasH = activeSet.has('H');

  return {
    textSize: eyes === 'big' ? 'big' : 'comfortable',
    bionicOn: eyes === 'bionic',
    dyslexiaFriendly: eyes !== 'clean',
    chimesOn: motivation !== 'gentle' || hasB || hasC,
    profile: {
      preset: 'custom',
      showSensoryBar: energy !== 'silence' || hasE,
      showGamma40: hasE,
      showFidgetCorner: energy === 'energized',
      showSoundtrackPin: energy === 'energized',
      showPrismLens: true,
      showBrainDump: true,
      showBodyDoubling: motivation !== 'gentle' || hasB,
      challengeMode: hasB,
      bossFightMode: hasC,
      showRsvpMode: hasD,
      showVoiceRecap: hasH,
      kineticMotion: hasF,
      lowBatteryMode: false,
      shameFreeStreak: !hasG,
      keyboardFlow: true,
      reducedMotion: energy === 'silence' && motivation === 'gentle' && !hasF,
      preferredReadSpeed: hasA ? 1.5 : 1,
    },
  };
}

/**
 * Safely convert a public Spotify or YouTube link into an embeddable HTTPS iframe URL.
 * Rejects all other domains/protocols to prevent XSS or arbitrary iframe injection.
 */
export function parseSoundtrackEmbedUrl(rawUrl: string): {
  embedUrl: string;
  provider: 'spotify' | 'youtube';
} | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:') return null;
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

  // Spotify: open.spotify.com/(track|playlist|album|episode)/<id>
  if (host === 'open.spotify.com') {
    const match = parsed.pathname.match(/\/(track|playlist|album|episode)\/([A-Za-z0-9]+)/);
    if (!match) return null;
    return {
      provider: 'spotify',
      embedUrl: `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`,
    };
  }

  // YouTube: youtube.com/watch?v=<id> or youtu.be/<id> or youtube.com/live/<id>
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const videoId = parsed.searchParams.get('v') || parsed.pathname.match(/^\/(live|embed|shorts)\/([A-Za-z0-9_-]{6,15})/)?.[2];
    if (!videoId || !/^[A-Za-z0-9_-]{6,15}$/.test(videoId)) return null;
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    };
  }

  if (host === 'youtu.be') {
    const videoId = parsed.pathname.replace(/^\//, '').split('/')[0];
    if (!videoId || !/^[A-Za-z0-9_-]{6,15}$/.test(videoId)) return null;
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    };
  }

  return null;
}
