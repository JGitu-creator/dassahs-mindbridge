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
    const MAX_CHARS = 30000; // Approx 7-8k tokens
    if (text.length > MAX_CHARS) {
      return NextResponse.json({ 
        error: 'Neural Link Overload: The document is too large for a single refraction. Please paste smaller segments or summarize the core noise first.' 
      }, { status: 413 });
    }

    if (!text && mode !== 'chat' && mode !== 'council_review') {
      return NextResponse.json({ error: 'Valid input is required.' }, { status: 400 });
    }

    // Unified Refraction Logic
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
      ${text}
    `;

// --- FAILOVER LOGIC ---
    const tryGemini = async () => {
      if (!apiKey) throw new Error('No Gemini Key');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(generationPrompt);
      const response = result.response;
      // In a real scenario, calculate tokens used
      tokenLogger('gemini-2.0-flash', 100); 
      return response.text();
    };

    const tryOpenAI = async () => {
      if (!openaiKey) throw new Error('No OpenAI Key');
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: generationPrompt }],
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
        messages: [{ role: "user", content: generationPrompt }],
      });
      tokenLogger('claude-3-5-sonnet-20241022', msg.usage.input_tokens + msg.usage.output_tokens);
      return (msg.content[0] as any).text;
    };


    const tryDeepSeek = async () => {
      if (!deepseekKey) throw new Error('No DeepSeek Key');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      try {
        const res = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${deepseekKey}` },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: generationPrompt }]
          }),
          signal: controller.signal
        });
        const data = await res.json();
        return data.choices[0].message.content;
      } finally {
        clearTimeout(timeout);
      }
    };

    let responseText = '';
    const providers = [tryGemini, tryOpenAI, tryAnthropic, tryDeepSeek];

    for (const provider of providers) {
      try {
        responseText = await provider() || '';
        if (responseText) break;
      } catch (e) {
        console.error(`Provider ${provider.name} failed:`, e);
      }
    }

    if (!responseText) {
      console.error('All Neural Bridges failed.');
      // Fallback: Scout Mode (Local Metrics)
      const localMetrics = {
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
      };
      return NextResponse.json(localMetrics, { status: 200 });
    }

    if (mode === 'chat') {
      return NextResponse.json({ answer: responseText });
    }

    // --- ROBUST JSON EXTRACTION ---
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

    if (mode === 'chat') {
      return NextResponse.json({ answer: responseText });
    }

    const parsedData = extractJSON(responseText);

    const validatedData = {
      tldr: parsedData.tldr || ["No summary generated"],
      whyCare: parsedData.whyCare || "Focus was interrupted.",
      readingTime: parsedData.readingTime || "1m",
      chunks: (parsedData.chunks || []).map((c: any) => ({
        heading: c.heading || "Neural Fragment",
        content: c.content || "",
        summary: c.summary || "Segment analyzed.",
        keyTerms: c.keyTerms || [],
        metaphor: c.metaphor || "",
        dopamineHook: c.dopamineHook || "",
        logicRoot: c.logicRoot || "Foundational principle established.",
        citations: c.citations || "Contextual anchor secured."
      })),
      actions: parsedData.actions || [],
      chartData: parsedData.chartData || null
    };
    
    return NextResponse.json(validatedData);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
