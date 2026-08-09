import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { auth } from "@/auth";
import { checkBookingAvailability } from "@/lib/booking-availability";
import { notifyAdminsPush } from "@/lib/push";

const bookingSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  serviceInterest: z.string().trim().min(2).max(150),
  budgetRange: z.string().trim().min(1).max(50),
  meetingType: z.enum(["video", "phone", "in-person"]),
  scheduledFor: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Please choose a valid date and time.",
  }),
  notes: z.string().trim().max(3000).optional().or(z.literal("")),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
});

export async function POST(req: NextRequest) {
  // Booking requires an account, this is enforced here (not just in the
  // UI) so the API can't be hit directly to skip signup.
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: "Please create an account or sign in before booking." },
      { status: 401 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = rateLimit(`booking:${ip}`, 5, 60_000);
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

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { fullName, email, serviceInterest, budgetRange, meetingType, scheduledFor, notes } =
    parsed.data;

  const scheduledDate = new Date(scheduledFor);

  const availability = await checkBookingAvailability(scheduledDate);
  if (!availability.ok) {
    return NextResponse.json({ error: availability.error }, { status: 409 });
  }

  try {
    // Persist to `Booking` so it shows up in /admin → Bookings. Tied to
    // the signed-in account so it appears in their dashboard too.
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        clientId: (await prisma.client.findUnique({ where: { userId: session.user.id } }))?.id,
        fullName,
        email,
        serviceInterest,
        budgetRange,
        meetingType,
        scheduledFor: scheduledDate,
        notes: notes || null,
        status: "PENDING",
      },
    });

    // Push notification to admin devices, "like WhatsApp", even if no one
    // has the site/app open right now.
    await notifyAdminsPush({
      title: "New booking request",
      body: `${fullName} requested ${serviceInterest} for ${scheduledDate.toLocaleString()}`,
      url: `/admin/bookings/${booking.id}`,
    });

    if (process.env.BREVO_API_KEY) {
      // Notify the studio
      await sendBrevoEmail({
        to: [{ email: process.env.STUDIO_NOTIFICATION_EMAIL || "hello@nobsagent.com" }],
        subject: `New booking request: ${fullName}`,
        htmlContent: [
          `<p>Service: ${serviceInterest}</p>`,
          `<p>Budget: ${budgetRange}</p>`,
          `<p>Meeting type: ${meetingType}</p>`,
          `<p>Requested time: ${new Date(scheduledFor).toString()}</p>`,
          notes ? `<p>Notes: ${notes}</p>` : "",
        ].join(""),
        replyTo: email,
      });

      // Confirm to the requester
      await sendBrevoEmail({
        to: [{ email, name: fullName }],
        subject: "We've received your booking request",
        htmlContent: `<p>Thanks ${fullName.split(" ")[0]}, your request for ${new Date(
          scheduledFor
        ).toDateString()} is in. I'll confirm the exact time within one business day.</p>`,
      });
    }

    return NextResponse.json({ ok: true, bookingId: booking.id }, { status: 200 });
  } catch (err) {
    console.error("[booking] failed to process submission", err);
    return NextResponse.json(
      { error: "Something went wrong on our end. Please try again shortly." },
      { status: 500 }
    );
  }
}
