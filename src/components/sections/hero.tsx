"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, FolderKanban, Rocket, User, Wrench, Mail, Briefcase, Tags } from "lucide-react";
import { siteContent } from "@/lib/content";
import { StatCounter } from "@/components/stat-counter";
import { usePointerTracking } from "@/lib/use-pointer-tracking";
import { CursorTrail } from "@/components/cursor-trail";
import { SignupPromptModal } from "@/components/signup-prompt-modal";
import { useLanguage } from "@/lib/i18n/language-context";

const RobotScene = dynamic(
  () => import("@/components/three/robot-scene").then((m) => m.RobotScene),
  { ssr: false }
);

const quickLinks = [
  { label: "View Projects", href: "/portfolio", icon: FolderKanban },
  { label: "About", href: "/about", icon: User },
  { label: "Skills", href: "/skills", icon: Wrench },
  { label: "Pricing", href: "/pricing", icon: Tags },
  { label: "Case Studies", href: "/case-studies", icon: Briefcase },
  { label: "Contact", href: "/contact", icon: Mail },
] as const;

function QuickLink({
  label,
  href,
  icon: Icon,
}: {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-ink-2)]/60 px-4 py-2 text-sm font-medium text-[var(--color-slate)] transition hover:border-[var(--color-brass)]/60 hover:text-[var(--color-brass)]"
    >
      <Icon size={15} />
      {label}
    </Link>
  );
}

export function Hero() {
  const { hero } = siteContent;
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [signupOpen, setSignupOpen] = useState(false);
  const robotContainerRef = useRef<HTMLDivElement>(null);
  const { pointer, handlePointerDown, handlePointerMove, handlePointerUp } =
    usePointerTracking(robotContainerRef);

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
          {/* Left: copy, CTAs, stats, quick links */}
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
              className="mx-auto mt-12 grid max-w-md grid-cols-1 gap-6 sm:grid-cols-3 lg:mx-0"
            >
              <StatCounter value={11} suffix="" label={t("stat_sectors")} />
              <StatCounter value={99} suffix=".9%" label={t("stat_uptime")} />
              <StatCounter value={1} suffix=" month" label={t("stat_launch")} note={t("stat_launch_note")} />
            </motion.div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              {quickLinks.map((link) => (
                <QuickLink key={link.href} {...link} />
              ))}
            </div>
          </div>

          {/* Right: the robot, given its own visual stage rather than being boxed in by nav pills */}
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(62,214,196,0.16), rgba(228,179,67,0.08) 45%, transparent 70%)",
              }}
            />
            <div
              ref={robotContainerRef}
              className="relative h-[380px] touch-none sm:h-[480px] md:h-[560px] lg:h-[640px]"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <RobotScene pointer={pointer} />
              <CursorTrail containerRef={robotContainerRef} />
              <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wider text-[var(--color-slate)]/70">
                Drag to rotate
              </p>
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
