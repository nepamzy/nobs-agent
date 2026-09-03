import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Safe to export unconditionally — Sentry.captureRequestError is a no-op
// when the SDK was never initialized (no SENTRY_DSN set).
export const onRequestError = Sentry.captureRequestError;
