"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-12 divide-y divide-[var(--color-line)] border-t border-b border-[var(--color-line)]">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-[family-name:var(--font-display)] text-base font-medium sm:text-lg">
                {item.q}
              </span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-[var(--color-brass)] transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-sm text-[var(--color-slate)]">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
