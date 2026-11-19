import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'dassahs-prism',
    shadowMode: process.env.PRISM_SHADOW_MODE === 'true',
    providers: {
      groq: Boolean(process.env.GROQ_API_KEY?.trim()),
      openrouter: Boolean((process.env.OPENROUTER_API_KEY || process.env.ROUTER_API_KEY)?.trim()),
      gemini: Boolean(process.env.GEMINI_API_KEY?.trim()),
      local: true,
    },
    timestamp: new Date().toISOString(),
  });
}
