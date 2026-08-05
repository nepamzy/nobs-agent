"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { notifyAdminsPush, sendPushToUser } from "@/lib/push";

const bodySchema = z
  .object({
    body: z.string().trim().max(3000),
    attachmentUrl: z.string().trim().url().optional().or(z.literal("")),
    attachmentName: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .refine((d) => d.body.length > 0 || !!d.attachmentUrl, {
    message: "Write something or attach a file.",
  });

// Client sends a message to "the studio" generally, recipientId stays
// null, any admin can see and answer it.
export async function sendDirectMessage(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") throw new Error("Not authorized.");

  const parsed = bodySchema.safeParse({
    body: formData.get("body") ?? "",
    attachmentUrl: formData.get("attachmentUrl") ?? "",
    attachmentName: formData.get("attachmentName") ?? "",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  await prisma.message.create({
    data: {
      senderId: session.user.id,
      recipientId: null,
      body: parsed.data.body || "(attachment)",
      attachmentUrl: parsed.data.attachmentUrl || null,
      attachmentName: parsed.data.attachmentName || null,
    },
  });

  await notifyAdminsPush({
    title: `New message from ${session.user.name ?? "a client"}`,
    body: (parsed.data.body || "Sent an attachment").slice(0, 100),
    url: "/admin/inbox",
  });

  revalidatePath("/dashboard/messages");
  revalidatePath("/admin/messages");
  revalidatePath("/admin/inbox");
}

// Admin replies to a specific client, this both lands in that client's
// inbox and creates a dashboard notification, satisfying "notify on next
// login" without needing real-time infrastructure.
const adminReplySchema = z
  .object({
    clientUserId: z.string().min(1),
    body: z.string().trim().max(3000),
    attachmentUrl: z.string().trim().url().optional().or(z.literal("")),
    attachmentName: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .refine((d) => d.body.length > 0 || !!d.attachmentUrl, {
    message: "Write something or attach a file.",
  });

export async function sendAdminDirectReply(formData: FormData) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }

  const parsed = adminReplySchema.safeParse({
    clientUserId: formData.get("clientUserId"),
    body: formData.get("body") ?? "",
    attachmentUrl: formData.get("attachmentUrl") ?? "",
    attachmentName: formData.get("attachmentName") ?? "",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { clientUserId, body, attachmentUrl, attachmentName } = parsed.data;
  const displayBody = body || "(attachment)";

  const client = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!client) throw new Error("Client not found.");

  await prisma.message.create({
    data: {
      senderId: session.user.id,
      recipientId: clientUserId,
      body: displayBody,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: clientUserId,
      title: "New message from NOBS AGENT",
      body: displayBody.length > 120 ? `${displayBody.slice(0, 120)}...` : displayBody,
      link: "/dashboard/messages",
    },
  });

  if (process.env.BREVO_API_KEY && client.emailNotifications) {
    await sendBrevoEmail({
      to: [{ email: client.email, name: client.name }],
      subject: "New message from NOBS AGENT",
      htmlContent: `<p>${displayBody.replace(/\n/g, "<br>")}</p>`,
    });
  }

  await sendPushToUser(clientUserId, {
    title: "New message from NOBS AGENT",
    body: displayBody.length > 100 ? `${displayBody.slice(0, 100)}...` : displayBody,
    url: "/dashboard/messages",
  });

  revalidatePath(`/admin/messages/${clientUserId}`);
  revalidatePath("/admin/messages");
  revalidatePath("/admin/inbox");
}
