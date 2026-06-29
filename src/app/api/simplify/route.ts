import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { tokenLogger } from '@/lib/tokenLogger';

const apiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const deepseekKey = process.env.DEEPSEEK_API_KEY;

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { 
      text = '', 
      mode, 
      question, 
      context, 
      isScenic, 
      cognitiveMode, 
      missionGoal, 
      isStory, 
      simplicityLevel
    } = await req.json();

    // --- CONTEXT WINDOW PROTECTION ---
    const ABSOLUTE_MAX_CHARS = 150000; 
    const CHUNK_SIZE = 25000;

    if (text.length > ABSOLUTE_MAX_CHARS) {
      return NextResponse.json({ 
        error: 'Neural Link Overload: Document exceeds maximum sovereign bandwidth (150k chars). Please split your noise into smaller volumes.' 
      }, { status: 413 });
    }

    if (!text && mode !== 'chat' && mode !== 'council_review') {
      return NextResponse.json({ error: 'Valid input is required.' }, { status: 400 });
    }

    if (mode === 'chat') {
      const chatPrompt = `You are "Ask DJ," a Sovereign Guide. Answer the following question based on the context provided.\\n\\nContext: ${context}\\n\\nQuestion: ${question}`;
      const responseText = await callProvider(chatPrompt);
      return NextResponse.json({ answer: responseText });
    }

    // --- CHUNKED REFRACTION LOGIC ---
    const chunksOfText = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      chunksOfText.push(text.substring(i, i + CHUNK_SIZE));
    }

    const refractionResults = [];
    for (const chunkText of chunksOfText) {
      const generationPrompt = `
        You are "Ask DJ," a Sovereign Guide. Your mission is to perform a Deep Neural Refraction on the provided Noise.
        
        GOAL: ${missionGoal || 'Discovery'}
        TARGET COGNITIVE MODE: ${cognitiveMode}

        --- STEP 1: INTERNAL NEURAL SCAN (THOUGHT PROCESS) ---
        Perform a silent, deep analysis of the text. 
        Identify:
        1. The core "Signal" vs the "Noise".
        2. The foundational "Logic Roots" (First Principles) for every key concept.
        3. "Dopamine Hooks" (High-interest elements).
        4. "Structural Anchors" (Important facts).

        --- STEP 2: TRANSMUTATION (FINAL JSON OUTPUT) ---
        Output ONLY a valid JSON object. Do not include any text before or after the JSON.

        The JSON must follow this structure:
        {
          "tldr": ["string", "string", "string"],
          "whyCare": "string",
          "readingTime": "string",
          "chunks": [
            {
              "heading": "string",
              "content": "string",
              "summary": "string",
              "keyTerms": ["string"],
              "metaphor": "string",
              "dopamineHook": "string",
              "logicRoot": "string",
              "citations": "string"
            }
          ],
          "actions": [
            { "task": "string", "priority": "high" | "medium" | "low" }
          ],
          "chartData": null
        }

        INPUT NOISE:
        ${chunkText}
      `;
      
      try {
        const responseText = await callProvider(generationPrompt);
        if (responseText) {
          refractionResults.push(extractJSON(responseText));
        }
      } catch (e) {
        console.error(`Chunk refraction failed:`, e);
        // Skip this chunk and continue with others
      }
    }

    if (refractionResults.length === 0) {
      console.error('All Neural Bridges failed to refract any chunks. Triggering Scout Mode.');
      return NextResponse.json({
        error: 'High-speed link saturated. Scout Mode active.',
        tldr: ['Structural scan complete.'],
        whyCare: 'API unavailable, showing local structural metrics.',
        readingTime: `${Math.round(text.split(/\s+/).length / 200)}m`,
        chunks: [{
          heading: 'Structural Analysis',
          content: text.substring(0, 500) + '...',
          summary: 'Scout Mode active.',
          keyTerms: text.split(/\s+/).slice(0, 5),
          metaphor: 'N/A',
          dopamineHook: 'N/A',
          logicRoot: 'N/A',
          citations: 'N/A'
        }],
        actions: [],
        chartData: null
      }, { status: 200 });
    }

    // --- MERGING RESULTS ---
    const mergedData = {
      tldr: [],
      whyCare: refractionResults[0]?.whyCare || "Focus was interrupted.",
      readingTime: `${Math.round(text.split(/\s+/).length / 200)}m`,
      chunks: [],
      actions: [],
      chartData: null
    };

    refractionResults.forEach(res => {
      if (res.tldr) mergedData.tldr.push(...res.tldr);
      if (res.chunks) mergedData.chunks.push(...res.chunks);
      if (res.actions) mergedData.actions.push(...res.actions);
    });

    mergedData.tldr = [...new Set(mergedData.tldr)].slice(0, 6);
    mergedData.actions = Array.from(new Map(mergedData.actions.map(a => [a.task, a])).values());

    const validatedData = {
      tldr: mergedData.tldr.length ? mergedData.tldr : ["No summary generated"],
      whyCare: mergedData.whyCare,
      readingTime: mergedData.readingTime,
      chunks: mergedData.chunks.map((c: any) => ({
        heading: c.heading || "Neural Fragment",
        content: c.content || "",
        summary: c.summary || "Segment analyzed.",
        keyTerms: c.keyTerms || [],
        metaphor: c.metaphor || "",
        dopamineHook: c.dopamineHook || "",
        logicRoot: c.logicRoot || "Foundational principle established.",
        citations: c.citations || "Contextual anchor secured."
      })),
      actions: mergedData.actions,
      chartData: mergedData.chartData || null
    };
    
    return NextResponse.json(validatedData);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function callProvider(prompt: string) {
  const tryGemini = async () => {
    if (!apiKey) throw new Error('No Gemini Key');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    tokenLogger('gemini-2.0-flash', 100); 
    return result.response.text();
  };

  const tryOpenAI = async () => {
    if (!openaiKey) throw new Error('No OpenAI Key');
    const openai = new OpenAI({ apiKey: openaiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    tokenLogger('gpt-4o-mini', completion.usage?.total_tokens || 0);
    return completion.choices[0].message.content;
  };

  const tryAnthropic = async () => {
    if (!anthropicKey) throw new Error('No Anthropic Key');
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    tokenLogger('claude-3-5-sonnet-20241022', msg.usage.input_tokens + msg.usage.output_tokens);
    return (msg.content[0] as any).text;
  };

  const tryDeepSeek = async () => {
    if (!deepseekKey) throw new Error('No DeepSeek Key');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${deepseekKey}` },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }]
        }),
        signal: controller.signal
      });
      const data = await res.json();
      return data.choices[0].message.content;
    } finally {
      clearTimeout(timeout);
    }
  };

  const providers = [tryGemini, tryOpenAI, tryAnthropic, tryDeepSeek];
  for (const provider of providers) {
    try {
      const res = await provider();
      if (res) return res;
    } catch (e) {
      console.error(`Provider failed:`, e);
    }
  }
  return '';
}

const extractJSON = (text: string) => {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object found in response');
    return JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    console.error('JSON Extraction Failed:', e);
    throw new Error('The Neural Engine produced a malformed refraction. Please try again.');
  }
};
