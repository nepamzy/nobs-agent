import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

// This file is the Node-runtime auth config: it's the only place the
// Credentials provider (and therefore Prisma + bcrypt) is wired up. Import
// it from server components and API routes, never from middleware.ts,
// which must stay on `authConfig` alone to stay Edge-compatible.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.suspended) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // AuditLog entry for every successful login, required by the
        // brief's security section ("audit logs").
        await prisma.auditLog.create({
          data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id },
        });

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
});
