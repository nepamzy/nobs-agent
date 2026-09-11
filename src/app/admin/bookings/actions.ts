"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { getSiteUrl } from "@/lib/env";
import { buildReceiptHtml } from "@/lib/receipt";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { sendPushToUser } from "@/lib/push";
import { recordReferralCommissionIfApplicable, type CommissionEmailData } from "@/lib/referral-commission";
import { buildCommissionEarnedHtml, buildOverrideCommissionEarnedHtml } from "@/lib/partner-email";
import { createBookingCalendarEvent } from "@/lib/google-calendar";
import type { BookingStatus } from "@prisma/client";

// ---------- Manually logging a booking taken outside the site ----------
// For a client who called, messaged on WhatsApp, or was booked in person —
// the same Booking row everything else in the app already works from
// (confirm-with-price, payments, the client's own dashboard if they later
// sign up), just entered by staff instead of submitted through the public
// form. No Terms-and-Conditions acceptance is recorded here (there was no
// online click-through to record) — the studio's own verbal/WhatsApp
// agreement with the client is what this row documents.

const manualBookingSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the client's name.").max(100),
  email: z.string().trim().email("Enter a valid email."),
  serviceInterest: z.string().trim().min(2, "Select what they're looking to build.").max(150),
  budgetRange: z.string().trim().min(1, "Select a budget range."),
  meetingType: z.enum(["video", "phone", "in-person"]),
  scheduledFor: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Pick a valid date and time.",
  }),
  notes: z.string().trim().max(3000).optional().or(z.literal("")),
});

export type CreateBookingManuallyResult = { ok: true } | { ok: false; error: string };

export async function createBookingManually(formData: FormData): Promise<CreateBookingManuallyResult> {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return { ok: false, error: "Not authorized." };
  }

  const parsed = manualBookingSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    serviceInterest: formData.get("serviceInterest"),
    budgetRange: formData.get("budgetRange"),
    meetingType: formData.get("meetingType"),
    scheduledFor: formData.get("scheduledFor"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { fullName, email, serviceInterest, budgetRange, meetingType, scheduledFor, notes } = parsed.data;
  const scheduledDate = new Date(scheduledFor);

  try {
    // If this email already has an account, link the booking to it (and
    // their Client record, if any) so it shows up in their own dashboard
    // too — same as a booking made through the public form while signed
    // in. A phone-in lead with no account yet just gets userId/clientId
    // left null, same as any other unlinked booking already supported
    // elsewhere in this schema.
    const existingUser = await prisma.user.findUnique({ where: { email } });
    const existingClient = existingUser
      ? await prisma.client.findUnique({ where: { userId: existingUser.id } })
      : null;

    const booking = await prisma.booking.create({
      data: {
        userId: existingUser?.id,
        clientId: existingClient?.id,
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
      console.error("[createBookingManually] calendar event creation failed", err);
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("[createBookingManually] failed", err);
    return { ok: false, error: "Something went wrong creating the booking. Please try again." };
  }
}

export async function deleteBooking(formData: FormData) {
  const session = await auth();
  // Deletion is admin-only (not STAFF) since it's irreversible and wipes
  // payment history along with it, unlike status changes.
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Not authorized.");
  }

  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing booking id.");

  // BookingPayment rows reference this booking without cascade delete, so
  // they have to go first or the delete below fails on the foreign key.
  await prisma.$transaction([
    prisma.bookingPayment.deleteMany({ where: { bookingId: id } }),
    prisma.booking.delete({ where: { id } }),
  ]);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/payments");
}

export async function updateBookingStatus(formData: FormData) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }

  const id = formData.get("id");
  const status = formData.get("status") as BookingStatus;
  if (typeof id !== "string") throw new Error("Missing booking id.");

  await prisma.booking.update({ where: { id }, data: { status } });
  revalidatePath("/admin/bookings");
}

const confirmSchema = z.object({
  id: z.string().min(1),
  agreedAmountNaira: z.coerce.number().positive("Enter the agreed price."),
  // 45% is the floor per studio policy, admin can require more, never less.
  depositPercentage: z.coerce.number().min(45, "Deposit must be at least 45%.").max(100),
});

