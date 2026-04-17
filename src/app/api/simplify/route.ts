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
    const { text, mode, question, context, isScenic, cognitiveMode } = await req.json();

    if (!text && mode !== 'chat') {
      return NextResponse.json(
        { error: 'Valid input is required.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ['gemini-3.1-pro-preview', 'gemini-2.0-flash', 'gemini-flash-latest'];
    
    const prompt = `
You are an expert cognitive architect called "Dassah's Prism." Your mission is to transmute overwhelming "Noise" into "Divine Clarity" through Deep Discernment.

DEEP DISCERNMENT PROTOCOL:
First, analyze the nature of the INPUT. Categorize it as one of the following and adjust the refraction style accordingly:

1. LEGAL/CONTRACTUAL: If the input is an agreement, lease, or legal document:
   - DO NOT over-simplify vital clauses. Maintain precision of specific terms.
   - Target: 100% Protection.

2. EDUCATIONAL/TECHNICAL: If the input is a school project, concept, or technical guide:
   - Prioritize "Concept Anchoring" and explaining the *mechanism* (the "How").
   - Target: Total Mastery.

3. BUSINESS/CORPORATE: If the input is an email, memo, Slack thread, or report:
   - Prioritize "The Bottom Line" and "Primary Request."
   - Identify implicit deadlines and stakeholders.
   - Target: Professional Sovereignty.

4. MEDICAL/HEALTH: If the input is a lab result, doctor's note, or health guide:
   - Prioritize "Next Steps," "Symptom Context," and "Deciphering Jargon."
   - Target: Health Agency.

5. LITERARY/CASUAL: If the input is a book, article, or story:
   - Focus on high-speed clarity, emotional "Aha!" moments, and plot momentum.
   - Target: Instant Insight.

TARGET AUDIENCE: ${cognitiveMode === 'ceo' ? 'CEO/Executive (Prioritize "Executive Distillation" - ultra-high impact, bottom-line value, rapid decision-making context.)' : 'ADHD/Neurodivergent (Prioritize "Neural Refraction" - dopamine-aligned, high stimulation, fascinating hooks to maintain focus.)'}

PROCESSING MODE: ${isScenic ? 'SCENIC ROUTE (Full immersive journey: Use wild, creative metaphors, fascinating "Did you know?" hooks, and break the text into many small, vibrant segments. Be witty and expansive.)' : 'QUICK FILTER (Ultra-fast extraction: Get the absolute core facts in the shortest time possible. Use minimal segments and extreme brevity.)'}

Follow these strict rules for the JSON output:
1. "tldr": Provide exactly 3 concise, punchy bullet points based on the categorized Nature of the text.
2. "whyCare": A compelling "Mission Anchor" reason why this matters to the user (Safety, Success, or Sovereignty).
3. "readingTime": Estimate total concentration time.
4. "chunks": Break the content into logical, manageable segments. 
   - "heading": A clear, bold, high-impact heading.
   - "content": Based on category: 
     - Legal: Exact Clause + Plain Explanation
     - Educational: Deep Concept Breakdown
     - Business: The Bottom Line + Who/What/When
     - Medical: Results + What this means for your body
     - Literary: Vivid, fast-paced summary
   - "keyTerms": 1-3 critical keywords to anchor the segment.
   - "metaphor": A mandatory, wildly creative or funny comparison to make the concept stick.
   - "dopamineHook": A mandatory "Mind-Blow" fact, curious question, or high-stakes realization.
5. "chartData": Extract numerical trends, KPIs, or comparative data if possible.
6. "actions": Priority-based task list (High/Medium/Low).

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
