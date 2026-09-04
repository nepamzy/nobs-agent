import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "STAFF" | "CLIENT" | "REFERRER";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "STAFF" | "CLIENT" | "REFERRER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "STAFF" | "CLIENT" | "REFERRER";
  }
}
