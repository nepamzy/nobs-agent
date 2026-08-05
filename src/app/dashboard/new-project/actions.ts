"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";

const briefSchema = z.object({
  serviceInterest: z.string().trim().min(1, "Select what you're looking to build."),
  budgetRange: z.string().trim().min(1, "Select a budget range."),
  meetingType: z.string().trim().min(1, "Select a meeting type."),
  scheduledFor: z.string().trim().min(1, "Pick a preferred date and time."),
  notes: z.string().trim().min(20, "A few sentences helps, at least 20 characters."),
});

export async function submitProjectBrief(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not authorized.");

  const parsed = briefSchema.safeParse({
    serviceInterest: formData.get("serviceInterest"),
    budgetRange: formData.get("budgetRange"),
    meetingType: formData.get("meetingType"),
    scheduledFor: formData.get("scheduledFor"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { serviceInterest, budgetRange, meetingType, scheduledFor, notes } = parsed.data;

  const client = await prisma.client.findUnique({ where: { userId: session.user.id } });

  // Submitted briefs go through the exact same review path as a public
  // booking, one place for the studio to see and confirm new work,
  // rather than a separate, parallel system with its own review UI.
  await prisma.booking.create({
    data: {
      userId: session.user.id,
      clientId: client?.id,
      fullName: session.user.name ?? "Client",
      email: session.user.email ?? "",
      serviceInterest,
      budgetRange,
      meetingType,
      scheduledFor: new Date(scheduledFor),
      notes,
      status: "PENDING",
    },
  });

  if (process.env.BREVO_API_KEY && process.env.STUDIO_NOTIFICATION_EMAIL) {
    await sendBrevoEmail({
      to: [{ email: process.env.STUDIO_NOTIFICATION_EMAIL }],
      subject: `New project brief from dashboard: ${serviceInterest}`,
      htmlContent: `<p>${session.user.name ?? session.user.email} submitted a new brief via the dashboard.</p><p><strong>${serviceInterest}</strong> · ${budgetRange} · ${meetingType}</p><p>Preferred time: ${new Date(scheduledFor).toString()}</p><p>${notes.replace(/\n/g, "<br>")}</p>`,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/bookings");
  redirect("/dashboard?submitted=1");
}

export async function cancelProjectBrief(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not authorized.");

  const bookingId = formData.get("bookingId");
  if (typeof bookingId !== "string") throw new Error("Missing booking id.");

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== session.user.id) {
    throw new Error("Not authorized.");
  }
  // Only withdrawable before the studio has acted on it, once it's
  // confirmed (or further along), cancelling needs a real conversation,
  // not a silent delete.
  if (booking.status !== "PENDING") {
    throw new Error("This can only be cancelled while still pending review.");
  }

  await prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });

  revalidatePath("/dashboard");
  revalidatePath("/admin/bookings");
}

const bookingFileSchema = z.object({
  bookingId: z.string().min(1),
  url: z.string().trim().url(),
  fileName: z.string().trim().min(1).max(200),
});

export async function uploadBookingFile(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not authorized.");

  const parsed = bookingFileSchema.safeParse({
    bookingId: formData.get("bookingId"),
    url: formData.get("url"),
    fileName: formData.get("fileName"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { bookingId, url, fileName } = parsed.data;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found.");

  const isOwner = booking.userId === session.user.id;
  const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";
  if (!isOwner && !isStaff) throw new Error("Not authorized.");

  await prisma.bookingFile.create({
    data: { bookingId, url, fileName, uploadedByRole: session.user.role },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/admin/bookings/${bookingId}`);
}
