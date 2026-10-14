import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { buildSiteAssistantPrompt } from "@/lib/site-assistant-knowledge";

// The website chat assistant (src/components/site-assistant.tsx). Public
// and unauthenticated, so every request costs real API credit: the limits
// below (per-IP rate, message count and length, reply length) cap what one
// visitor can spend. The conversation lives in the visitor's browser and
// is sent in full each time; nothing is stored server-side.

const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 2000;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
      })
    )
    .min(1)
    .max(MAX_MESSAGES)
    .refine((m) => m[0].role === "user" && m[m.length - 1].role === "user", {
      message: "Conversation must start and end with a visitor message.",
    }),
});

const FALLBACK_REPLY =
  "Sorry, I can't answer right now. You can book a free consultation at https://www.nobs-agent.site/booking or reach us on WhatsApp.";

// Appended after a partial reply (on a new paragraph), or sent on its own.
function fallbackText(afterPartialReply: boolean): string {
  return afterPartialReply ? `\n\n${FALLBACK_REPLY}` : FALLBACK_REPLY;
}

// Long answers plus the occasional slow API response: give the function
// room so a reply isn't cut off by the platform's default time limit.
export const maxDuration = 60;

// Built once per server instance: deterministic, so it's a stable cache
// prefix across every visitor's requests.
let systemPrompt: string | null = null;
let client: Anthropic | null = null;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = rateLimit(`assistant:${ip}`, 20, 10 * 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "You've sent a lot of messages. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[assistant] Missing ANTHROPIC_API_KEY");
    return new Response(FALLBACK_REPLY, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  systemPrompt ??= buildSiteAssistantPrompt();
  client ??= new Anthropic();
  const anthropic = client;
  const system = systemPrompt;
  const messages = parsed.data.messages;

  // The reply is streamed as plain text, so the visitor sees it appear
  // word by word instead of waiting for the whole answer (a full reply
  // can take several seconds). Validation and rate-limit errors above are
  // still plain JSON with a non-200 status.
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sentText = false;
      try {
        const stream = anthropic.messages.stream({
          // This is closed-book Q&A over a fixed script (see
          // site-assistant-knowledge.ts) — no reasoning, no tool use — so
          // Haiku is the right-sized model, not Opus. Thinking is
          // explicitly disabled (Haiku 5.5 allows this at effort "high" or
          // below): Opus 5.5 can't disable it at all, and the invisible
          // "thinking" phase before any visible text streams is what was
          // actually making replies feel slow, not the text generation
          // itself. Haiku 5.5 also has no server-side refusal fallback
          // (unlike Opus 5.5/Fable), so none is requested here — a refusal
          // still falls through to the FALLBACK_REPLY check below.
          model: "claude-haiku-5-5",
          max_tokens: 4000,
          thinking: { type: "disabled" },
          output_config: { effort: "low" },
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages,
        });

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            sentText = true;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        const final = await stream.finalMessage();
        if (!sentText || final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode(fallbackText(sentText)));
        }
      } catch (err) {
        if (err instanceof Anthropic.RateLimitError) {
          console.error("[assistant] Anthropic rate limit", err.message);
        } else if (err instanceof Anthropic.APIError) {
          console.error(`[assistant] Anthropic API error ${err.status}`, err.message);
        } else {
          console.error("[assistant] failed", err);
        }
        controller.enqueue(encoder.encode(fallbackText(sentText)));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
