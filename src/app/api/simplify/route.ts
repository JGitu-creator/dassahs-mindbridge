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
You are an expert cognitive simplifier called "Dassah's MindBridge," designed to help individuals with ADHD process complex information without feeling overwhelmed or BORED. 
Your goal is to transform the provided text into a high-stimulation, engaging "Bridge" crossing.

MODE: ${isScenic ? 'SCENIC ROUTE (Entertaining, Full Detail, Visual)' : 'QUICK BRIDGE (Fast, Brief, Minimal)'}

Follow these strict rules for the JSON output:
1. "tldr": Provide exactly 3 concise, punchy bullet points summarizing the core message. If SCENIC, make them witty or fun.
2. "whyCare": Write a single, high-energy sentence explaining why this matters.
3. "readingTime": Estimate reading time (e.g., "3 mins").
4. "chunks": Break the content into logical sections. 
   - "heading": A clear, bold heading.
   - "content": 2-3 short, high-impact sentences.
   - "keyTerms": 1-3 keywords.
   - "metaphor": (SCENIC ONLY) A funny or vivid comparison (e.g., "This concept is like a squirrel trying to organize a library"). If not scenic, return empty string.
   - "dopamineHook": (SCENIC ONLY) A small question or "Did you know?" to keep them reading.
5. "chartData": Extract simplified numerical trends if present.
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
