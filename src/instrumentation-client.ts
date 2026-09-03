import * as Sentry from "@sentry/nextjs";

// Client-side counterpart to sentry.server.config.ts/sentry.edge.config.ts.
// Uses NEXT_PUBLIC_SENTRY_DSN (not SENTRY_DSN) since this code ships to
// the browser — same no-op-without-DSN behavior.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  enabled: process.env.NODE_ENV === "production",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
