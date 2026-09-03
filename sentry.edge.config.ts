import * as Sentry from "@sentry/nextjs";

// Runs in middleware.ts and any Edge API routes — kept minimal since the
// Edge runtime can't do everything the Node SDK can (no local variables,
// no most integrations). Same no-op-without-DSN behavior as the server config.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
  enabled: process.env.NODE_ENV === "production",
});
