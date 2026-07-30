"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failing shouldn't break the site, PWA install
        // and offline support are enhancements, not requirements.
      });
    }
  }, []);

  return null;
}
