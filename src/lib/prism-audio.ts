'use client';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctor();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  peakGain = 0.08,
  type: OscillatorType = 'sine',
) {
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

/** Crisp, joyful two-note ascending chime for Claim Win */
export function playCardWinChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 523.25, 0, 0.22, 0.075, 'triangle'); // C5
  playTone(ctx, 659.25, 0.09, 0.32, 0.085, 'sine'); // E5
}

/** Warm 4-note major arpeggio fanfare for Stage Clear! */
export function playStageClearFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 523.25, 0, 0.24, 0.07, 'triangle'); // C5
  playTone(ctx, 659.25, 0.08, 0.26, 0.075, 'triangle'); // E5
  playTone(ctx, 783.99, 0.16, 0.3, 0.08, 'sine'); // G5
  playTone(ctx, 1046.5, 0.25, 0.55, 0.09, 'sine'); // C6
}

/** Soft crystalline pulse when Prism refracts a card */
export function playRefractPulse() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 587.33, 0, 0.18, 0.05, 'sine'); // D5
  playTone(ctx, 880.0, 0.06, 0.22, 0.045, 'sine'); // A5
}

/** Gentle bell when a Body-Doubling focus sprint completes */
export function playSprintCompleteChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 440.0, 0, 0.45, 0.06, 'sine'); // A4
  playTone(ctx, 659.25, 0.14, 0.6, 0.07, 'sine'); // E5
}