export async function confirmBookingWithDeposit(formData: FormData) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }

  const parsed = confirmSchema.safeParse({
    id: formData.get("id"),
    agreedAmountNaira: formData.get("agreedAmountNaira"),
    depositPercentage: formData.get("depositPercentage"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { id, agreedAmountNaira, depositPercentage } = parsed.data;

  // Stored in kobo throughout, Paystack's API expects amounts this way,
  // so converting once here avoids unit bugs at payment time.
  const agreedAmount = Math.round(agreedAmountNaira * 100);
  const depositAmount = Math.round((agreedAmount * depositPercentage) / 100);

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      status: "CONFIRMED",
      agreedAmount,
      depositPercentage,
      depositAmount,
      depositPaid: false,
      paystackReference: null,
      // This action always sets a fresh agreed price, so it's always a
      // (re-)confirmation of what's currently on the table — the Client
      // Service Agreement is dated against this, not the original request.
      confirmedAt: new Date(),
    },
  });

  const payUrl = `${getSiteUrl()}/pay/${booking.id}`;
  const depositNaira = (depositAmount / 100).toLocaleString("en-NG");

  // If this booking's email matches an existing account, drop a
  // notification in their dashboard inbox too, not just email, so the
  // "continue from either inbox or email" requirement actually works.
  const matchingUser = await prisma.user.findUnique({ where: { email: booking.email } });
  if (matchingUser) {
    await prisma.notification.create({
      data: {
        userId: matchingUser.id,
        title: "Your project is confirmed",
        body: `A deposit of ₦${depositNaira} (${depositPercentage}%) is required before work begins.`,
        link: `/pay/${booking.id}`,
      },
    });
  }

  if (process.env.BREVO_API_KEY) {
    await sendBrevoEmail({
      to: [{ email: booking.email, name: booking.fullName }],
      subject: "Your project is confirmed, next step: deposit",
      htmlContent: `
        <p>Hi ${booking.fullName.split(" ")[0]},</p>
        <p>Your project is confirmed. The agreed total is ₦${(agreedAmount / 100).toLocaleString("en-NG")}.</p>
        <p>To get started, a deposit of <strong>₦${depositNaira}</strong> (${depositPercentage}%) is required.</p>
        <p><a href="${payUrl}" style="display:inline-block;background:#e4b343;color:#0b0d12;padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:600;">Continue to payment</a></p>
        <p>Once it's received, we'll begin work right away.</p>
      `,
    });
  }

  revalidatePath("/admin/bookings");
}

// ---------- Admin manual payment authorization ----------
// The admin's word overrides Paystack: this records a payment (full or
// partial) as authorized directly by admin, independent of any gateway
// confirmation, pending, unconfirmed, or even failed. Everything after
// this point (receipt, email, dashboard update) follows the exact same
// path as a normal Paystack-verified payment.

