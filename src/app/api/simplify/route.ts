import { NextResponse } from 'next/server';

function cleanBaseUrl(url?: string): string {
  if (!url) return 'https://openrouter.ai/api/v1';
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

    const baseURL = cleanBaseUrl(process.env.ROUTER_BASE_URL || process.env.OPENROUTER_BASE_URL);
    const apiKey = cleanApiKey(process.env.ROUTER_API_KEY || process.env.OPENROUTER_API_KEY);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is missing in Vercel Environment Variables.' },
        { status: 500 }
      );
    }

    const isStory = Boolean(storyMode);
    const systemPrompt = isStory
      ? "You are Dassah's Prism in Story Mode. Transform the provided text into an engaging, memorable narrative or conceptual analogy for neurodivergent minds (ADHD/ASD), preserving all essential facts and takeaways."
      : "You are Dassah's Prism in Strict Fact Mode. Refract the provided text into crystal-clear, structured bullet points, key takeaways, and actionable next steps.";

    const model = process.env.ROUTER_MODEL || 'openrouter/free';

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
          { role: 'user', content: `Text to refract:\n\n${text.slice(0, 25000)}` },
        ],
        // Exactly 2 fallback models (OpenRouter allows max 3)
        models: [
          'openrouter/free',
          'meta-llama/llama-3.2-3b-instruct:free',
        ],
        temperature: isStory ? 0.7 : 0.2,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenRouter returned status ${response.status}: ${errorText.slice(0, 200)}` },
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
    return NextResponse.json(
      { error: err?.message || 'Refraction failed.' },
      { status: 500 }
    );
  }
}
