"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const testimonialSchema = z.object({
  projectId: z.string().min(1),
  quote: z.string().trim().min(10, "A sentence or two is plenty.").max(1000),
  rating: z.coerce.number().int().min(1).max(5),
});

export type TestimonialResult = { ok: true } | { ok: false; error: string };

export async function submitDashboardTestimonial(formData: FormData): Promise<TestimonialResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Not authorized." };

  const parsed = testimonialSchema.safeParse({
    projectId: formData.get("projectId"),
    quote: formData.get("quote"),
    rating: formData.get("rating"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { projectId, quote, rating } = parsed.data;

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.clientUserId !== session.user.id) {
      return { ok: false, error: "Not authorized." };
    }
    if (!project.clientId) {
      return { ok: false, error: "No client record linked to this project." };
    }

    // projectId is @unique on Testimonial, so this also naturally prevents
    // submitting a second testimonial for the same project.
    await prisma.testimonial.create({
      data: {
        clientId: project.clientId,
        projectId,
        quote,
        rating,
        approved: false, // studio reviews before it goes public on /testimonials
      },
    });

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("[testimonial] submission failed", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
