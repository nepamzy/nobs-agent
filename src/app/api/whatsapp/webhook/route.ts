import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

// Every inbound message, and every delivery/read status update, arrives
// here. We only act on actual text messages; everything else is
// acknowledged and ignored.
export async function POST(req: NextRequest) {
  const payload = await req.json();

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

    await prisma.whatsAppMessage.create({
      data: { contactId: contact.id, direction: "in", body: incomingText },
    });

    // Last 20 turns of history is enough context without the prompt
    // growing unbounded on a long-running conversation.
    const history = await prisma.whatsAppMessage.findMany({
      where: { contactId: contact.id },
      orderBy: { createdAt: "asc" },
      take: 20,
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
