'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Play, Square } from 'lucide-react';

const VOICES = [
  { id: 'eve', name: 'Eve (Energetic)' },
  { id: 'ara', name: 'Ara (Warm)' },
  { id: 'standard', name: 'Standard (Authoritative)' },
  { id: 'rex', name: 'Rex (Confident)' },
  { id: 'sal', name: 'Sal (Smooth)' },
];

const SPEEDS = [1, 1.25, 1.5, 1.75, 2] as const;

export type ReadAloudSpeed = (typeof SPEEDS)[number];

export const ReadAloud = ({
  text,
  darkMode,
  defaultSpeed = 1,
}: {
  text: string;
  darkMode?: boolean;
  defaultSpeed?: ReadAloudSpeed;
}) => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState('eve');
  const [speed, setSpeed] = useState<number>(defaultSpeed);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setSpeed(defaultSpeed);
  }, [defaultSpeed]);

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => cleanupAudio, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const speakWithBrowserFallback = (content: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setStatusNote('Read-aloud is unavailable in this browser.');
      setPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = speed;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => {
      setPlaying(false);
      setStatusNote('Could not play audio. Check your device volume or browser permissions.');
    };
    setStatusNote('Using browser voice');
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleRead = async () => {
    if (!text?.trim()) return;
    setLoading(true);
    setStatusNote(null);
    cleanupAudio();

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice_id: voice, language: 'en' }),
      });
      if (!res.ok) {
        throw new Error('Voice service unavailable');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = url;
      audio.playbackRate = speed;
      audio.onended = () => {
        setPlaying(false);
        cleanupAudio();
      };
      audio.onerror = () => {
        cleanupAudio();
        speakWithBrowserFallback(text);
      };
      await audio.play();
      setPlaying(true);
    } catch {
      speakWithBrowserFallback(text);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    cleanupAudio();
    setPlaying(false);
    setStatusNote(null);
  };

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed as (typeof SPEEDS)[number]);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
  };

  const selectClass = darkMode === true
    ? 'rounded-xl border border-white/15 bg-slate-900 px-2.5 py-2 text-xs font-semibold text-slate-100 focus:border-blue-500 focus:outline-none'
    : darkMode === false
      ? 'rounded-xl border border-stone-300 bg-[#fbf8f1] px-2.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none'
      : 'rounded-lg border border-[var(--color-border)] bg-[var(--color-glass)] p-2 text-xs text-[var(--fg)]';

  const optionClass = darkMode === true
    ? 'bg-slate-900 text-slate-100'
    : darkMode === false
      ? 'bg-[#fbf8f1] text-slate-900'
      : 'bg-slate-900 text-slate-100';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={voice}
        onChange={(event) => setVoice(event.target.value)}
        aria-label="Read aloud voice"
        style={{ colorScheme: darkMode === false ? 'light' : 'dark' }}
        className={selectClass}
      >
        {VOICES.map((item) => (
          <option key={item.id} value={item.id} className={optionClass}>
            {item.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={cycleSpeed}
        title="Adjust read-aloud speed (1x to 2x)"
        aria-label={`Read aloud speed ${speed}x`}
        className={`rounded-xl border px-2 py-1.5 text-xs font-bold tabular-nums transition-colors ${
          darkMode === false
            ? 'border-stone-300 bg-[#fbf8f1] text-slate-900 hover:border-blue-500'
            : 'border-white/15 bg-slate-900 text-slate-100 hover:border-blue-400'
        }`}
      >
        {speed}x
      </button>
      <button
        onClick={playing ? handleStop : () => void handleRead()}
        disabled={loading}
        className={`rounded-full p-2 transition-colors disabled:opacity-50 ${
          darkMode === false
            ? 'bg-blue-600/15 text-blue-700 hover:bg-blue-600/25'
            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/40'
        }`}
        aria-label={playing ? 'Stop reading aloud' : 'Read aloud'}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : playing ? <Square size={14} /> : <Play size={16} />}
      </button>
      {statusNote && (
        <span className="text-[11px] text-[var(--fg)]/70" role="status">
          {statusNote}
        </span>
      )}
    </div>
  );
};
