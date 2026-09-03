import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// Every external host this app actually talks to from the browser —
// checkout SDKs (Paystack/Flutterwave), Cloudinary uploads/delivery,
// Google Analytics/GTM, and drei's HDR environment-map CDN for the 3D
// hero. Keep this list in sync with what's really loaded; a stray fetch
// or embed will otherwise fail silently behind the CSP below.
const isDev = process.env.NODE_ENV !== "production";

const ContentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' is required here because Next.js App Router hydration
  // and the GTM/Paystack/Flutterwave snippets rely on inline <script>
  // tags with no nonce plumbing in this app. Tightening this to a
  // nonce-based policy is real future work, not an oversight.
  // 'unsafe-eval' is dev-only — Next.js Fast Refresh needs it, React
  // never uses eval() in a production build.
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://www.googletagmanager.com https://js.paystack.co https://checkout.flutterwave.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://www.googletagmanager.com https://www.google-analytics.com",
  "font-src 'self' data:",
  // raw.githack.com serves the HDR environment map @react-three/drei's
  // <Environment preset="studio" /> loads for the homepage's 3D robot hero
  // — it 301-redirects to raw.githubusercontent.com, and CSP connect-src
  // is enforced against the redirect target too, so both are needed.
  // o4511891311296512.ingest.de.sentry.io is where the browser SDK sends
  // error reports directly (see next.config.ts's withSentryConfig comment
  // for why this isn't tunneled through our own /monitoring route).
  "connect-src 'self' https://api.cloudinary.com https://www.google-analytics.com https://www.googletagmanager.com https://api.paystack.co https://api.flutterwave.com https://checkout.flutterwave.com https://raw.githack.com https://raw.githubusercontent.com https://o4511891311296512.ingest.de.sentry.io",
  // Paystack/Flutterwave's checkout SDKs open their payment UI in an
  // embedded iframe from these hosts — verify against a real test
  // transaction before relying on this list in production.
  "frame-src 'self' https://js.paystack.co https://checkout.paystack.com https://standard.paystack.co https://checkout.flutterwave.com",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  // Only takes effect once the site is actually served over HTTPS, which
  // is expected in production (Vercel enforces this by default).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  // Prisma 7's driver-adapter architecture (@prisma/client + pg) needs to
  // stay as real Node packages rather than get bundled by Turbopack —
  // without this, production builds fail to resolve the native pg driver.
  serverExternalPackages: ["@prisma/client", "pg"],
  images: {
    // Admin-uploaded portfolio/blog cover images and attachments live on
    // Cloudinary — without this, next/image refuses to optimize them.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withSentryConfig(nextConfig, {
  // Source map upload is silent and skipped entirely unless these three
  // are set, so this is safe to ship before a Sentry project exists.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  // Deliberately NOT using tunnelRoute here — it requires a working
  // rewrite that proved unreliable to verify in this deployment setup
  // (requests to it 404'd instead of reaching Sentry). The browser SDK
  // sends events straight to Sentry's ingest domain instead, which is
  // simpler and directly testable; the CSP connect-src above allows it.
  webpack: { treeshake: { removeDebugLogging: true } },
  telemetry: false,
});
