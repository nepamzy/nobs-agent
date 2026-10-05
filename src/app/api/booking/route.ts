import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { auth } from "@/auth";
import { checkBookingAvailability } from "@/lib/booking-availability";
import { notifyAdminsPush } from "@/lib/push";
import { createBookingCalendarEvent } from "@/lib/google-calendar";
import {
  budgetOptionsForService,
  isFixedRecurringRate,
  isAiAutomationService,
  AI_BUDGET_OPTION,
} from "@/lib/booking-budget-options";
import { BOOKING_CURRENCY_CODES } from "@/lib/booking-currencies";

const bookingSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().email(),
    serviceInterest: z.string().trim().min(2).max(150),
    budgetRange: z.string().trim().min(1).max(50),
    currency: z.enum(BOOKING_CURRENCY_CODES).default("NGN"),
    meetingType: z.enum(["video", "phone", "in-person"]),
    scheduledFor: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "Please choose a valid date and time.",
    }),
    notes: z.string().trim().max(3000).optional().or(z.literal("")),
    website: z.string().max(0).optional().or(z.literal("")), // honeypot
    // Checkbox is `required` in the UI, but that only stops the browser form
    // — enforced again here so hitting this API directly can't skip it, same
    // reasoning as the auth check below.
    termsAccepted: z.literal("on", "You must agree to the Terms and Conditions."),
  })
  // AI Automation is never priced on the form, in any currency — the only
  // accepted budget is the "find out during your scoping call" option.
  .refine(
    (data) => !isAiAutomationService(data.serviceInterest) || data.budgetRange === AI_BUDGET_OPTION,
    {
      message: "That budget doesn't match the selected package. Please pick again.",
      path: ["budgetRange"],
    }
  )
  // A recurring NGN rate (Website Maintenance, SEO) is a real fixed price,
  // not a range, and the booking form never offers a "write your own"
  // escape hatch for it — so it's the one case still checked against the
  // known value, closing off posting directly to this endpoint with a
  // number that isn't the actual rate. Every other NGN service's
  // budgetRange is either one of its real tiered ranges, or
  // free text from the form's "Other — I'll describe it" option, and a
  // non-NGN booking's budgetRange is the package's real international
  // price computed client-side from a live exchange rate (or likewise
  // free text) — none of those have a fixed list to check against, and
  // it's informational only (never the actual charge; the admin sets the
  // real price at confirm time, see admin/bookings/actions.ts), so any
  // non-empty value (already enforced by budgetRange's own min/max above)
  // is accepted. isFixedRecurringRate is checked directly rather than
  // inferred from budgetOptionsForService's result length, since the AI
  // "scoping call" option is also a single string but isn't a real
  // commitment the way a recurring rate is.
  .refine(
    (data) => {
      if (data.currency !== "NGN") return true;
      if (!isFixedRecurringRate(data.serviceInterest)) return true;
      return budgetOptionsForService(data.serviceInterest).includes(data.budgetRange);
    },
    {
      message: "That budget doesn't match the selected package. Please pick again.",
      path: ["budgetRange"],
    }
  );

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

  const { fullName, email, serviceInterest, budgetRange, currency, meetingType, scheduledFor, notes } =
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
        currency,
        meetingType,
        scheduledFor: scheduledDate,
        notes: notes || null,
        status: "PENDING",
        // Set server-side, never from the client — this is what the
        // eventual Client Service Agreement cites as proof of acceptance.
        termsAcceptedAt: new Date(),
        termsAcceptedIp: ip,
      },
    });

    // Best-effort — a client's booking must never fail because the
    // studio's calendar integration is unconfigured or Google is
    // unreachable, so this is caught and logged, never rethrown.
    try {
      const eventId = await createBookingCalendarEvent({
        fullName,
        email,
        serviceInterest,
        meetingType,
        scheduledFor: scheduledDate,
        notes,
      });
      if (eventId) {
        await prisma.booking.update({ where: { id: booking.id }, data: { calendarEventId: eventId } });
      }
    } catch (err) {
      console.error("[booking] calendar event creation failed", err);
    }

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
