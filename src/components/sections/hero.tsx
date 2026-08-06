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

const RobotScene = dynamic(
  () => import("@/components/three/robot-scene").then((m) => m.RobotScene),
  { ssr: false }
);

const flankingTabs = [
  { label: "View Projects", href: "/portfolio", icon: FolderKanban },
  { label: "About", href: "/about", icon: User },
  { label: "Skills", href: "/skills", icon: Wrench },
  { label: "Contact", href: "/contact", icon: Mail },
  { label: "Case Studies", href: "/case-studies", icon: Briefcase },
] as const;

function HeroTab({
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
      className="flex items-center gap-2.5 rounded-full border border-[var(--color-brass)]/40 bg-[var(--color-brass)]/10 px-6 py-3.5 text-base font-medium text-[var(--color-brass)] transition hover:border-[var(--color-brass)] hover:bg-[var(--color-brass)]/20"
    >
      <Icon size={19} />
      {label}
    </Link>
  );
}

export function Hero() {
  const { hero } = siteContent;
  const { data: session } = useSession();
  const [signupOpen, setSignupOpen] = useState(false);
  const robotContainerRef = useRef<HTMLDivElement>(null);
  const { pointer, handlePointerDown, handlePointerMove, handlePointerUp } =
    usePointerTracking(robotContainerRef);

  // "Start a Project" gates through signup first if there's no account
  // yet, exactly the same rule already enforced on the booking form
  // itself, this button just gets a head start on that same check.
  const startProjectTab = session ? (
    <Link
      href="/booking"
      className="flex items-center gap-2.5 rounded-full border border-[var(--color-brass)]/40 bg-[var(--color-brass)]/10 px-6 py-3.5 text-base font-medium text-[var(--color-brass)] transition hover:border-[var(--color-brass)] hover:bg-[var(--color-brass)]/20"
    >
      <Rocket size={19} />
      Start a Project
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => setSignupOpen(true)}
      className="flex items-center gap-2.5 rounded-full border border-[var(--color-brass)]/40 bg-[var(--color-brass)]/10 px-6 py-3.5 text-base font-medium text-[var(--color-brass)] transition hover:border-[var(--color-brass)] hover:bg-[var(--color-brass)]/20"
    >
      <Rocket size={19} />
      Start a Project
    </button>
  );

  const leftTabs = [flankingTabs[0], flankingTabs[1], flankingTabs[2]];
  const rightTabs = [flankingTabs[3], flankingTabs[4]];

  return (
    <section className="relative overflow-hidden">
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--color-ink)]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-3 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]"
          >
            {hero.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-lg text-base text-[var(--color-slate)] sm:text-lg"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href={hero.primaryCta.href}
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
            >
              {hero.primaryCta.label}
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className="text-sm font-medium text-[var(--color-paper)] underline decoration-[var(--color-line)] underline-offset-4 transition hover:decoration-[var(--color-brass)]"
            >
              {hero.secondaryCta.label}
            </Link>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-3">
            {hero.stats.map((s) => (
              <StatCounter
                key={s.label}
                value={s.value}
                suffix={s.suffix}
                label={s.label}
                note={s.note}
              />
            ))}
          </div>
        </div>

        <div className="mt-16 grid items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
          <div className="order-2 flex flex-row flex-wrap justify-center gap-4 lg:order-1 lg:flex-col lg:items-stretch">
            <HeroTab {...leftTabs[0]} />
            <HeroTab {...leftTabs[1]} />
            <HeroTab {...leftTabs[2]} />
          </div>

          <div className="order-1 lg:order-2">
            <div
              ref={robotContainerRef}
              className="relative h-[420px] touch-none sm:h-[560px] md:h-[680px] lg:h-[780px]"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <RobotScene pointer={pointer} />
              <CursorTrail containerRef={robotContainerRef} />
              <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wider text-[var(--color-slate)]/70">
                Drag to rotate
              </p>
            </div>
            <div className="mt-4 flex justify-center">
              <Link
                href="/pricing"
                className="flex items-center gap-2.5 rounded-full border border-[var(--color-brass)]/40 bg-[var(--color-brass)]/10 px-6 py-3.5 text-base font-medium text-[var(--color-brass)] transition hover:border-[var(--color-brass)] hover:bg-[var(--color-brass)]/20"
              >
                <Tags size={19} />
                Pricing
              </Link>
            </div>
          </div>

          <div className="order-3 flex flex-row flex-wrap justify-center gap-4 lg:flex-col lg:items-stretch">
            <HeroTab {...rightTabs[0]} />
            <HeroTab {...rightTabs[1]} />
            {startProjectTab}
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

