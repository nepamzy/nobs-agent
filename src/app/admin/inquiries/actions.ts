"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";

export async function markInquiryHandled(formData: FormData) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }

  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing inquiry id.");

  const inquiry = await prisma.contactMessage.update({ where: { id }, data: { handled: true } });

  // If this inquiry's email matches an existing client account, it shows
  // up in their own dashboard under Inquiries, and they get notified.
  const matchingUser = await prisma.user.findUnique({ where: { email: inquiry.email } });
  if (matchingUser) {
    await prisma.notification.create({
      data: {
        userId: matchingUser.id,
        title: "Your inquiry has been handled",
        body: "Check the Inquiries tab in your dashboard for details.",
        link: "/dashboard/inquiries",
      },
    });
  }

  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/inbox");
}

const replySchema = z.object({
  contactMessageId: z.string().min(1),
  body: z.string().trim().min(1).max(3000),
});

export async function postAdminInquiryReply(formData: FormData) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }

  const parsed = replySchema.safeParse({
    contactMessageId: formData.get("contactMessageId"),
    body: formData.get("body"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { contactMessageId, body } = parsed.data;

  const inquiry = await prisma.contactMessage.findUnique({ where: { id: contactMessageId } });
  if (!inquiry) throw new Error("Inquiry not found.");

  await prisma.inquiryReply.create({
    data: { contactMessageId, fromAdmin: true, body },
  });

  // Reply reaches the inquirer by email regardless of whether they have
  // an account, that's the one channel guaranteed to work for everyone
  // who's ever filled out the contact form.
  if (process.env.BREVO_API_KEY) {
    await sendBrevoEmail({
      to: [{ email: inquiry.email, name: inquiry.name }],
      subject: "Reply to your inquiry",
      htmlContent: `<p>${body.replace(/\n/g, "<br>")}</p>`,
      replyTo: process.env.STUDIO_NOTIFICATION_EMAIL,
    });
  }

  // If they also have a client account, it shows up in their dashboard
  // thread too, and they get notified there, satisfying "openable on
  // both sides."
  const matchingUser = await prisma.user.findUnique({ where: { email: inquiry.email } });
  if (matchingUser) {
    await prisma.notification.create({
      data: {
        userId: matchingUser.id,
        title: "Reply to your inquiry",
        body: body.length > 120 ? `${body.slice(0, 120)}...` : body,
        link: "/dashboard/inquiries",
      },
    });
  }

  revalidatePath(`/admin/inquiries/${contactMessageId}`);
  revalidatePath("/admin/inbox");
  revalidatePath("/dashboard/inquiries");
}
