import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the single OpenRouter client
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

/**
 * Intelligent Router: Classifies complexity, then routes to appropriate Tier.
 */
async function classifyComplexity(content: string): Promise<'light' | 'standard' | 'complex'> {
  const wordCount = content.split(/\s+/).length;
  const sentenceCount = Math.max(1, content.split(/[.!?]+/).length);
  const avgSentenceLength = wordCount / sentenceCount;

  // Complexity Heuristics
  const isHighDensity = avgSentenceLength > 20;
  const isTechnical = /algorithm|framework|infrastructure|constitutional|regulatory/i.test(content);

  if (wordCount < 500 && !isHighDensity && !isTechnical) return 'light';
  if (wordCount < 2000 && !isHighDensity) return 'standard';
  return 'complex';
}

/**
 * Computes basic text metrics locally as an absolute emergency fallback.
 */
function computeLocalMetrics(content: string) {
  const wordCount = content.split(/\s+/).length;
  const sentenceCount = Math.max(1, content.split(/[.!?]+/).length);
  return {
    wordCount,
    readabilityEstimate: wordCount / sentenceCount > 20 ? 'High' : 'Moderate',
    keywords: content.split(/\s+/).slice(0, 5),
    error: 'API unavailable, showing local structural metrics.',
  };
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    const complexity = await classifyComplexity(content);
    return await routeToTier(content, complexity);
  } catch (error: any) {
    console.error('Orchestrator Error:', error);
    return NextResponse.json(computeLocalMetrics(''), { status: 200 });
  }
}

async function routeToTier(content: string, complexity: 'light' | 'standard' | 'complex') {
  let primaryModel = 'anthropic/claude-3.5-sonnet';
  let tierName = 'Sovereign';
  let promptText = content;

  // Tier configuration with zero-cost fallback tail
  let fallbackModels: string[] = [];

  switch (complexity) {
    case 'light':
      tierName = 'Scout';
      primaryModel = 'meta-llama/llama-3.3-70b-instruct';
      promptText = `Analyze the following text. Extract key anchors, executive summary, and sentiment:\n\n${content}`;
      fallbackModels = [
        'meta-llama/llama-3.3-70b-instruct',
        'google/gemini-2.0-flash-001',
        'openrouter/free',
        'meta-llama/llama-3.3-70b-instruct:free',
      ];
      break;

    case 'standard':
      tierName = 'Analyst';
      primaryModel = 'google/gemini-2.0-flash-001';
      fallbackModels = [
        'google/gemini-2.0-flash-001',
        'anthropic/claude-3.5-sonnet',
        'openrouter/free',
        'meta-llama/llama-3.3-70b-instruct:free',
      ];
      break;

    case 'complex':
    default:
      tierName = 'Sovereign';
      primaryModel = 'anthropic/claude-3.5-sonnet';
      fallbackModels = [
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4o',
        'google/gemini-2.0-flash-001',
        'openrouter/free',
        'meta-llama/llama-3.3-70b-instruct:free',
      ];
      break;
  }

  const completion = await client.chat.completions.create({
    model: primaryModel,
    messages: [
      {
        role: 'system',
        content:
          "You are the Sovereign Guide in Dassah's Prism. Provide high-fidelity cognitive refractions, concise anchors, and structural analysis.",
      },
      {
        role: 'user',
        content: promptText,
      },
    ],
    extraBody: {
      models: fallbackModels,
    },
  });

  const responseText = completion.choices?.[0]?.message?.content || '';

  // Returns both frontend-friendly formats so all UI components and TTS receive data
  return NextResponse.json({
    tier: tierName,
    response: responseText,
    choices: [
      {
        message: {
          content: responseText,
        },
      },
    ],
    resolvedModel: completion.model,
  });
}
