"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const EXCLUDED_PREFIXES = ["/admin", "/dashboard", "/api"];
const STORAGE_KEY = "nobs_visitor";

// A random ID generated once per browser and reused for every page view
// that day, this is the actual fix for the "same person counted 4 times"
// bug. IP address was never a reliable way to recognize the same visitor,
// mobile carriers routinely rotate a phone's IP mid-session, so the same
// person browsing a few pages could get fingerprinted as several
// different visitors. A random ID stored in the browser doesn't have
// that problem, same browser, same ID, regardless of what the network
// does underneath it. It still rotates daily on purpose, so this never
// becomes a long-term identifier, only "was this the same visitor today."
function getOrCreateVisitorId(): string {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { id: string; date: string };
      if (parsed.date === today && parsed.id) return parsed.id;
    }
  } catch {
    // fall through to generating a new one
  }

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, date: today }));
  } catch {
    // localStorage unavailable (private browsing, etc.), tracking still
    // works, it just won't dedupe as reliably for that visitor.
  }

  return id;
}

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return;

    const visitorId = getOrCreateVisitorId();

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, visitorId }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
