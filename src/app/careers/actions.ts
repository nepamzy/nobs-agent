"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { getSiteUrl } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

const applySchema = z.object({
  jobId: z.string().min(1),
  name: z.string().trim().min(2, "Enter your name.").max(150),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(20),
  location: z.string().trim().min(2, "Enter your current location.").max(150),
  portfolioUrl: z.string().trim().url("Enter a valid URL.").max(300).optional().or(z.literal("")),
  experience: z.string().trim().max(2000).optional().or(z.literal("")),
  source: z.string().trim().min(1, "Let us know how you heard about this role."),
  coverLetter: z.string().trim().min(20, "A few sentences about why you're a fit helps."),
  resumeUrl: z.string().trim().min(1, "A resume attachment is required.").url("Please attach a resume before submitting."),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
});

export type ApplyResult = { ok: true; statusUrl: string } | { ok: false; error: string };

export async function submitJobApplication(formData: FormData): Promise<ApplyResult> {
  const parsed = applySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { jobId, name, email, phone, location, portfolioUrl, experience, source, coverLetter, resumeUrl } =
    parsed.data;

  const { success: withinLimit } = rateLimit(`job-apply:${email}`, 3, 60 * 60_000);
  if (!withinLimit) {
    return { ok: false, error: "Too many applications from this email recently. Try again later." };
  }

  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || !job.active) {
      return { ok: false, error: "This posting is no longer accepting applications." };
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        name,
        email,
        phone,
        location,
        portfolioUrl: portfolioUrl || null,
        experience: experience || null,
        source,
        coverLetter,
        resumeUrl: resumeUrl || null,
      },
    });

    // The cover letter becomes the first message in the thread, so the
    // chat reads as one continuous conversation from the start.
    await prisma.jobMessage.create({
      data: {
        applicationId: application.id,
        fromAdmin: false,
        body: coverLetter,
        readByApplicant: true,
      },
    });

    const statusUrl = `${getSiteUrl()}/careers/status/${application.accessToken}`;

    if (process.env.BREVO_API_KEY) {
      await Promise.all([
        sendBrevoEmail({
          to: [{ email, name }],
          subject: `Application received: ${job.title}`,
          htmlContent: `<p>Hi ${name.split(" ")[0]}, your application for <strong>${job.title}</strong> is in. You can follow up or check for a reply any time here:</p><p><a href="${statusUrl}">${statusUrl}</a></p>`,
        }),
        sendBrevoEmail({
          to: [{ email: process.env.STUDIO_NOTIFICATION_EMAIL || "hello@nobsagent.com" }],
          subject: `New application: ${job.title}, from ${name}`,
          htmlContent: `
            <p>${name} (${email}) applied for <strong>${job.title}</strong>.</p>
            <ul>
              <li><strong>Phone:</strong> ${phone}</li>
              <li><strong>Location:</strong> ${location}</li>
              <li><strong>Heard about this role via:</strong> ${source}</li>
              ${portfolioUrl ? `<li><strong>Portfolio/LinkedIn:</strong> <a href="${portfolioUrl}">${portfolioUrl}</a></li>` : ""}
            </ul>
            ${experience ? `<p><strong>Relevant experience:</strong><br>${experience.replace(/\n/g, "<br>")}</p>` : ""}
            <p><strong>Why them:</strong><br>${coverLetter.replace(/\n/g, "<br>")}</p>
            ${resumeUrl ? `<p><a href="${resumeUrl}">View resume</a></p>` : ""}
          `,
        }),
      ]);
    }

    return { ok: true, statusUrl };
  } catch (err) {
    console.error("[job-application] failed", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
