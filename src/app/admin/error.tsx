"use client";

import { useEffect } from "react";

// Catches anything an admin page or action throws without its own
// handling (Next.js requires this file to be a Client Component). Without
// it, any uncaught error anywhere under /admin — not just the portfolio
// form this was written for — fell straight through to Next.js's generic,
// unstyled error screen with no way back except re-navigating, which from
// the admin's seat just looks like the page broke with no explanation.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] unhandled error", error);
  }, [error]);

  return (
    <div className="glass mx-auto mt-12 max-w-lg space-y-4 rounded-2xl p-8 text-center">
      <p className="font-[family-name:var(--font-display)] text-lg font-medium">
        Something went wrong
      </p>
      <p className="text-sm text-[var(--color-slate)]">{error.message || "Please try again."}</p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
