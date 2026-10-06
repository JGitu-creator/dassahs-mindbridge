import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: process.env.ROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.ROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://dassahs-mindbridge.vercel.app',
    'X-Title': process.env.APP_NAME || "Dassah's Mindbridge",
  },
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const content = body.content || body.text || body.prompt || '';

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    // Added 'as any' so TypeScript accepts OpenRouter's fallback models parameter
    const completion = (await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content:
            "You are an expert cognitive simplifier in Dassah's Prism. Simplify and structure the provided text into clear, digestible, executive insights with zero unnecessary fluff.",
        },
        {
          role: 'user',
          content: content,
        },
      ],
      ...({
        models: [
          'google/gemini-2.0-flash-001',
          'apodex/apodex-1.1-mini:free',
          'inclusionai/ling-3.0-flash-sante:free',
          'openrouter/free',
          'meta-llama/llama-3.3-70b-instruct:free',
        ],
      } as any),
    } as any)) as any;

    const simplifiedText = completion.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      simplified: simplifiedText,
      result: simplifiedText,
      choices: [{ message: { content: simplifiedText } }],
    });
  } catch (error: any) {
    console.error('Simplify Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to simplify content' },
      { status: 500 }
    );
  }
}
