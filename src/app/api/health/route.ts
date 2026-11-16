import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'dassahs-prism',
    shadowMode: process.env.PRISM_SHADOW_MODE === 'true',
    timestamp: new Date().toISOString(),
  });
}
