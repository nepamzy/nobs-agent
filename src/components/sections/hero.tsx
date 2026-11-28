"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, FolderKanban, Rocket, User, Wrench, Mail, Briefcase, Tags } from "lucide-react";
import { siteContent } from "@/lib/content";
import { StatCounter } from "@/components/stat-counter";
import { companyFacts } from "@/lib/company-facts";
import { SignupPromptModal } from "@/components/signup-prompt-modal";
import { useLanguage } from "@/lib/i18n/language-context";

const layers = [
  { title: "Interface", detail: "Websites, portals and apps people use", color: "#e4b343" },
  { title: "Logic & APIs", detail: "Integrations and payments that connect", color: "#3ed6c4" },
  { title: "Data", detail: "Databases and backups you can rely on", color: "#8b7cf6" },
  { title: "Security", detail: "Login and access control built in", color: "#4aa3ff" },
] as const;

const quickLinks = [
  { label: "View Projects", href: "/portfolio", icon: FolderKanban },
  { label: "About", href: "/about", icon: User },
  { label: "Skills", href: "/skills", icon: Wrench },
  { label: "Packages", href: "/pricing", icon: Tags },
  { label: "Case Studies", href: "/case-studies", icon: Briefcase },
  { label: "Contact", href: "/contact", icon: Mail },
] as const;

function QuickLink({
  label,
  href,
  icon: Icon,
  index,
}: {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: [0, -6, 0] }}
      transition={{
        opacity: { duration: 0.5, delay: 0.5 + index * 0.06 },
        y: {
          duration: 3.2 + index * 0.3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5 + index * 0.25,
        },
      }}
    >
      <Link
        href={href}
        className="glass flex items-center gap-2.5 rounded-2xl border border-[var(--color-brass)]/35 px-5 py-3.5 text-base font-medium text-[var(--color-brass)] shadow-lg shadow-black/20 transition hover:border-[var(--color-brass)] hover:bg-[var(--color-brass)]/10"
      >
        <Icon size={19} />
        {label}
      </Link>
    </motion.div>
  );
}

export function Hero({ clientCount }: { clientCount: number }) {
  const { hero } = siteContent;
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [signupOpen, setSignupOpen] = useState(false);

  // "Start a Project" gates through signup first if there's no account
  // yet, exactly the same rule already enforced on the booking form
  // itself, this button just gets a head start on that same check.
  const startProjectCta = session ? (
    <Link
      href="/booking"
      className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
    >
      <Rocket size={16} />
      Start a Project
      <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => setSignupOpen(true)}
      className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
    >
      <Rocket size={16} />
      Start a Project
      <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
    </button>
  );

  return (
    <section className="relative overflow-hidden">
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--color-ink)]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          {/* Left: copy, CTAs, stats */}
          <div className="text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-3 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]"
            >
              {t("hero_eyebrow")}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
            >
              {t("hero_title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-lg text-base text-[var(--color-slate)] sm:text-lg lg:mx-0"
            >
              {t("hero_subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              {startProjectCta}
              <Link
                href={hero.secondaryCta.href}
                className="text-sm font-medium text-[var(--color-paper)] underline decoration-[var(--color-line)] underline-offset-4 transition hover:decoration-[var(--color-brass)]"
              >
                {t("hero_secondary_cta")}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mx-auto mt-12 max-w-xl lg:mx-0"
            >
              <div className="grid grid-cols-2 gap-6 text-left sm:grid-cols-3">
                <StatCounter value={clientCount} label={t("stat_clients")} />
                <StatCounter
                  value={companyFacts.referralPartners.count}
                  suffix={companyFacts.referralPartners.plus ? "+" : ""}
                  label={t("stat_partners")}
                />
                <StatCounter
                  value={companyFacts.reportedSuccessRatePercent}
                  suffix="%"
                  label={t("stat_success")}
                  note={t("stat_success_note")}
                />
              </div>
            </motion.div>
          </div>

          {/* Right: quick-nav pills */}
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(62,214,196,0.16), rgba(228,179,67,0.08) 45%, transparent 70%)",
              }}
            />
            {/* Plain <img>, not next/image: it is a tiny static SVG, and an
                <img> keeps the SVG's own drift animation running. It has no
                pointer handlers or touch-action, so it never blocks scrolling. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-stack.svg"
              alt="NOBS Agent builds in four layers: interface, logic and APIs, data, and security."
              width={480}
              height={640}
              className="mx-auto h-auto w-full max-w-[300px] sm:max-w-[360px]"
            />

            <ul className="mx-auto mt-6 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
              {layers.map((layer) => (
                <li
                  key={layer.title}
                  className="rounded-xl border border-[var(--color-line)] bg-[var(--color-ink-2)] p-4"
                >
                  <p className="flex items-center gap-2.5 text-base font-semibold text-[var(--color-paper)]">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: layer.color }} />
                    {layer.title}
                  </p>
                  <p className="mt-1 pl-[22px] text-sm text-[var(--color-paper)]/75">{layer.detail}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {quickLinks.map((link, index) => (
                <QuickLink key={link.href} index={index} {...link} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <SignupPromptModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSuccess={() => {
          setSignupOpen(false);
          window.location.href = "/booking";
        }}
      />
    </section>
  );
}
