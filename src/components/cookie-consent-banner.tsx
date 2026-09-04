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

  // No longer a real accept/decline choice — analytics isn't conditional
  // on it (confirmed with the user). This is just a one-time notice; a
  // single dismissal still marks it seen and fires the same event the
  // install-prompt modal waits on before showing itself.
  function handleDismiss() {
    writeConsent("granted");
    setVisible(false);
    window.dispatchEvent(new Event("nobs-consent-changed"));
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-[var(--color-line)] bg-[var(--color-ink)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-5 text-center sm:flex-row sm:text-left">
        <p className="flex-1 text-sm text-[var(--color-paper)] sm:text-base">
          This site uses cookies for basic functionality and analytics to understand how the
          site is used. See the{" "}
          <Link href="/privacy" className="text-[var(--color-brass)] underline underline-offset-4">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
