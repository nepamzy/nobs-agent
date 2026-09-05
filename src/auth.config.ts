import type { NextAuthConfig } from "next-auth";

// Deliberately has NO providers here. Providers that touch Prisma/bcrypt
// (Node-only APIs) live in auth.ts and are only pulled in by server
// components and API routes, which run on the Node runtime. Middleware
// runs on the Edge runtime and can only safely import this file, it
// reads the already-signed JWT to check role, it never queries the
// database directly.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  // Auth.js only auto-trusts the request host on Vercel (it checks for the
  // VERCEL env var). Without this, every other host — Render, Docker,
  // even `next start` on your own machine — throws UntrustedHost on every
  // session check, 500ing /api/auth/session site-wide. Safe here because
  // NEXTAUTH_URL is already an explicitly configured env var, not derived
  // from an untrusted request header.
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "STAFF" | "CLIENT" | "MIDDLEMAN";
      }
      return session;
    },
  },
};
