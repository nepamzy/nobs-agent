"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function ReferralLinkCopy({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be blocked (permissions, non-HTTPS in dev over
      // LAN, etc.) — the link text is still visible and selectable, so
      // failing silently here doesn't strand the user.
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--color-paper)]">
        {link}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-brass)] px-4 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
