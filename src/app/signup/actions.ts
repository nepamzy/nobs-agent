"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(150),
  organization: z.string().trim().max(150).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(20),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignupResult = { ok: true } | { ok: false; error: string };

export async function createClientAccount(formData: FormData): Promise<SignupResult> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    organization: formData.get("organization"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, organization, email, phone, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: "An account with this email already exists. Try signing in instead." };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "CLIENT",
      },
    });

    // Every client gets a linked Client record on signup, so admin work
    // (attaching projects, testimonials) has somewhere to point immediately.
    await prisma.client.create({
      data: {
        name,
        organization: organization || null,
        userId: user.id,
      },
    });

    return { ok: true };
  } catch (err) {
    console.error("[signup] failed", err);
    return { ok: false, error: "Something went wrong creating your account. Please try again." };
  }
}
