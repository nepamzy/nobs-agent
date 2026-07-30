"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readConsent, writeConsent } from "@/lib/consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(readConsent() === null);
  }, []);

  function handleChoice(status: "granted" | "denied") {
    writeConsent(status);
    setVisible(false);
    window.dispatchEvent(new Event("nobs-consent-changed"));
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-[var(--color-line)] bg-[var(--color-ink)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-5 text-center sm:flex-row sm:text-left">
        <p className="flex-1 text-sm text-[var(--color-paper)] sm:text-base">
          This site uses cookies for basic functionality and, if you allow it, anonymous
          analytics to understand how the site is used. See the{" "}
          <Link href="/privacy" className="text-[var(--color-brass)] underline underline-offset-4">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => handleChoice("denied")}
            className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--color-brass)]"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleChoice("granted")}
            className="rounded-full bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
