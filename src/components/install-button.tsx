"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";

// Chrome/Edge/Android fire this when the site qualifies as installable —
// same event, same capture pattern as InstallPromptModal (the one-time
// site-wide banner). Multiple independent listeners on the same page each
// get their own reference to the event with no conflict, so this button
// and that banner can coexist without coordinating.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari never sets the standalone display-mode media query when
  // launched from a home-screen icon — it has its own separate flag for it.
  const iosStandalone = (navigator as unknown as { standalone?: boolean }).standalone;
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone === true;
}

// A persistent "Install app" control for signed-in dashboards. Unlike
// InstallPromptModal — a one-time banner shown once site-wide, then never
// again once dismissed — this stays available any time someone wants to
// install later, from wherever they actually spend time in the app.
//
// Renders nothing rather than a dead button: hidden once already installed,
// and on browsers that neither fire `beforeinstallprompt` nor are iOS
// Safari (which has its own manual "Add to Home Screen" flow), there's
// genuinely no install action to offer.
export function InstallButton({ className }: { className?: string }) {
  const [installable, setInstallable] = useState(false);
  const [iosSupported, setIosSupported] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;

    function handlePrompt(e: Event) {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setInstallable(true);
    }
    window.addEventListener("beforeinstallprompt", handlePrompt);

    if (isIos()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIosSupported(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  async function handleClick() {
    if (deferredPrompt.current) {
      const prompt = deferredPrompt.current;
      deferredPrompt.current = null;
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setInstallable(false);
      return;
    }
    if (iosSupported) setShowIosHint((v) => !v);
  }

  if (!installable && !iosSupported) return null;

  return (
    <div className={className ? "relative w-full" : "relative inline-block"}>
      <button
        type="button"
        onClick={handleClick}
        className={
          className ??
          "flex items-center gap-2 text-sm text-[var(--color-slate)] transition hover:text-[var(--color-brass)]"
        }
      >
        <Download size={className ? 16 : 15} />
        Install app
      </button>
      {showIosHint && (
        <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-[var(--color-line)] bg-[var(--color-ink)] p-3 text-xs text-[var(--color-slate)] shadow-lg">
          Tap the Share icon in Safari, then &quot;Add to Home Screen&quot;.
          <button
            type="button"
            onClick={() => setShowIosHint(false)}
            className="mt-2 block text-[var(--color-brass)] underline underline-offset-4"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
