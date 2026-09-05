import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Deliberately built from `authConfig` alone (no providers, no Prisma) so
// this stays Edge-runtime compatible. It only reads the signed JWT that
// was issued by the full auth.ts config elsewhere — it never queries the
// database.
const { auth } = NextAuth(authConfig);

const REFERRAL_COOKIE = "nobs_ref";
const REFERRAL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

// The site now has a real custom domain — the old Vercel-assigned
// subdomain still resolves (Vercel doesn't let that be turned off), so
// it's redirected here instead, permanently, preserving path and query.
// Deliberately only this one exact hostname, not every *.vercel.app —
// branch preview deployments must keep working unredirected.
const OLD_HOST = "nobs-agent-theta.vercel.app";
const NEW_HOST = "nobs-agent.site";

export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (req.nextUrl.hostname === OLD_HOST) {
    const redirectUrl = new URL(req.nextUrl);
    redirectUrl.hostname = NEW_HOST;
    redirectUrl.port = "";
    redirectUrl.protocol = "https:";
    return NextResponse.redirect(redirectUrl, 308);
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isPortalRoute = pathname.startsWith("/dashboard");
  // /partner/signup is the public self-service page that lets someone
  // BECOME a REFERRER in the first place, it can't require the role it
  // grants; /partner/agreement is the public reference copy of the
  // agreement, read before an account even exists — everything else
  // under /partner is the gated dashboard.
  const isPartnerRoute =
    pathname.startsWith("/partner") &&
    pathname !== "/partner/signup" &&
    pathname !== "/partner/agreement";

  let response: NextResponse;

  if (!isAdminRoute && !isPortalRoute && !isPartnerRoute) {
    response = NextResponse.next();
  } else if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    response = NextResponse.redirect(loginUrl);
  } else if (isAdminRoute && role !== "ADMIN" && role !== "STAFF") {
    response = NextResponse.redirect(new URL("/dashboard", req.url));
  } else if (isPartnerRoute && role !== "REFERRER") {
    response = NextResponse.redirect(new URL("/dashboard", req.url));
  } else {
    response = NextResponse.next();
  }

  // Referral attribution: someone can land on any page from a shared
  // referral link (not just /signup directly), so this runs sitewide
  // rather than being scoped to the gated routes above. Read later by
  // src/app/signup/actions.ts if they go on to create an account.
  const refCode = searchParams.get("ref");
  if (refCode) {
    response.cookies.set(REFERRAL_COOKIE, refCode, {
      maxAge: REFERRAL_COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
