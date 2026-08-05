"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";

const replySchema = z
  .object({
    contactMessageId: z.string().min(1),
    body: z.string().trim().max(3000),
    attachmentUrl: z.string().trim().url().optional().or(z.literal("")),
    attachmentName: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .refine((d) => d.body.length > 0 || !!d.attachmentUrl, {
    message: "Write something or attach a file.",
  });

export async function postClientInquiryReply(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not authorized.");

  const parsed = replySchema.safeParse({
    contactMessageId: formData.get("contactMessageId"),
    body: formData.get("body") ?? "",
    attachmentUrl: formData.get("attachmentUrl") ?? "",
    attachmentName: formData.get("attachmentName") ?? "",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { contactMessageId, attachmentUrl, attachmentName } = parsed.data;
  const body = parsed.data.body || "(attachment)";

  // Ownership check: this inquiry's email must match the logged-in
  // client's own email, never someone else's.
  const inquiry = await prisma.contactMessage.findUnique({ where: { id: contactMessageId } });
  if (!inquiry || inquiry.email !== session.user.email) {
    throw new Error("Not authorized.");
  }

  await prisma.inquiryReply.create({
    data: {
      contactMessageId,
      fromAdmin: false,
      body,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
    },
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
