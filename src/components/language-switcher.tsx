"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { languages } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/language-context";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = languages.find((l) => l.code === language);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${current?.label ?? "Language"}, change language`}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs transition hover:border-[var(--color-brass)]"
      >
        <Globe size={14} />
        {current?.label}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-40 overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-ink)] py-1 shadow-xl">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLanguage(l.code);
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-2 text-left text-xs transition hover:bg-white/5 ${
                l.code === language ? "text-[var(--color-brass)]" : "text-[var(--color-paper)]"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
