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
    const { text, mode, question, context, isScenic } = await req.json();

    if (!text && mode !== 'chat') {
      return NextResponse.json(
        { error: 'Valid input is required.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    if (mode === 'chat') {
      const chatPrompt = `
        You are an ADHD-friendly assistant. Based on the following context, answer the user's question in 1-2 very simple, encouraging sentences. 
        Use bullet points if listing things. 
        
        CONTEXT:
        ${JSON.stringify(context)}
        
        USER QUESTION:
        ${question}
      `;
      const result = await model.generateContent(chatPrompt);
      return NextResponse.json({ answer: result.response.text() });
    }

    const prompt = `
You are an expert cognitive simplifier called "Dassah's Dassah Magic," designed to help individuals with ADHD process complex information without feeling overwhelmed or BORED. 
Your goal is to transform the provided text into a high-stimulation, engaging "Filter" crossing.

MODE: ${isScenic ? 'SCENIC ROUTE (Full immersive journey: Use wild, creative metaphors, fascinating "Did you know?" hooks, and break the text into many small, vibrant segments. Be witty and expansive.)' : 'QUICK FILTER (Ultra-fast extraction: Get the absolute core facts in the shortest time possible. Use minimal segments and extreme brevity.)'}

Follow these strict rules for the JSON output:
1. "tldr": Provide exactly 3 concise, punchy bullet points. If SCENIC, make them very entertaining and bold.
2. "whyCare": A high-energy, compelling reason why this matters.
3. "readingTime": Estimate reading time.
4. "chunks": Break the content into logical sections. 
   - "heading": A clear, bold, catchy heading.
   - "content": SCENIC: 3-4 vivid sentences. QUICK: 1 short sentence.
   - "keyTerms": 1-3 keywords.
   - "metaphor": (SCENIC ONLY) A mandatory, wildly creative or funny comparison. If QUICK, return empty string.
   - "dopamineHook": (SCENIC ONLY) A mandatory "Mind-Blow" fact or curious question. If QUICK, return empty string.
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().replace(/^```json/g, '').replace(/```$/g, '').trim();
    
    try {
      const parsedData = JSON.parse(responseText);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", responseText);
      return NextResponse.json(
        { error: 'Failed to generate structured data from AI.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Simplification API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during processing.' },
      { status: 500 }
    );
  }
}
