import { NextResponse } from 'next/server';

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

    const isStory = Boolean(storyMode);
    const systemPrompt = isStory
      ? "You are Dassah's Prism in Story Mode. Transform the provided text into an engaging, vivid narrative or conceptual analogy that makes the core insights unforgettable for neurodivergent minds (ADHD/ASD), while strictly preserving every vital fact, number, and key takeaway."
      : "You are Dassah's Prism in Strict Fact Mode. Refract the provided text into crystal-clear, structured clarity: high-signal bullet points, explicit takeaways, key definitions, and actionable next steps. Cut through clutter and cognitive fatigue without losing crucial technical or legal precision.";

    const model = process.env.ROUTER_MODEL || 'openrouter/free';

    // Support large documents up to 30,000 characters
    const contentPayload = text.slice(0, 30000);

    // Direct HTTP fetch to OpenRouter: 100% immune to SDK type errors
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://dassahs-mindbridge.vercel.app',
        'X-Title': "Dassah's Prism",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please refract this text:\n\n${contentPayload}` },
        ],
        models: [
          'openrouter/free',
          'apodex/apodex-1.1-mini:free',
          'meta-llama/llama-3.2-3b-instruct:free',
          'google/gemini-2.0-flash-exp:free',
        ],
        temperature: isStory ? 0.7 : 0.2,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter HTTP error:', response.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter returned status ${response.status}: ${errorText.slice(0, 250)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const refracted = data.choices?.[0]?.message?.content || 'No refraction generated.';

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
