"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";

const replySchema = z.object({
  contactMessageId: z.string().min(1),
  body: z.string().trim().min(1).max(3000),
});

export async function postClientInquiryReply(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not authorized.");

  const parsed = replySchema.safeParse({
    contactMessageId: formData.get("contactMessageId"),
    body: formData.get("body"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { contactMessageId, body } = parsed.data;

  // Ownership check: this inquiry's email must match the logged-in
  // client's own email, never someone else's.
  const inquiry = await prisma.contactMessage.findUnique({ where: { id: contactMessageId } });
  if (!inquiry || inquiry.email !== session.user.email) {
    throw new Error("Not authorized.");
  }

  await prisma.inquiryReply.create({
    data: { contactMessageId, fromAdmin: false, body },
  });

  if (process.env.BREVO_API_KEY && process.env.STUDIO_NOTIFICATION_EMAIL) {
    await sendBrevoEmail({
      to: [{ email: process.env.STUDIO_NOTIFICATION_EMAIL }],
      subject: `Reply from ${inquiry.name} on their inquiry`,
      htmlContent: `<p>${body.replace(/\n/g, "<br>")}</p>`,
      replyTo: inquiry.email,
    });
  }

  revalidatePath("/dashboard/inquiries");
  revalidatePath(`/admin/inquiries/${contactMessageId}`);
}