const authorizeSchema = z
  .object({
    id: z.string().min(1),
    mode: z.enum(["amount", "percentage"]),
    value: z.coerce.number().positive("Enter an amount or percentage greater than zero."),
    // Only required the first time, if the booking doesn't have an agreed
    // price yet, admin can set it right here instead of a separate step.
    agreedAmountNaira: z.coerce.number().positive().optional(),
    note: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .refine((v) => v.mode !== "percentage" || v.value <= 100, {
    message: "Percentage can't exceed 100.",
    path: ["value"],
  });

export async function authorizeBookingPayment(formData: FormData) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }

  const parsed = authorizeSchema.safeParse({
    id: formData.get("id"),
    mode: formData.get("mode"),
    value: formData.get("value"),
    agreedAmountNaira: formData.get("agreedAmountNaira") || undefined,
    note: formData.get("note"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { id, mode, value, agreedAmountNaira, note } = parsed.data;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking not found.");

  let agreedAmount = booking.agreedAmount;
  let depositPercentage = booking.depositPercentage;
  let depositAmount = booking.depositAmount;

  // Booking has no agreed price yet, admin is setting one right now as
  // part of this authorization, defaulting the informational deposit
  // floor to the studio's usual 45% (this doesn't gate the authorization
  // itself, it's just kept consistent with the rest of the booking record).
  if (!agreedAmount) {
    if (!agreedAmountNaira) {
      throw new Error("This booking has no agreed price yet, enter the total project cost.");
    }
    agreedAmount = Math.round(agreedAmountNaira * 100);
    depositPercentage = depositPercentage ?? 45;
    depositAmount = Math.round((agreedAmount * depositPercentage) / 100);
  }

  const priorStatus = booking.status;
  const remaining = agreedAmount - booking.amountPaid;

  const paidAmount =
    mode === "percentage" ? Math.round((agreedAmount * value) / 100) : Math.round(value * 100);

  if (paidAmount <= 0) throw new Error("Enter an amount greater than zero.");
  if (paidAmount > remaining) {
    throw new Error(
      `That exceeds the remaining balance (${(remaining / 100).toLocaleString("en-NG")} naira left).`
    );
  }

  const newTotalPaid = booking.amountPaid + paidAmount;
  const reference = `manual-${crypto.randomUUID()}`;

  let commissionEmails: CommissionEmailData[] = [];
  await prisma.$transaction(async (tx) => {
    const payment = await tx.bookingPayment.create({
      data: {
        bookingId: booking.id,
        amount: paidAmount,
        provider: "manual",
        reference,
        authorizedByUserId: session.user.id,
        priorGatewayStatus: priorStatus,
        note: note || null,
      },
    });
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "CONFIRMED",
        agreedAmount,
        depositPercentage,
        depositAmount,
        amountPaid: newTotalPaid,
        depositPaid: true,
        depositPaidAt: booking.depositPaidAt ?? new Date(),
        // Only set the first time this booking is confirmed here — a
        // later payment on an already-confirmed booking shouldn't shift
        // the date the Client Service Agreement is dated against.
        confirmedAt: booking.confirmedAt ?? new Date(),
      },
    });
    commissionEmails = await recordReferralCommissionIfApplicable(tx, {
      bookingUserId: booking.userId,
      bookingPaymentId: payment.id,
      paidAmountKobo: paidAmount,
    });
  }, { timeout: 15000 });
  // See the matching comment in src/app/api/paystack/verify/route.ts —
  // same reasoning, same fix.

  // Everything downstream matches the normal Paystack-verified flow
  // exactly: same receipt builder, same emails, same dashboard notification.
  if (process.env.BREVO_API_KEY) {
    const receiptHtml = buildReceiptHtml({
      clientName: booking.fullName,
      serviceInterest: booking.serviceInterest,
      reference,
      paidThisTransaction: paidAmount,
      totalPaid: newTotalPaid,
      agreedAmount,
      paidAt: new Date(),
    });

    const allPayments = await prisma.bookingPayment.findMany({
      where: { bookingId: booking.id },
      orderBy: { createdAt: "asc" },
    });
    const pdfBytes = await generateInvoicePdf({
      id: booking.id,
      fullName: booking.fullName,
      email: booking.email,
      serviceInterest: booking.serviceInterest,
      agreedAmount,
      amountPaid: newTotalPaid,
      payments: allPayments,
    });
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
    const attachment = [{ name: `receipt-${booking.id}.pdf`, content: pdfBase64 }];

    // The payment record is already committed above, an email hiccup
    // (bad sender domain, rate limit, etc.) shouldn't be able to make
    // this whole action look like it failed when the money was in fact
    // recorded, so failures here are logged, not thrown.
    await Promise.allSettled([
      sendBrevoEmail({
        to: [{ email: booking.email, name: booking.fullName }],
        subject: newTotalPaid >= agreedAmount ? "Paid in full, thank you" : "Payment received",
        htmlContent: receiptHtml,
        attachment,
      }),
      sendBrevoEmail({
        to: [{ email: process.env.STUDIO_NOTIFICATION_EMAIL || "hello@nobsagent.com" }],
        subject: `Payment authorized (manual): ${booking.fullName}`,
        htmlContent: receiptHtml,
        attachment,
      }),
    ]).then((results) => {
      results.forEach((r) => {
        if (r.status === "rejected") console.error("[authorizeBookingPayment] email failed", r.reason);
      });
    });

    for (const data of commissionEmails) {
      const send =
        data.kind === "base"
          ? sendBrevoEmail({
              to: [{ email: data.partnerEmail, name: data.partnerName }],
              subject: "You earned a referral commission",
              htmlContent: buildCommissionEarnedHtml(data),
            })
          : sendBrevoEmail({
              to: [{ email: data.partnerEmail, name: data.partnerName }],
              subject: "You earned an override commission",
              htmlContent: buildOverrideCommissionEarnedHtml(data),
            });
      send.catch((err) => console.error("[authorizeBookingPayment] commission email failed", err));
    }
  }

  const matchingUser = await prisma.user.findUnique({ where: { email: booking.email } });
  if (matchingUser) {
    const remainingAfter = agreedAmount - newTotalPaid;
    await prisma.notification.create({
      data: {
        userId: matchingUser.id,
        title: remainingAfter <= 0 ? "Payment received, paid in full" : "Payment received",
        body:
          remainingAfter <= 0
            ? `Your payment of ₦${(paidAmount / 100).toLocaleString("en-NG")} was received, you're paid in full.`
            : `Your payment of ₦${(paidAmount / 100).toLocaleString("en-NG")} was received. ₦${(
                remainingAfter / 100
              ).toLocaleString("en-NG")} remaining.`,
        link: `/pay/${booking.id}`,
      },
    });

    await sendPushToUser(matchingUser.id, {
      title: "Payment received",
      body: `₦${(paidAmount / 100).toLocaleString("en-NG")} recorded on your project.`,
      url: "/dashboard/payments",
    });
  }

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin/payments");
  revalidatePath("/dashboard/payments");
}

export async function removeBookingPayment(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Not authorized.");
  }

  const id = formData.get("id");
  const mode = formData.get("mode"); // "reset" | "remove"
  if (typeof id !== "string") throw new Error("Missing booking id.");

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking not found.");

  if (mode === "remove") {
    // Removed entirely: clears the price too, not just what's paid,
    // reverting the booking back to pending, undoing the confirmation as
    // if it had never been priced.
    await prisma.$transaction([
      prisma.bookingPayment.deleteMany({ where: { bookingId: id } }),
      prisma.booking.update({
        where: { id },
        data: {
          amountPaid: 0,
          depositPaid: false,
          depositPaidAt: null,
          agreedAmount: null,
          depositPercentage: null,
          depositAmount: null,
          status: "PENDING",
          confirmedAt: null,
        },
      }),
    ]);
  } else {
    // Reset to zero: keeps the agreed price and confirmed status, just
    // marks it unpaid again, for when the price itself is real but a
    // specific payment needs undoing.
    await prisma.$transaction([
      prisma.bookingPayment.deleteMany({ where: { bookingId: id } }),
      prisma.booking.update({
        where: { id },
        data: { amountPaid: 0, depositPaid: false, depositPaidAt: null },
      }),
    ]);
  }

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin/payments");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/clients");
  revalidatePath("/dashboard/payments");
}
