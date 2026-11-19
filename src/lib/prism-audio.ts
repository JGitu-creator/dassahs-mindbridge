'use client';

export type SoundscapeType = 'silence' | 'brown' | 'pink' | 'rain' | 'gamma40';

let sharedAudioCtx: AudioContext | null = null;
let activeNodes: AudioNode[] = [];
let activeGain: GainNode | null = null;
let activeType: SoundscapeType = 'silence';

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

/** Stop any currently playing continuous focus soundscape */
export function stopSoundscape() {
  for (const node of activeNodes) {
    try {
      if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
        (node as AudioScheduledSourceNode).stop();
      }
      node.disconnect();
    } catch {
      // Ignore already-stopped nodes
    }
  }
  activeNodes = [];
  activeGain = null;
  activeType = 'silence';
}

/** Start a zero-auth Web Audio focus soundscape (Brown, Pink, Rain, or 40Hz Pulse) */
export function startSoundscape(type: SoundscapeType, volume = 0.28) {
  stopSoundscape();
  if (type === 'silence') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(0.8, volume)) * 0.35, ctx.currentTime);
  masterGain.connect(ctx.destination);
  activeGain = masterGain;
  activeType = type;

  if (type === 'gamma40') {
    // Gentle 200Hz warm tone amplitude-modulated at 40Hz (soothing focus pulse)
    const carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(200, ctx.currentTime);

    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(0.45, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(40, ctx.currentTime);

    const lfoDepth = ctx.createGain();
    lfoDepth.gain.setValueAtTime(0.35, ctx.currentTime);

    lfo.connect(lfoDepth);
    lfoDepth.connect(modGain.gain);
    carrier.connect(modGain);
    modGain.connect(masterGain);

    carrier.start();
    lfo.start();
    activeNodes = [carrier, lfo, lfoDepth, modGain, masterGain];
    return;
  }

  // Generate 4-second seamless noise buffer
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 4;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'brown') {
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.2;
    }
  } else {
    // Paul Kellet pink noise approximation (also used as base for soft rain)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.055;
      b6 = white * 0.115926;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  if (type === 'rain') {
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1100, ctx.currentTime);
    bandpass.Q.setValueAtTime(0.65, ctx.currentTime);
    source.connect(bandpass);
    bandpass.connect(masterGain);
    source.start();
    activeNodes = [source, bandpass, masterGain];
  } else {
    source.connect(masterGain);
    source.start();
    activeNodes = [source, masterGain];
  }
}

export function setSoundscapeVolume(volume: number) {
  if (!activeGain || !sharedAudioCtx) return;
  activeGain.gain.setTargetAtTime(Math.max(0.01, Math.min(0.8, volume)) * 0.35, sharedAudioCtx.currentTime, 0.05);
}

export function getActiveSoundscape(): SoundscapeType {
  return activeType;
}
