"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Search, Check } from "lucide-react";
import { useCurrency, CURRENCIES } from "@/lib/currency-context";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      c.name.toLowerCase().includes(query.toLowerCase())
  );

  const currentMeta = CURRENCIES.find((c) => c.code === currency);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3.5 py-2 text-sm transition hover:border-[var(--color-brass)]"
      >
        <Globe size={15} />
        {currentMeta?.code}
      </button>

      {open && (
        <div className="glass absolute right-0 z-20 mt-2 w-72 rounded-xl p-3 shadow-xl">
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search currency..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-brass)]"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-2 py-3 text-xs text-[var(--color-slate)]">No match found.</p>
            )}
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCurrency(c.code);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-white/5"
              >
                <span>
                  <span className="font-medium">{c.code}</span>{" "}
                  <span className="text-[var(--color-slate)]">{c.name}</span>
                </span>
                {c.code === currency && <Check size={14} className="text-[var(--color-brass)]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
