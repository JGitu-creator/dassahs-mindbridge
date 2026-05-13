import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const deepseekKey = process.env.DEEPSEEK_API_KEY;

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
      You are the "Council of Agents." Transmute this Noise into Divine Clarity.
      Goal: ${missionGoal || 'Discovery'}
      Target: ${cognitiveMode}
      ${isScenic ? 'MODE: THE SCENIC ROUTE. Provide richer, more descriptive content, immersive metaphors, and deeply engaging dopamine hooks. Do not over-simplify; instead, make the journey through the information stimulating and worthwhile.' : 'MODE: DIRECT REFRACTION. Be surgical, punchy, and prioritize maximum efficiency.'}
      
      For every segment (chunk), you MUST provide:
      1. "logicRoot": The specific "First Principle" or foundational truth used to distill this segment.
      2. "citations": A specific "Evidence Anchor" (e.g., Clause #, Stakeholder Name, or Page Context).
      3. Sarah's Audit: If a Legal Red Flag exists, prefix the heading with "⚠️ SARAH'S WARNING".

      Return a valid JSON object:
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
      
      INPUT: ${text}
    `;
    }

    // --- FAILOVER LOGIC ---
    const tryGemini = async () => {
      if (!apiKey) throw new Error('No Gemini Key');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(generationPrompt);
      return result.response.text();
    };

    const tryOpenAI = async () => {
      if (!openaiKey) throw new Error('No OpenAI Key');
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: generationPrompt }],
      });
      return completion.choices[0].message.content;
    };

    const tryAnthropic = async () => {
      if (!anthropicKey) throw new Error('No Anthropic Key');
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      const msg = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: generationPrompt }],
      });
      return (msg.content[0] as any).text;
    };

    const tryDeepSeek = async () => {
      if (!deepseekKey) throw new Error('No DeepSeek Key');
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${deepseekKey}` },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: generationPrompt }]
        })
      });
      const data = await res.json();
      return data.choices[0].message.content;
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

    if (!responseText) throw new Error('All Neural Bridges are down.');

    if (mode === 'chat' || mode === 'council_review') {
      return NextResponse.json({ answer: responseText });
    }

    responseText = responseText.replace(/```json|```/gi, '').trim();
    const parsedData = JSON.parse(responseText);

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
