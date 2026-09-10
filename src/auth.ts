import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

// Distinct error code so the login form can show "Account suspended"
// instead of a generic "invalid credentials" — surfaced to the client via
// signIn()'s returned `code`, not `error` (which stays "CredentialsSignin"
// either way). See src/components/login-form.tsx.
class AccountSuspendedError extends CredentialsSignin {
  code = "account_suspended";
}

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

        const user = await prisma.user.findUnique({
          where: { email },
          include: { referralPartner: { select: { suspended: true } } },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Checked after the password so a wrong password on a suspended
        // account still looks like ordinary "invalid credentials", not a
        // confirmation the email exists and is suspended.
        if (user.suspended || (user.role === "REFERRER" && user.referralPartner?.suspended)) {
          throw new AccountSuspendedError();
        }

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
