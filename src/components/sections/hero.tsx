"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { siteContent } from "@/lib/content";
import { StatCounter } from "@/components/stat-counter";
import { usePointerTracking } from "@/lib/use-pointer-tracking";
import { CursorTrail } from "@/components/cursor-trail";

const RobotScene = dynamic(
  () => import("@/components/three/robot-scene").then((m) => m.RobotScene),
  { ssr: false }
);

export function Hero() {
  const { hero } = siteContent;
  const robotContainerRef = useRef<HTMLDivElement>(null);
  const { pointer, handlePointerDown, handlePointerMove, handlePointerUp } =
    usePointerTracking(robotContainerRef);

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

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {hero.stats.map((s) => (
              <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>

        <div
          ref={robotContainerRef}
          className="relative mt-16 h-[420px] touch-none sm:h-[560px] md:h-[680px] lg:h-[780px]"
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
      </div>
    </section>
  );
}

