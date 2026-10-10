'use client';

import React, { useState } from 'react';
import { Loader2, Play, Square } from 'lucide-react';

const VOICES = [
  { id: 'eve', name: 'Eve (Energetic)' },
  { id: 'ara', name: 'Ara (Warm)' },
  { id: 'standard', name: 'Standard (Authoritative)' },
  { id: 'rex', name: 'Rex (Confident)' },
  { id: 'sal', name: 'Sal (Smooth)' },
];

export const ReadAloud = ({ text }: { text: string }) => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState('eve');
  const [audio] = useState(() => new Audio());

  const handleRead = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice_id: voice, language: 'en' }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Voice service unavailable');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audio.src = url;
      audio.onended = () => { setPlaying(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setPlaying(false); URL.revokeObjectURL(url); };
      await audio.play();
      setPlaying(true);
    } catch (error) {
      setPlaying(false);
      alert(error instanceof Error ? error.message : 'TTS Error');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={voice}
        onChange={(event) => setVoice(event.target.value)}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-glass)] p-2 text-xs text-[var(--fg)]"
      >
        {VOICES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <button
        onClick={playing ? handleStop : () => void handleRead()}
        disabled={loading}
        className="rounded-full bg-blue-500/20 p-2 text-blue-400 hover:bg-blue-500/40 disabled:opacity-50"
        aria-label={playing ? 'Stop reading aloud' : 'Read aloud'}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : playing ? <Square size={14} /> : <Play size={16} />}
      </button>
    </div>
  );
};
