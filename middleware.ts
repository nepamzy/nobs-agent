import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Deliberately built from `authConfig` alone (no providers, no Prisma) so
// this stays Edge-runtime compatible. It only reads the signed JWT that
// was issued by the full auth.ts config elsewhere — it never queries the
// database.
const { auth } = NextAuth(authConfig);

function homeFor(role: string | undefined) {
  return role === "MIDDLEMAN" ? "/middleman/dashboard" : "/dashboard";
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  const isAdminRoute = pathname.startsWith("/admin");
  const isPortalRoute = pathname.startsWith("/dashboard");
  const isMiddlemanRoute = pathname.startsWith("/middleman/dashboard");

  if (!isAdminRoute && !isPortalRoute && !isMiddlemanRoute) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && role !== "ADMIN" && role !== "STAFF") {
    return NextResponse.redirect(new URL(homeFor(role), req.url));
  }

  if (isPortalRoute && role === "MIDDLEMAN") {
    return NextResponse.redirect(new URL("/middleman/dashboard", req.url));
  }

  if (isMiddlemanRoute && role !== "MIDDLEMAN") {
    return NextResponse.redirect(new URL(homeFor(role), req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/middleman/dashboard/:path*"],
};
