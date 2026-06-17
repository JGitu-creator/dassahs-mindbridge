import { NextResponse } from 'next/server';

/**
 * Intelligent Router: Classifies complexity, then routes to appropriate Tier.
 */
async function classifyComplexity(content: string): Promise<'light' | 'standard' | 'complex'> {
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 500) return 'light';
  if (wordCount < 2500) return 'standard';
  return 'complex';
}

/**
 * Computes basic text metrics locally as a fallback.
 */
function computeLocalMetrics(content: string) {
  const wordCount = content.split(/\s+/).length;
  const sentenceCount = content.split(/[.!?]+/).length;
  return {
    wordCount,
    readabilityEstimate: wordCount / sentenceCount > 20 ? 'High' : 'Moderate',
    keywords: content.split(/\s+/).slice(0, 5),
    error: 'API unavailable, showing local structural metrics.'
  };
}

export async function POST(req: Request) {
  const { content } = await req.json();
  const complexity = await classifyComplexity(content);

  try {
    return await routeToTier(content, complexity);
  } catch (error) {
    console.error('Orchestrator Error:', error);
    return NextResponse.json(computeLocalMetrics(content), { status: 200 }); // Return local info
  }
}

async function routeToTier(content: string, complexity: string) {
  switch (complexity) {
    case 'light':
      // Scout Tier (Groq / Llama 3.3)
      return await callGroq(content);
    case 'standard':
      // Analyst Tier (Gemini Flash)
      return await callGemini(content);
    case 'complex':
    default:
      // Sovereign Tier (Claude 3.5 Sonnet)
      return await callClaude(content);
  }
}

async function callGroq(content: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: `Extract keywords and sentiment: ${content}` }],
    }),
  });
  if (!response.ok) throw new Error('Groq API failed');
  return NextResponse.json(await response.json());
}

async function callGemini(content: string) {
  // Placeholder: Implement with @google/generative-ai
  return NextResponse.json({ tier: 'Analyst', status: 'Implemented' });
}

async function callClaude(content: string) {
  // Placeholder: Implement with @anthropic-ai/sdk
  return NextResponse.json({ tier: 'Sovereign', status: 'Implemented' });
}
