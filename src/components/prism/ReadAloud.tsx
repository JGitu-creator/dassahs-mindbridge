import React, { useState } from 'react';
import { Volume2, Loader2, Play, Pause } from 'lucide-react';

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
  const [audio] = useState(new Audio());

  const handleRead = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice_id: voice, language: 'en' })
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audio.src = url;
      audio.play();
      setPlaying(true);
    } catch (e) {
      alert("TTS Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select value={voice} onChange={(e) => setVoice(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs">
        {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
      </select>
      <button onClick={handleRead} className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/40">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
      </button>
    </div>
  );
};
