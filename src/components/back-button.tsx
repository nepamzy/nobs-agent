"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Real browser back only when the visitor actually navigated here from
// somewhere else on the site — that's the only case where history.back()
// lands somewhere useful (with scroll position, filters, etc. intact).
// A direct link, a new tab, or an external referrer (search result, a
// shared link) has no usable in-site history, so back would either do
// nothing or bounce the visitor off the site entirely; falling back to
// the parent path keeps it from ever being a dead end.
export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  const handleBack = () => {
    const cameFromThisSite =
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer.startsWith(window.location.origin);

    if (cameFromThisSite) {
      router.back();
      return;
    }

    const parent = pathname.split("/").filter(Boolean).slice(0, -1).join("/");
    router.push(parent ? `/${parent}` : "/");
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back"
      title="Go back"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--color-paper)] transition hover:border-[var(--color-brass)] hover:text-[var(--color-brass)]"
    >
      <ArrowLeft size={17} />
    </button>
  );
}
