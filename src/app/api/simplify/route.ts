import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

function getCleanBaseUrl() {
  const envUrl = process.env.ROUTER_BASE_URL || process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  return envUrl.replace(/['"]/g, '').trim().replace(/\/+$/, '');
}

function getCleanApiKey() {
  const envKey = process.env.ROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '';
  return envKey.replace(/['"]/g, '').trim();
}

export async function POST(req: Request) {
  try {
    const { text, isScenic, cognitiveMode, missionGoal, isStory, simplicityLevel } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const baseURL = getCleanBaseUrl();
    const apiKey = getCleanApiKey();

    const openai = new OpenAI({
      baseURL,
      apiKey: apiKey || 'dummy-key',
    });

    const systemPrompt = `You are Dassah's Prism Neural Core. Transform noisy, overwhelming text into structured clarity for executive function and ADHD focus.
Output ONLY valid JSON matching this schema:
{
  "tldr": ["Key point 1", "Key point 2", "Key point 3"],
  "whyCare": "Short punchy statement why this matters",
  "readingTime": "X min",
  "chunks": [
    {
      "heading": "Section Heading",
      "content": "Clear distilled content",
      "summary": "1-sentence summary",
      "keyTerms": ["term1", "term2"],
      "metaphor": "Relatable metaphor",
      "dopamineHook": "Engaging hook"
    }
  ],
  "actions": [
    { "task": "Actionable task", "priority": "high" }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'openrouter/free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Text to refract:\n${text.slice(0, 4000)}` },
      ],
      extra_body: {
        models: [
          'openrouter/free',
          'apodex/apodex-1.1-mini:free',
          'inclusionai/ling-3.0-flash-sante:free',
          'meta-llama/llama-3.3-70b-instruct:free',
        ],
      } as any,
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawContent);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Refraction API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process refraction' },
      { status: 500 }
    );
  }
}
