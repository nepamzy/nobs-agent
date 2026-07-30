"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { getSiteUrl } from "@/lib/env";
import type { BookingStatus } from "@prisma/client";

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
