import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { WHATSAPP_SYSTEM_PROMPT } from "@/lib/whatsapp-knowledge-base";
import { notifyAdminsPush } from "@/lib/push";

// Meta calls this once when you paste the Callback URL + Verify Token into
// the WhatsApp API Setup screen, to confirm you actually control this
// endpoint. Must echo back hub.challenge exactly.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// Meta signs every webhook POST with the app's App Secret
// (X-Hub-Signature-256: "sha256=<hex HMAC of the raw body>"). Without
// checking it, anyone who finds this URL could post a fake "message" and
// make the bot spend Claude/WhatsApp credit replying to any number they
// choose. Fails closed: no secret configured means nothing is accepted.
function hasValidMetaSignature(rawBody: string, header: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.error("[whatsapp webhook] Missing WHATSAPP_APP_SECRET, rejecting all webhook POSTs");
    return false;
  }
  if (!header?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest();
  const received = Buffer.from(header.slice("sha256=".length), "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

// Every inbound message, and every delivery/read status update, arrives
// here. We only act on actual text messages; everything else is
// acknowledged and ignored.
export async function POST(req: NextRequest) {
  // The signature covers the exact bytes Meta sent, so read the raw text
  // first and only parse it after it's been verified.
  const rawBody = await req.text();
  if (!hasValidMetaSignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  try {
    const change = payload?.entry?.[0]?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    // Status-update pings (sent/delivered/read) have no `messages` array —
    // nothing to do, just ack so Meta doesn't retry.
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    // Only handle plain text for now. Images/audio/documents come in with
    // a different `type` and no `.text.body` — acknowledge and skip rather
    // than crash, until that's explicitly built.
    if (message.type !== "text" || !message.text?.body) {
      return NextResponse.json({ ok: true });
    }

    const waId: string = message.from;
    const profileName: string | undefined = change?.contacts?.[0]?.profile?.name;
    const incomingText: string = message.text.body;

    const contact = await prisma.whatsAppContact.upsert({
      where: { waId },
      update: { profileName, lastMessageAt: new Date() },
      create: { waId, profileName },
    });

    // Meta redelivers a webhook whenever our ack is slow or fails, so the
    // same message can arrive more than once. waMessageId is unique: the
    // insert for a repeat delivery fails, and we stop before replying a
    // second time. This also holds when two deliveries race each other.
    try {
      await prisma.whatsAppMessage.create({
        data: {
          contactId: contact.id,
          direction: "in",
          body: incomingText,
          waMessageId: message.id,
        },
      });
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      throw err;
    }

    // The whole conversation, oldest first, so the bot always has the full
    // context, including the message that just arrived.
    const history = await prisma.whatsAppMessage.findMany({
      where: { contactId: contact.id },
      orderBy: { createdAt: "asc" },
    });

    const replyText = await getAiReply(history);

    const handoffMatch = replyText.match(/\[\[HANDOFF:\s*(.+?)\]\]/);
    const cleanReply = replyText.replace(/\[\[HANDOFF:.*?\]\]/, "").trim();

    await sendWhatsAppMessage(waId, cleanReply);

    await prisma.whatsAppMessage.create({
      data: { contactId: contact.id, direction: "out", body: cleanReply },
    });

    if (handoffMatch) {
      const reason = handoffMatch[1].trim();
      await prisma.whatsAppContact.update({
        where: { id: contact.id },
        data: {
          needsHuman: true,
          handoffReason: reason,
          handoffNotifiedAt: new Date(),
        },
      });
      await notifyAdminsPush({
        title: `WhatsApp needs you: ${profileName || waId}`,
        body: reason,
        url: "/admin",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Always 200 back to Meta even on our own errors — a non-2xx makes
    // Meta retry the same webhook repeatedly, which would re-trigger this
    // failure (and re-send a reply) over and over.
    console.error("[whatsapp webhook] error handling message", err);
    return NextResponse.json({ ok: true });
  }
}

async function getAiReply(
  history: { direction: string; body: string }[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[whatsapp webhook] Missing ANTHROPIC_API_KEY");
    return "Thanks for your message — I'm having a technical issue right now, Nobert will follow up with you directly shortly. [[HANDOFF: AI reply failed - missing API key]]";
  }

  const messages = history.map((m) => ({
    role: m.direction === "in" ? ("user" as const) : ("assistant" as const),
    content: m.body,
  }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: WHATSAPP_SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[whatsapp webhook] Claude API error", res.status, errText);
    return "Thanks for your message — I'm having a technical issue right now, Nobert will follow up with you directly shortly. [[HANDOFF: AI reply failed - API error]]";
  }

  const data = await res.json();
  const textBlock = data?.content?.find((b: { type: string }) => b.type === "text");
  return textBlock?.text?.trim() || "Got your message — let me get back to you shortly.";
}
