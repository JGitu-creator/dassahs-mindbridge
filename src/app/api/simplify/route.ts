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
      simplicityLevel,
      agentName, // For sequential council review
      reviewStep // 'pros' | 'cons' | 'full'
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

    const AGENT_ROLES: Record<string, string> = {
      'Sarah': 'Legal & Family Shield. Focus on Red Flags, safety, and parental consent.',
      'Dr. Helena': 'Institutional Mechanism Hunter. Focus on First Principles and academic/professional mastery.',
      'Marcus': 'Corporate ROI & Social Decoder. Focus on implicit urgency, stakeholder vibe, and quantifiable value (time/money saved).',
      'Maya': 'Markdown Librarian. Focus on high-density structure, the "Soul\'s Lesson," and long-term vaulting.',
      'Leo': 'Dopamine Architect. Focus on "Aha! Moments," emotional core, and high-stimulation hooks.',
      'DJ': 'Sovereign Guide. Orchestrates the flow and ensures alignment with the user\'s ultimate purpose.'
    };

    let generationPrompt = '';

    if (mode === 'council_review' && agentName) {
      generationPrompt = `
        You are ${agentName.toUpperCase()} from the Council of Agents. 
        Your role is: ${AGENT_ROLES[agentName]}
        
        Review the following Noise based EXCLUSIVELY on your role.
        ${reviewStep === 'pros' ? 'Provide only the PROS (Strengths/Opportunities) from your perspective.' : ''}
        ${reviewStep === 'cons' ? 'Provide only the CONS (Risks/Red Flags/Waste) from your perspective.' : ''}
        ${!reviewStep ? 'Provide a brief summary of the Pros and Cons from your perspective.' : ''}

        TEXT TO REVIEW:
        ${text}

        Respond in clean, punchy bullet points. Be fierce in your discernment.
      `;
    } else if (mode === 'chat') {
      generationPrompt = `
        You are an ADHD-friendly assistant called "Ask DJ." 
        Based on the CONTEXT provided below, answer the user's question.
        CONTEXT: ${JSON.stringify(context)}
        USER REQUEST: ${question}
      `;
    } else {
      // Default Refraction Prompt
      generationPrompt = `
      You are the "Council of Agents." Your mission is to perform a Deep Neural Refraction on the provided Noise.
      
      GOAL: ${missionGoal || 'Discovery'}
      TARGET COGNITIVE MODE: ${cognitiveMode}
      ENVIRONMENT: ${isScenic ? 'THE SCENIC ROUTE (Immersive, high-stimulation, metaphor-rich)' : 'DIRECT REFRACTION (Surgical, high-efficiency, minimalist)'}

      --- STEP 1: INTERNAL NEURAL SCAN (THOUGHT PROCESS) ---
      Before generating the final output, perform a silent, deep analysis of the text. 
      Identify:
      1. The core "Signal" vs the "Noise".
      2. The foundational "Logic Roots" (First Principles) for every key concept.
      3. "Red Flags" (Legal, safety, or cognitive risks) that Sarah must flag.
      4. "Dopamine Hooks" (The most interesting, high-interest elements) for Leo.
      5. "Structural Anchors" (The most important facts) for Maya.

      --- STEP 2: TRANSMUTATION (FINAL JSON OUTPUT) ---
      Using the insights from your scan, output ONLY a valid JSON object. 
      Do not include any text before or after the JSON.

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

      SPECIFIC INSTRUCTIONS FOR FIELDS:
      - "heading": If Sarah detects a legal/safety/privacy risk, you MUST prefix this with "⚠️ SARAH'S WARNING: ".
      - "logicRoot": Must be a deep "First Principle" (e.g., "Entropy", "Incentive Alignment", "Cognitive Load").
      - "metaphor": For ${isScenic ? 'Scenic Mode' : 'Direct Mode'}, ensure these are high-impact.
      - "dopamineHook": A high-interest "Aha!" moment or curiosity gap.
      - "citations": The specific "Evidence Anchor" (e.g., Clause #, Stakeholder Name, or context).

      INPUT NOISE:
      ${text}
    `;
    }

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
        console.warn(`Provider failed, shifting focus...`);
      }
    }

    if (!responseText) {
      console.error('All Neural Bridges failed.');
      return NextResponse.json({ error: 'System busy, please try again.' }, { status: 503 });
    }

    if (mode === 'chat' || mode === 'council_review') {
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

    if (mode === 'chat' || mode === 'council_review') {
      return NextResponse.json({ answer: responseText });
    }

    const parsedData = extractJSON(responseText);

    // --- HELENA & SARAH VALIDATION ---

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
