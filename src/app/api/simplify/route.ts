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
    const { text, mode, question, context } = await req.json();

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
You are an expert cognitive simplifier designed to help individuals with ADHD process complex information without feeling overwhelmed. 
Your goal is to take the provided text or data and break it down into highly scannable, structured chunks.

Follow these strict rules:
1. "tldr": Provide exactly 3 concise, punchy bullet points summarizing the core message.
2. "whyCare": Write a single, engaging sentence explaining why the reader should care about this information.
3. "readingTime": Estimate the reading time of the original text (e.g., "5 mins").
4. "chunks": Break the main content into logical sections. Each section must have:
   - "heading": A clear, bold heading.
   - "content": 2-3 short, simple sentences explaining the core concept of this section. DO NOT write long paragraphs.
   - "keyTerms": An array of 1-3 important keywords or concepts from this chunk.
5. "chartData": If the input contains numerical trends, categories, or tabular data, extract a simplified dataset for a chart. 
   - "type": Choose "bar", "line", or "pie".
   - "data": An array of objects like {"name": "Category", "value": 100}.
   - If no chart is appropriate, return null for this entire object.

6. "actions": If the input contains tasks, deadlines, or implied "to-dos", extract them into a prioritized, step-by-step list. 
   - Each action should have "task" (string) and "priority" ("high" | "medium" | "low").
   - If no actions are found, return an empty array.

Respond ONLY with a valid JSON object matching the exact structure below, with no markdown formatting around it:
{
  "tldr": ["string", "string", "string"],
  "whyCare": "string",
  "readingTime": "string",
  "chunks": [
    {
      "heading": "string",
      "content": "string",
      "keyTerms": ["string", "string"]
    }
  ],
  "chartData": {
    "type": "bar" | "line" | "pie",
    "data": [ { "name": "string", "value": number } ]
  } | null,
  "actions": [ { "task": "string", "priority": "high" | "medium" | "low" } ]
}

INPUT TO SIMPLIFY:
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
