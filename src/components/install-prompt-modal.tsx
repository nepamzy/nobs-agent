"use client";

import { useEffect, useState, useRef } from "react";
import { Download, X } from "lucide-react";

const SEEN_KEY = "nobs_install_prompt_seen";

// Chrome/Edge/Android fire a real `beforeinstallprompt` event when the
// site qualifies as installable, that event has to be captured and
// held onto, the browser only offers it once and expects a listener
// already in place, not requested after the fact. Safari/iOS never
// fires this at all, "Add to Home Screen" there is a manual Share-menu
// action with no programmatic trigger, so this prompt only ever
// appears where the browser genuinely supports it.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPromptModal() {
  const [visible, setVisible] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function handlePrompt(e: Event) {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
    }
    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  useEffect(() => {
    function handleConsentChanged() {
      const alreadySeen = localStorage.getItem(SEEN_KEY) === "true";
      const alreadyInstalled = window.matchMedia("(display-mode: standalone)").matches;
      if (alreadySeen || alreadyInstalled) return;

      // Give the browser a moment to actually deliver the event before
      // deciding there's nothing to offer, it can arrive slightly after
      // page load.
      setTimeout(() => {
        if (deferredPrompt.current) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setVisible(true);
        }
      }, 800);
    }
    window.addEventListener("nobs-consent-changed", handleConsentChanged);
    return () => window.removeEventListener("nobs-consent-changed", handleConsentChanged);
  }, []);

  async function handleInstall() {
    localStorage.setItem(SEEN_KEY, "true");
    setVisible(false);
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    deferredPrompt.current = null;
  }

  function handleDismiss() {
    localStorage.setItem(SEEN_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] border-t border-[var(--color-line)] bg-[var(--color-ink)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-5 text-center sm:flex-row sm:text-left">
        <div className="flex flex-1 items-center gap-3">
          <Download size={22} className="shrink-0 text-[var(--color-brass)]" />
          <p className="text-sm text-[var(--color-paper)] sm:text-base">
            Install the NOBS AGENT app for quicker access, works right from your home
            screen, no browser tab needed.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--color-brass)]"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
          >
            <Download size={14} />
            Install
          </button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 text-[var(--color-slate)] hover:text-[var(--color-paper)] sm:hidden"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
