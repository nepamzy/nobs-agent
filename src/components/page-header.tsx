"use client";

import { motion } from "framer-motion";
import { Breadcrumbs } from "@/components/breadcrumbs";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-25" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(228,179,67,0.12), rgba(62,214,196,0.06) 55%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 pt-24 pb-4 text-center">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: eyebrow }]} className="justify-center" />

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]"
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl"
        >
          {title}
        </motion.h1>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-4 text-[var(--color-slate)]"
          >
            {description}
          </motion.p>
        )}
      </div>
    </div>
  );
}
