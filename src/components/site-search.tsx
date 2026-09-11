"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, X, CornerDownLeft } from "lucide-react";
import { siteMapFor, type SiteMapEntry } from "@/lib/site-map";

export function SiteSearch() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo(() => siteMapFor(session?.user.role), [session?.user.role]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        e.section.toLowerCase().includes(q) ||
        e.href.toLowerCase().includes(q)
    );
  }, [entries, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const go = (entry: SiteMapEntry) => {
    close();
    router.push(entry.href);
  };

  // Cmd+K / Ctrl+K opens the palette from anywhere on the site.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = results[activeIndex];
      if (entry) go(entry);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the site"
        title="Search (Ctrl+K)"
        className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-[var(--color-paper)] transition hover:border-[var(--color-brass)] hover:text-[var(--color-brass)] sm:w-44 sm:justify-start"
      >
        <Search size={16} className="shrink-0" />
        <span className="hidden text-sm text-[var(--color-slate)] sm:inline">Search...</span>
        <kbd className="ml-auto hidden rounded border border-white/10 px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-slate)] sm:inline">
          Ctrl K
        </kbd>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-24 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="glass w-full max-w-lg overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
              <Search size={16} className="shrink-0 text-[var(--color-slate)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Search pages you have access to..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-slate)]"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="shrink-0 text-[var(--color-slate)] transition hover:text-[var(--color-paper)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-[var(--color-slate)]">
                  No pages match &ldquo;{query}&rdquo;.
                </p>
              ) : (
                results.map((entry, i) => (
                  <button
                    key={entry.href}
                    type="button"
                    onClick={() => go(entry)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      i === activeIndex
                        ? "bg-[var(--color-brass)]/15 text-[var(--color-paper)]"
                        : "text-[var(--color-slate)] hover:bg-white/5"
                    }`}
                  >
                    <span className="flex flex-col">
                      <span className="font-medium text-[var(--color-paper)]">{entry.label}</span>
                      <span className="text-xs text-[var(--color-slate)]">
                        {entry.section} · {entry.href}
                      </span>
                    </span>
                    {i === activeIndex && (
                      <CornerDownLeft size={14} className="shrink-0 text-[var(--color-brass)]" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
