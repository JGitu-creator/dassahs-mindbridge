import { NextResponse } from 'next/server';

function cleanUrl(url?: string, defaultUrl: string = ''): string {
  if (!url) return defaultUrl;
  const match = url.match(/https?:\/\/[^\s\)\]\"\']+/);
  if (match) return match[0].replace(/\/+$/, '');
  return defaultUrl;
}

function cleanKey(key?: string): string {
  if (!key) return '';
  return key.replace(/['"\s]/g, '');
}

function parseRefractionResponse(raw: string) {
  const clean = raw.trim().replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  
  try {
    const data = JSON.parse(clean);
    if (data && typeof data === 'object') {
      if (!Array.isArray(data.tldr) || data.tldr.length === 0) {
        const fallback = data.summary || data.simplified || raw.slice(0, 300);
        data.tldr = [String(fallback)];
      }
      return data;
    }
  } catch (e) {
    // Non-JSON response
  }

  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const bullets = lines
    .filter(l => l.startsWith('-') || l.startsWith('*') || l.startsWith('•') || /^\d+[\.\)]/.test(l))
    .map(l => l.replace(/^[•\-\*\d\.\s]+/, '').trim());

  const tldr = bullets.length > 0 ? bullets : (lines.length > 0 ? lines.slice(0, 4) : [raw.slice(0, 300) || 'Summary generated.']);

  return {
    tldr,
    summary: tldr[0] || 'Summary generated.',
    keyPoints: bullets.length > 0 ? bullets : tldr,
    takeaways: tldr,
    actionItems: tldr,
    simplified: raw,
    result: raw,
    refractedText: raw,
    text: raw,
  };
}

export async function POST(req: Request) {
  try {
    const { text, mode, storyMode } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        parseRefractionResponse('Please provide text to refract.')
      );
    }

    const isStory = Boolean(storyMode);
    const systemPrompt = isStory
      ? "You are Dassah's Prism in Story Mode. Transform the provided text into an engaging, memorable narrative or conceptual analogy for neurodivergent minds (ADHD/ASD), preserving all essential facts, numbers, and takeaways. Present key points with clear bullet points."
      : "You are Dassah's Prism in Strict Fact Mode. Refract the provided text into crystal-clear, structured bullet points, key takeaways, and actionable next steps. Cut all cognitive clutter and fluff.";

    const contentPayload = text.slice(0, 25000);

    // 1. Primary: Abacus.ai
    const abacusKey = cleanKey(process.env.ABACUS_API_KEY);
    const abacusBase = cleanUrl(process.env.ABACUS_BASE_URL, '[https://api.abacus.ai/v1](https://api.abacus.ai/v1)');
    const abacusModel = process.env.ABACUS_MODEL || 'gpt-4o';

    let rawResult: string | null = null;
    let usedProvider = 'abacus';

    if (abacusKey) {
      try {
        const abacusRes = await fetch(`${abacusBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${abacusKey}`,
          },
          body: JSON.stringify({
            model: abacusModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Please refract this text:\n\n${contentPayload}` },
            ],
            temperature: isStory ? 0.7 : 0.2,
            max_tokens: 2500,
          }),
        });

        if (abacusRes.ok) {
          const abacusData = await abacusRes.json();
          rawResult = abacusData.choices?.[0]?.message?.content || null;
        }
      } catch (abacusErr) {
        console.warn('Abacus fallback to OpenRouter:', abacusErr);
      }
    }

    // 2. Fallback: OpenRouter
    if (!rawResult) {
      usedProvider = 'openrouter';
      const routerKey = cleanKey(process.env.ROUTER_API_KEY || process.env.OPENROUTER_API_KEY);
      const routerBase = cleanUrl(process.env.ROUTER_BASE_URL || process.env.OPENROUTER_BASE_URL, '[https://openrouter.ai/api/v1](https://openrouter.ai/api/v1)');
      const routerModel = process.env.ROUTER_MODEL || 'openrouter/free';

      if (!routerKey) {
        return NextResponse.json(
          parseRefractionResponse('Please configure an API key in Vercel.')
        );
      }

      const routerRes = await fetch(`${routerBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${routerKey}`,
          'HTTP-Referer': '[https://dassahs-mindbridge.vercel.app](https://dassahs-mindbridge.vercel.app)',
          'X-Title': "Dassah's Prism",
        },
        body: JSON.stringify({
          model: routerModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Please refract this text:\n\n${contentPayload}` },
          ],
          models: [
            'openrouter/free',
            'meta-llama/llama-3.2-3b-instruct:free',
          ],
          temperature: isStory ? 0.7 : 0.2,
          max_tokens: 2500,
        }),
      });

      if (routerRes.ok) {
        const routerData = await routerRes.json();
        rawResult = routerData.choices?.[0]?.message?.content || null;
      }
    }

    const structured = parseRefractionResponse(rawResult || 'Refraction could not be generated. Please try again.');

    return NextResponse.json({
      ...structured,
      provider: usedProvider,
    });
  } catch (err: any) {
    return NextResponse.json(
      parseRefractionResponse(`Refraction temporarily unavailable: ${err?.message || 'Unknown error'}`)
    );
  }
}
