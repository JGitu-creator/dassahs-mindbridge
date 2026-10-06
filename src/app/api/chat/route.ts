import { NextRequest } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client directed to OpenRouter
const client = new OpenAI({
  baseURL: process.env.ROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.ROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://dassahs-mindbridge.vercel.app",
    "X-Title": process.env.APP_NAME || "Dassah's Mindbridge",
  },
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { prompt, messages: incomingMessages } = await req.json();

    const messages = incomingMessages || [
      { role: "system", content: "You are an assistant in Dassah's Mindbridge." },
      { role: "user", content: prompt },
    ];

    // Call OpenRouter with fallback models and stream options
    const stream = await client.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet", // Primary model choice
      stream: true,
      stream_options: { include_usage: true }, // Sends token usage in the last chunk
      messages,
      extraBody: {
        models: [
          "anthropic/claude-3.5-sonnet",
          "openai/gpt-4o",
          "google/gemini-2.0-flash",
          "openrouter/free", // Zero-cost fallback if paid models are unavailable
          "meta-llama/llama-3.3-70b-instruct:free", // Second zero-cost fallback
        ],
      },
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let generationId: string | null = null;
        let tokenUsage: OpenAI.CompletionUsage | null = null;
        let resolvedModel: string | null = null;

        try {
          for await (const chunk of stream) {
            if (chunk.id && !generationId) generationId = chunk.id;
            if (chunk.model && !resolvedModel) resolvedModel = chunk.model;

            const delta = chunk.choices?.[0]?.delta?.content || "";
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`));
            }

            if (chunk.usage) {
              tokenUsage = chunk.usage;
            }
          }

          // Optional: Fetch cost in USD from OpenRouter if a generation ID was returned
          let costUsd: number | null = null;
          if (generationId && process.env.ROUTER_API_KEY) {
            try {
              const res = await fetch(`https://openrouter.ai/api/v1/generation?id=${generationId}`, {
                headers: { Authorization: `Bearer ${process.env.ROUTER_API_KEY}` },
              });
              if (res.ok) {
                const data = await res.json();
                costUsd = data?.data?.total_cost ?? null;
              }
            } catch (err) {
              console.warn("Cost lookup failed:", err);
            }
          }

          // Send metadata chunk with token counts and model used
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                meta: { generationId, model: resolvedModel, tokens: tokenUsage, costUsd },
              })}\n\n`
            )
          );

          // Signal stream completion
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (streamErr: any) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: streamErr.message })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
