import { NextResponse } from 'next/server';

const MOOD_INSTRUCTIONS: Record<string, string> = {
  focused: 'Speak clearly and steadily with calm professional focus. Use short natural pauses.',
  soothing: 'Speak gently, warmly, and slowly. Make the listener feel safe and unhurried.',
  energetic: 'Speak with bright energy and forward momentum, while remaining easy to understand.',
  encouraging: 'Speak warmly and positively, like a supportive coach celebrating the next small step.',
};

export async function POST(req: Request) {
  let body: { text?: string; voice_id?: string; language?: string; mood?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid TTS request payload.' }, { status: 400 });
  }

  const rawText = typeof body.text === 'string' ? body.text.trim() : '';
  if (!rawText) return NextResponse.json({ error: 'Text is required.' }, { status: 400 });
  if (!process.env.XAI_API_KEY) {
    return NextResponse.json({ error: 'Premium voice service is not configured. Using browser voice instead.' }, { status: 503 });
  }

  const text = rawText.length > 4000 ? `${rawText.slice(0, 3997).replace(/\s+\S*$/, '')}...` : rawText;
  const { voice_id, language, mood = 'focused' } = body;

  try {
    const response = await fetch('https://api.x.ai/v1/tts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        text,
        voice_id: voice_id || 'eve',
        language: language || 'en',
        instructions: MOOD_INSTRUCTIONS[mood] || MOOD_INSTRUCTIONS.focused,
        output_format: { codec: 'mp3', sample_rate: 44100, bit_rate: 128000 },
      }),
    });
    if (!response.ok) throw new Error(`xAI TTS API returned ${response.status}`);
    return new NextResponse(await response.arrayBuffer(), { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('xAI TTS Error:', error);
    return NextResponse.json({ error: 'Voice service timed out or is unavailable. Using browser voice instead.' }, { status: 502 });
  }
}
