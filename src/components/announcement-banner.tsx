"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function AnnouncementBanner() {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center gap-2 bg-[var(--color-brass)] px-6 py-2 text-center text-xs font-medium text-[var(--color-ink)] sm:text-sm">
      <Link href="/booking" className="inline-flex items-center gap-1.5 underline underline-offset-2">
        {t("banner_accepting")}
        <ArrowRight size={13} />
      </Link>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[var(--color-ink)]/70 transition hover:text-[var(--color-ink)]"
      >
        <X size={14} />
      </button>
    </div>
  );
}
