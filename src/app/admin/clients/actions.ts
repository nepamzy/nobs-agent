"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }
}

const clientSchema = z.object({
  name: z.string().trim().min(2).max(150),
  organization: z.string().trim().max(150).optional().or(z.literal("")),
  sector: z.string().trim().max(100).optional().or(z.literal("")),
  logoUrl: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function createClient(formData: FormData) {
  await requireAdmin();
  const parsed = clientSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  await prisma.client.create({
    data: {
      name: parsed.data.name,
      organization: parsed.data.organization || null,
      sector: parsed.data.sector || null,
      logoUrl: parsed.data.logoUrl || null,
    },
  });

  revalidatePath("/admin/clients");
  revalidatePath("/clients");
}

export async function updateClient(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing client id.");

  const parsed = clientSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  await prisma.client.update({
    where: { id },
    data: {
      name: parsed.data.name,
      organization: parsed.data.organization || null,
      sector: parsed.data.sector || null,
      logoUrl: parsed.data.logoUrl || null,
    },
  });

  revalidatePath("/admin/clients");
  revalidatePath("/clients");
}

export async function deleteClient(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing client id.");

  // A hard delete, but done safely: detach dependent records first so a
  // foreign-key constraint doesn't silently block the delete. Testimonials
  // belong to the client so they go too; projects and bookings are kept
  // (they're real project/payment history) but unlinked from this client.
  await prisma.$transaction([
    prisma.testimonial.deleteMany({ where: { clientId: id } }),
    prisma.project.updateMany({ where: { clientId: id }, data: { clientId: null } }),
    prisma.booking.updateMany({ where: { clientId: id }, data: { clientId: null } }),
    prisma.client.delete({ where: { id } }),
  ]);

  revalidatePath("/admin/clients");
  revalidatePath("/clients");
}

const testimonialSchema = z.object({
  clientId: z.string().trim().min(1),
  quote: z.string().trim().min(5),
  rating: z.coerce.number().int().min(1).max(5),
});

export async function createTestimonial(formData: FormData) {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  await prisma.testimonial.create({
    data: { ...parsed.data, approved: true },
  });

  revalidatePath("/admin/clients");
  revalidatePath("/testimonials");
}

export async function toggleTestimonialFeatured(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const featured = formData.get("featured") === "true";
  if (typeof id !== "string") throw new Error("Missing testimonial id.");

  await prisma.testimonial.update({ where: { id }, data: { featured: !featured } });
  revalidatePath("/admin/clients");
  revalidatePath("/testimonials");
}

export async function deleteTestimonial(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing testimonial id.");

  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/clients");
  revalidatePath("/testimonials");
}
