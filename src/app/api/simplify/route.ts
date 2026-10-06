import { NextResponse } from 'next/server';
import OpenAI from 'openai';

function cleanBaseUrl(url?: string): string {
  if (!url) return 'https://openrouter.ai/api/v1';
  // Extracts clean http(s) URL even if wrapped in markdown [url](url) or quotes
  const match = url.match(/https?:\/\/[^\s\)\]\"\']+/);
  if (match) return match[0].replace(/\/+$/, '');
  return 'https://openrouter.ai/api/v1';
}

function cleanApiKey(key?: string): string {
  if (!key) return '';
  return key.replace(/['"\s]/g, '');
}

export async function POST(req: Request) {
  try {
    const { text, mode, storyMode } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required for refraction.' },
        { status: 400 }
      );
    }

    const rawBaseUrl = process.env.ROUTER_BASE_URL || process.env.OPENROUTER_BASE_URL;
    const baseURL = cleanBaseUrl(rawBaseUrl);
    const rawApiKey = process.env.ROUTER_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    const apiKey = cleanApiKey(rawApiKey);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is missing. Please configure ROUTER_API_KEY in Vercel Environment Variables.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey,
      baseURL,
      defaultHeaders: {
        'HTTP-Referer': 'https://dassahs-mindbridge.vercel.app',
        'X-Title': "Dassah's Prism",
      },
    });

    const isStory = Boolean(storyMode);
    const systemPrompt = isStory
      ? "You are Dassah's Prism in Story Mode. Transform the given complex text into an engaging, vivid narrative or conceptual analogy that makes the core insights unforgettable and accessible for neurodivergent minds (ADHD/ASD), while keeping essential factual accuracy."
      : "You are Dassah's Prism in Strict Fact Mode. Refract the given text into crystal-clear, structured clarity: high-signal bullet points, explicit takeaways, key definitions, and actionable next steps. Cut through clutter and cognitive fatigue without losing crucial technical or legal precision.";

    const model = process.env.ROUTER_MODEL || 'openrouter/free';

    // (openai.chat.completions.create as any) bypasses strict TS type checks for extra_body fallback models
    const completion = await (openai.chat.completions.create as any)({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Text to refract:\n${text.slice(0, 4000)}` },
      ],
      extra_body: {
        models: [
          'openrouter/free',
          'apodex/apodex-1.1-mini:free',
          'meta-llama/llama-3.2-3b-instruct:free',
          'google/gemini-2.0-flash-exp:free',
        ],
      },
      temperature: isStory ? 0.7 : 0.2,
      max_tokens: 1500,
    });

    const refracted = completion.choices?.[0]?.message?.content || 'No refraction generated.';

    return NextResponse.json({
      simplified: refracted,
      result: refracted,
      refractedText: refracted,
      text: refracted,
    });
  } catch (err: any) {
    console.error('Refraction API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to refract text. Please verify your OpenRouter configuration.' },
      { status: 500 }
    );
  }
}
