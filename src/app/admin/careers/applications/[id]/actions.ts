"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { getSiteUrl } from "@/lib/env";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }
  return session;
}

const replySchema = z.object({
  applicationId: z.string().min(1),
  body: z.string().trim().min(1).max(3000),
});

export async function postAdminReply(formData: FormData) {
  await requireAdmin();

  const parsed = replySchema.safeParse({
    applicationId: formData.get("applicationId"),
    body: formData.get("body"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { applicationId, body } = parsed.data;

  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!application) throw new Error("Application not found.");

  await prisma.jobMessage.create({
    data: { applicationId, fromAdmin: true, body, readByAdmin: true },
  });

  const statusUrl = `${getSiteUrl()}/careers/status/${application.accessToken}`;

  if (process.env.BREVO_API_KEY) {
    await sendBrevoEmail({
      to: [{ email: application.email, name: application.name }],
      subject: `New message about your ${application.job.title} application`,
      htmlContent: `<p>${body.replace(/\n/g, "<br>")}</p><p><a href="${statusUrl}">View and reply</a></p>`,
    });
  }

  revalidatePath(`/admin/careers/applications/${applicationId}`);
  revalidatePath("/admin/careers");
  revalidatePath("/admin/inbox");
}

export async function markApplicationMessagesRead(formData: FormData) {
  await requireAdmin();
  const applicationId = formData.get("applicationId");
  if (typeof applicationId !== "string") throw new Error("Missing application id.");

  await prisma.jobMessage.updateMany({
    where: { applicationId, fromAdmin: false, readByAdmin: false },
    data: { readByAdmin: true },
  });

  revalidatePath(`/admin/careers/applications/${applicationId}`);
  revalidatePath("/admin/careers");
  revalidatePath("/admin/inbox");
}

const statusSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum(["RECEIVED", "IN_REVIEW", "INTERVIEWING", "REJECTED", "HIRED"]),
});

export async function updateApplicationStatus(formData: FormData) {
  await requireAdmin();

  const parsed = statusSchema.safeParse({
    applicationId: formData.get("applicationId"),
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error("Invalid input.");

  await prisma.jobApplication.update({
    where: { id: parsed.data.applicationId },
    data: { status: parsed.data.status },
  });

  revalidatePath(`/admin/careers/applications/${parsed.data.applicationId}`);
}
