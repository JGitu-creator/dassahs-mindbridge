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
    const text = body.text || body.content || body.prompt || '';

    if (!text.trim()) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = `${Math.max(1, Math.round(wordCount / 200))} min`;

    const systemPrompt = `You are the Sovereign Guide in Dassah's Prism. Analyze and refract the user's text into clear cognitive structure.
You MUST reply with a single valid JSON object strictly matching this schema (do NOT wrap in markdown code blocks):
{
  "tldr": ["Summary bullet 1", "Summary bullet 2", "Summary bullet 3"],
  "whyCare": "A powerful 1-2 sentence vision statement of why this matters.",
  "readingTime": "${readingTime}",
  "chunks": [
    {
      "heading": "Core Theme Heading",
      "content": "Refracted text content",
      "summary": "1-sentence summary",
      "keyTerms": ["Anchor1", "Anchor2"],
      "metaphor": "An evocative metaphor illustrating the concept",
      "dopamineHook": "An engaging, punchy takeaway"
    }
  ],
  "chartData": null,
  "actions": [
    { "task": "Key priority action item", "priority": "high" }
  ]
}`;

    const completion = (await client.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
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

    const rawResponse = completion.choices?.[0]?.message?.content || '{}';
    let parsedData: any;

    try {
      // Strip markdown code fences if model enclosed them
      const cleanJson = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (parseError) {
      // Graceful fallback structure if model returned plain text
      parsedData = {
        tldr: [rawResponse.slice(0, 100) + '...'],
        whyCare: rawResponse.slice(0, 150),
        readingTime,
        chunks: [
          {
            heading: 'Refracted Clarity',
            content: rawResponse,
            summary: rawResponse.slice(0, 80),
            keyTerms: ['Clarity', 'Focus'],
            metaphor: 'A beacon cutting through cognitive fog.',
            dopamineHook: 'Clarity locked.',
          },
        ],
        chartData: null,
        actions: [{ task: 'Review key insights', priority: 'high' }],
      };
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Simplify Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to simplify content' },
      { status: 500 }
    );
  }
}
