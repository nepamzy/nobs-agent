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
    return NextResponse.json({ reply: FALLBACK_REPLY });
  }

  systemPrompt ??= buildSiteAssistantPrompt();
  client ??= new Anthropic();

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      // A cost ceiling for a public endpoint: replies are meant to be a
      // few sentences, and low effort keeps thinking short.
      max_tokens: 4000,
      output_config: { effort: "low" },
      // If the model declines a message, the API retries it on a
      // fallback model inside the same call instead of failing.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages: parsed.data.messages,
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ reply: FALLBACK_REPLY });
    }

    const reply = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return NextResponse.json({ reply: reply || FALLBACK_REPLY });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      console.error("[assistant] Anthropic rate limit", err.message);
    } else if (err instanceof Anthropic.APIError) {
      console.error(`[assistant] Anthropic API error ${err.status}`, err.message);
    } else {
      console.error("[assistant] failed", err);
    }
    return NextResponse.json({ reply: FALLBACK_REPLY });
  }
}
