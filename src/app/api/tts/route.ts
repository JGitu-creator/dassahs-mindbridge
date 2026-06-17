import { NextResponse } from 'next/server';

/**
 * Proxy route for xAI Text-to-Speech to keep API Key secure.
 */
export async function POST(req: Request) {
  const { text, voice_id } = await req.json();

  if (!process.env.XAI_API_KEY) {
    return NextResponse.json({ error: 'XAI_API_KEY not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.x.ai/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_id: voice_id || 'jpi39icg',
        output_format: {
          codec: 'mp3',
          sample_rate: 44100,
          bit_rate: 128000
        },
        language: 'en'
      }),
    });

    if (!response.ok) {
      throw new Error(`xAI TTS API returned ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('xAI TTS Error:', error);
    return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
  }
}
