"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { rateLimit } from "@/lib/rate-limit";

const messageSchema = z.object({
  token: z.string().min(1),
  body: z.string().trim().min(1).max(3000),
});

export async function postApplicantMessage(formData: FormData) {
  const parsed = messageSchema.safeParse({
    token: formData.get("token"),
    body: formData.get("body"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { token, body } = parsed.data;

  const { success: withinLimit } = rateLimit(`applicant-message:${token}`, 20, 60_000);
  if (!withinLimit) throw new Error("Too many messages, please slow down.");

  const application = await prisma.jobApplication.findUnique({
    where: { accessToken: token },
    include: { job: true },
  });
  if (!application) throw new Error("Not found.");

  await prisma.jobMessage.create({
    data: {
      applicationId: application.id,
      fromAdmin: false,
      body,
      readByApplicant: true,
    },
  });

  if (process.env.BREVO_API_KEY && process.env.STUDIO_NOTIFICATION_EMAIL) {
    await sendBrevoEmail({
      to: [{ email: process.env.STUDIO_NOTIFICATION_EMAIL }],
      subject: `New message from ${application.name} (${application.job.title})`,
      htmlContent: `<p>${body.replace(/\n/g, "<br>")}</p>`,
    });
  }

  revalidatePath(`/careers/status/${token}`);
}
