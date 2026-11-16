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

export const ReadAloud = ({ text }: { text: string }) => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState('eve');
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

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

  const speakWithBrowserFallback = (content: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setStatusNote('Read-aloud is unavailable in this browser.');
      setPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={voice}
        onChange={(event) => setVoice(event.target.value)}
        aria-label="Read aloud voice"
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
      {statusNote && (
        <span className="text-[11px] text-[var(--fg)]/70" role="status">
          {statusNote}
        </span>
      )}
    </div>
  );
};
