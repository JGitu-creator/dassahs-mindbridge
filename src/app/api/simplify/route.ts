import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API key is not configured.' },
      { status: 500 }
    );
  }

  try {
    const { text, mode, question, context, isScenic, cognitiveMode, missionGoal } = await req.json();

    if (!text && mode !== 'chat') {
      return NextResponse.json(
        { error: 'Valid input is required.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ['gemini-2.0-flash', 'gemini-flash-latest'];
    
    const prompt = `
You are an expert cognitive architect called "Dassah's Prism." Your mission is to transmute overwhelming "Noise" into "Divine Clarity" through Deep Discernment. You are a fierce advocate for the user's sovereignty.

USER MISSION GOAL: ${missionGoal || 'Discovery & Clarity'}

DEEP DISCERNMENT PROTOCOL:
First, perform a hidden "Sovereign Audit" of the INPUT. Identify the category and adopt the corresponding "Refraction Role":

1. LEGAL (The "Legal Shield"):
   - Specifically hunt for "Red Flags" (Auto-renewals, hidden costs, data selling).
   - Prefix any dangerous chunk heading with "⚠️ SOVEREIGN WARNING".
   - Target: 100% Protection.

2. EDUCATIONAL (The "Mechanism Hunter"):
   - Prioritize "First Principles." Find the one foundational truth that makes the whole topic click.
   - Target: Total Mastery.

3. BUSINESS (The "Social Decoder"):
   - Prioritize "Implicit Urgency" and "Stakeholder Vibe." Who is waiting on the user? What is the real deadline?
   - Target: Professional Sovereignty.

4. MEDICAL (The "Body Advocate"):
   - Prioritize "Patient Agency." Provide 3 specific questions the user should ask their doctor based on this data.
   - Target: Health Agency.

5. LITERARY/CASUAL (The "Intel Safari"):
   - Focus on "Aha! Moments," emotional core, and plot momentum.
   - Target: Instant Insight.

TARGET AUDIENCE: ${cognitiveMode === 'ceo' ? 'CEO/Executive (Prioritize "Executive Distillation" - ultra-high impact, bottom-line value, rapid decision-making context.)' : 'ADHD/Neurodivergent (Prioritize "Neural Refraction" - dopamine-aligned, high stimulation, fascinating hooks to maintain focus.)'}

PROCESSING MODE: ${isScenic ? 'SCENIC ROUTE (Full immersive journey: Use wild, creative metaphors, fascinating "Did you know?" hooks, and break the text into many small, vibrant segments. Be witty and expansive.)' : 'QUICK FILTER (Ultra-fast extraction: Get the absolute core facts in the shortest time possible. Use minimal segments and extreme brevity.)'}

Follow these strict rules for the JSON output:
1. "tldr": Exactly 3 concise, punchy bullet points.
2. "whyCare": A compelling "Mission Anchor" reason (Safety, Success, or Sovereignty).
3. "readingTime": Estimate concentration time.
4. "chunks": 
   - "heading": High-impact (Add ⚠️ if Legal Red Flag found).
   - "content": Based on role: 
     - Legal: Trap detection + Plain Explanation.
     - Educational: First Principles breakdown.
     - Business: The Social Decoder (Who/What/When + Vibe).
     - Medical: The Body Advocate (Results + Questions for Doctor).
     - Literary: Vivid, fast-paced "Aha!" moments.
   - "keyTerms": 1-3 keywords.
   - "metaphor": Mandatory creative/funny comparison.
   - "dopamineHook": Mandatory "Mind-Blow" fact or high-stakes realization.
5. "chartData": Extract numerical trends if possible.
6. "actions": Priority-based task list.

Respond ONLY with a valid JSON object matching the exact structure below:
{
  "tldr": ["string", "string", "string"],
  "whyCare": "string",
  "readingTime": "string",
  "chunks": [
    {
      "heading": "string",
      "content": "string",
      "keyTerms": ["string", "string"],
      "metaphor": "string",
      "dopamineHook": "string"
    }
  ],
  "chartData": {
    "type": "bar" | "line" | "pie",
    "data": [ { "name": "string", "value": number } ]
  } | null,
  "actions": [ { "task": "string", "priority": "high" | "medium" | "low" } ]
}

INPUT:
${text}
`;

    let responseText = '';
    let lastError: any = null;

    const generationPrompt = mode === 'chat' ? `
        You are an ADHD-friendly assistant. Based on the following context, answer the user's question in 1-2 very simple, encouraging sentences. 
        Use bullet points if listing things. 
        
        CONTEXT:
        ${JSON.stringify(context)}
        
        USER QUESTION:
        ${question}
      ` : prompt;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });
        
        const result = await model.generateContent(generationPrompt);
        const response = await result.response;
        responseText = response.text();
        
        if (responseText) {
          console.log(`Neural Refraction successful using ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or saturated. Shifting focus...`);
        lastError = err;
        continue;
      }
    }

    if (!responseText) {
      throw new Error(`The Neural Prism is currently saturated. Please try again in a few moments. (Details: ${lastError?.message})`);
    }

    // Chat mode has simple text response
    if (mode === 'chat') {
      return NextResponse.json({ answer: responseText });
    }

    // Better cleaning: remove markdown blocks and any leading/trailing whitespace
    responseText = responseText.replace(/```json|```/gi, '').trim();
    
    try {
      const parsedData = JSON.parse(responseText);
      
      // Ensure essential fields exist to prevent client crashes
      const validatedData = {
        tldr: parsedData.tldr || ["No summary generated"],
        whyCare: parsedData.whyCare || "Focus was interrupted.",
        readingTime: parsedData.readingTime || "1m",
        chunks: parsedData.chunks || [{ heading: "Neural Hiccup", content: "AI failed to segment.", keyTerms: [], metaphor: "", dopamineHook: "" }],
        chartData: parsedData.chartData || null,
        actions: parsedData.actions || []
      };
      
      return NextResponse.json(validatedData);
    } catch (parseError) {
      console.error("Failed to parse Gemini output. Raw response:", responseText);
      return NextResponse.json(
        { error: 'Prism Refraction failed. AI output was not in the correct format.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Simplification API Error:', error);
    const errorMessage = error.message || 'An unexpected error occurred during processing.';
    return NextResponse.json(
      { error: `Neural Prism Error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
