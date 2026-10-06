import { NextRequest } from "next/server";
import { getAIClient, getModelForProvider, type Provider } from "@/lib/server/ai-provider";
import { getInternalToken } from "@/lib/server/internal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CREDITS_PER_REQUEST = parseInt(process.env.PRISM_CREDITS_PER_REQUEST ?? "10", 10) || 10;

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Best-effort refund; never throws. */
async function refundCredits(origin: string, cookieHeader: string, amount: number) {
  try {
    await fetch(`${origin}/api/user/credits/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
        "x-prism-internal": getInternalToken(),
      },
      body: JSON.stringify({ amount }),
    });
  } catch (err) {
    console.warn("Credit refund failed:", err);
  }
}

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const cookieHeader = req.headers.get("cookie") ?? "";
  const hasAuthCookie = Boolean(req.cookies.get("sb-access-token")?.value);
  let creditsCharged = 0;

  try {
    const { prompt, messages: incomingMessages, provider: rawProvider } = await req.json();
    const provider: Provider = rawProvider === "abacus" ? "abacus" : "openrouter";

    const messages = incomingMessages || [
      { role: "system", content: "You are an assistant in Dassah's Mindbridge." },
      { role: "user", content: prompt },
    ];

    // --- Credits: deduct BEFORE generation (skipped for guests unless auth is required) ---
    if (hasAuthCookie) {
      const deductRes = await fetch(`${origin}/api/user/credits/deduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieHeader },
        body: JSON.stringify({ amount: CREDITS_PER_REQUEST }),
      });
      if (deductRes.status === 402) {
        return jsonResponse({ error: "Insufficient credits", balance: 0 }, 402);
      }
      if (deductRes.ok) {
        creditsCharged = CREDITS_PER_REQUEST;
      } else {
        // Credits service unavailable/misconfigured: don't block the homepage.
        console.warn("Credit deduction skipped, status:", deductRes.status);
      }
    } else if (process.env.PRISM_REQUIRE_AUTH_FOR_AI === "true") {
      return jsonResponse({ error: "Sign in required" }, 401);
    }

    const client = getAIClient(provider);
    const model = getModelForProvider(provider);

    const stream = (await client.chat.completions.create({
      model,
      stream: true,
      stream_options: { include_usage: true },
      messages,
    } as any)) as any;

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let generationId: string | null = null;
        let tokenUsage: any = null;
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

          let costUsd: number | null = null;
          const openRouterKey = process.env.OPENROUTER_API_KEY ?? process.env.ROUTER_API_KEY;
          if (provider === "openrouter" && generationId && openRouterKey) {
            try {
              const res = await fetch(`https://openrouter.ai/api/v1/generation?id=${generationId}`, {
                headers: { Authorization: `Bearer ${openRouterKey}` },
              });
              if (res.ok) {
                const data = await res.json();
                costUsd = data?.data?.total_cost ?? null;
              }
            } catch (err) {
              console.warn("Cost lookup failed:", err);
            }
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                meta: { generationId, model: resolvedModel, tokens: tokenUsage, costUsd },
              })}\n\n`
            )
          );

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (streamErr: any) {
          if (creditsCharged > 0) {
            await refundCredits(origin, cookieHeader, creditsCharged);
          }
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
    if (creditsCharged > 0) {
      await refundCredits(origin, cookieHeader, creditsCharged);
    }
    return jsonResponse({ error: error.message }, 500);
  }
}
