"use client";

import { useEffect } from "react";

export function HashScroll() {
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    // Slight delay so the carousel has laid out before we scroll to it.
    const timeout = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    return () => clearTimeout(timeout);
  }, []);

  return null;
}
