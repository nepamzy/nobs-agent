import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "STAFF" | "CLIENT";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "STAFF" | "CLIENT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "STAFF" | "CLIENT";
  }
}
