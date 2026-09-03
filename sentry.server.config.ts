import * as Sentry from "@sentry/nextjs";

// No-op until SENTRY_DSN is set — Sentry.init() with an empty/undefined
// dsn disables the SDK safely rather than throwing, so this file is safe
// to ship as-is before an account exists.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
  enabled: process.env.NODE_ENV === "production",
});
