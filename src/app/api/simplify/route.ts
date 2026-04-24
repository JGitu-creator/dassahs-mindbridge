import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API key is not configured.' },
      { status: 500 }
    );
  }

  try {
    const { text = '', mode, question, context, isScenic, cognitiveMode, missionGoal, isStory } = await req.json();

    if (!text && mode !== 'chat') {
      return NextResponse.json(
        { error: 'Valid input is required.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = [
      'gemini-3-flash',
      'gemini-3.1-pro',
      'gemini-1.5-flash-latest'
    ];
    
    const prompt = `
    You are an expert cognitive architect called "Dassah's Prism." Your mission is to transmute overwhelming "Noise" into "Divine Clarity" through Deep Discernment. You are a fierce advocate for the user's sovereignty.

    ${text && text.length > 100000 ? '⚠️ LARGE INPUT DETECTED: This is a full book/document. Prioritize the most critical narrative/logical nodes and consolidate minor details to maintain "Divine Clarity" without overloading the bandwidth.' : ''}

    USER MISSION GOAL: ${missionGoal || 'Discovery & Clarity'}

    DEEP DISCERNMENT PROTOCOL:
    First, perform a hidden "Sovereign Audit" of the INPUT. Identify the category and adopt the corresponding "Refraction Role" (If isStory is TRUE, ALWAYS adopt the STORY/BOOK role):
    ${isStory ? 'FORCED ROLE: STORY/BOOK' : ''}

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

    5. STORY/BOOK (The "Narrative Weaver"):
       - Focus on emotional arc, key character growth, major plot turns, and "The Soul's Lesson."
       - Target: Immersive Enjoyment & Deep Resonance.
       - If this is a story, provide a more vast, evocative summary in the "whyCare" and "tldr" sections.

    6. LITERARY/CASUAL (The "Intel Safari"):
       - Focus on "Aha! Moments," emotional core, and plot momentum.
       - Target: Instant Insight.

    TARGET AUDIENCE: ${cognitiveMode === 'ceo' ? 'CEO/Executive (Prioritize "Executive Distillation" - ultra-high impact, bottom-line value, rapid decision-making context.)' : 'ADHD/Neurodivergent (Prioritize "Neural Refraction" - dopamine-aligned, high stimulation, fascinating hooks to maintain focus.)'}

    PROCESSING MODE: ${isScenic ? 'SCENIC ROUTE (Full immersive journey: Use wild, creative metaphors, fascinating "Did you know?" hooks, and break the text into 5-15 small, vibrant segments depending on the depth and length of the input. Be witty and expansive. Provide in-depth analysis for each segment. If this is a story, make it a vast, deep-dive exploration of the narrative.)' : 'QUICK FILTER (Ultra-fast extraction: Get the absolute core facts in the shortest time possible. Use 3-5 minimal segments and extreme brevity.)'}

    ALWAYS TIE ALL ANALYSIS BACK TO THE USER'S SOVEREIGN GOAL: ${missionGoal || 'Discovery & Clarity'}

    Follow these strict rules for the JSON output:
    1. "tldr": Exactly 3 concise, punchy bullet points that directly address the Sovereign Goal.
    2. "whyCare": A compelling "Mission Anchor" reason (Safety, Success, or Sovereignty). For stories, make this an evocative "Why this story matters to your soul."
    3. "readingTime": Estimate concentration time.
    4. "chunks": 
       - "heading": High-impact (Add ⚠️ if Legal Red Flag found).
       - "content": The primary text for this segment.
       - "summary": A 1-sentence "Neural Snap" summary of ONLY this specific segment.
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
          "summary": "string",
          "keyTerms": ["string", "string"],
          "metaphor": "string",
          "dopamineHook": "string"
        }
      ],
      "chartData": {
        "type": "bar" | "line" | "pie",
        "data": [ { "name": "string", "value": number } ]
      } | null
    }

    INPUT TEXT:
    ${text}
    `;

  let responseText = '';
  let lastError: any = null;


  const generationPrompt = mode === 'chat' ? `
      You are an ADHD-friendly assistant called \"Ask DJ.\" 
      Based on the CONTEXT provided below, answer the user's question or follow their direct instructions (e.g. \"make a poem\", \"summarize dates\", \"find names\").

      RULES:
      1. Be simple, encouraging, and clear.
      2. Use bullet points for lists.
      3. If asked to do a task based on the document, perform it fully within the chat response.
      4. Respond ONLY with clean, plain text. Do NOT wrap your answer in JSON, brackets, or code symbols.

      CONTEXT:
      ${JSON.stringify(context)}

      USER REQUEST:
      ${question}
    ` : prompt;

  for (const modelName of modelsToTry) {
    try {
      // If not the first model, wait 1 second before retrying to avoid spamming the same rate limit
      if (lastError) await new Promise(r => setTimeout(r, 1000));

      const isPro = modelName.includes('pro');
      const model = genAI.getGenerativeModel({ 
        model: modelName,
          generationConfig: { 
            responseMimeType: "application/json",
            temperature: isPro ? 0.7 : 0.4, // Higher temperature for more creative/vast story summaries on Pro
            topP: 0.95,
          },
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE } // Essential for Legal/Medical 'Red Flag' detection
          ]
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
      throw new Error(`The Neural Prism is currently synchronizing with the Divine Server. Our bandwidth is tight—please give us 10-15 seconds to recalibrate and try again. (Details: ${lastError?.message})`);
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
        chunks: parsedData.chunks.map((c: any) => ({
          heading: c.heading || "Neural Fragment",
          content: c.content || "",
          summary: c.summary || "Segment analyzed.",
          keyTerms: c.keyTerms || [],
          metaphor: c.metaphor || "",
          dopamineHook: c.dopamineHook || ""
        })) || [{ heading: "Neural Hiccup", content: "AI failed to segment.", summary: "No summary.", keyTerms: [], metaphor: "", dopamineHook: "" }],
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
