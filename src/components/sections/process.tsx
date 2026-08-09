"use client";

import { motion } from "framer-motion";
import { siteContent } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/language-context";

export function Process() {
  const { process } = siteContent;
  const { t } = useLanguage();
  const steps = [
    { key: "discover", name: t("process_discover_name"), desc: t("process_discover_desc") },
    { key: "design", name: t("process_design_name"), desc: t("process_design_desc") },
    { key: "build", name: t("process_build_name"), desc: t("process_build_desc") },
    { key: "operate", name: t("process_operate_name"), desc: t("process_operate_desc") },
  ];

  return (
    <section className="border-y border-[var(--color-line)] bg-[var(--color-ink-2)]/40">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
          {t("process_eyebrow")}
        </p>
        <h2 className="mb-12 font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl">
          {t("process_title")}
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative border-l border-[var(--color-line)] pl-5"
            >
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-brass)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-medium">
                {step.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-slate)]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
