import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(5000),
  // Honeypot field: real users never fill this in (it's visually hidden on
  // the client). Any non-empty value here is treated as a bot.
  website: z.string().max(0).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { name, email, company, message } = parsed.data;

  try {
    // 1. Persist to the database so it shows up in /admin → Inquiries,
    //    regardless of whether the email step below succeeds.
    await prisma.contactMessage.create({
      data: { name, email, company: company || null, message, source: "contact_form" },
    });

    // 2. Notify the studio owner by email via Brevo.
    //    Set BREVO_API_KEY and STUDIO_NOTIFICATION_EMAIL in .env.local.
    if (process.env.BREVO_API_KEY) {
      await sendBrevoEmail({
        to: [{ email: process.env.STUDIO_NOTIFICATION_EMAIL || "hello@nobsagent.com" }],
        subject: `New inquiry from ${name}${company ? ` (${company})` : ""}`,
        htmlContent: `<p>${message.replace(/\n/g, "<br>")}</p><p>— ${name} &lt;${email}&gt;</p>`,
        replyTo: email,
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[contact] failed to process submission", err);
    return NextResponse.json(
      { error: "Something went wrong on our end. Please try again shortly." },
      { status: 500 }
    );
  }
}
