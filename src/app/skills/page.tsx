import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { RevealItem } from "@/components/reveal-item";

export const metadata: Metadata = {
  title: "Skills",
  description: "The actual tools NOBS AGENT builds with, day to day.",
  alternates: {
    canonical: "/skills",
  },
};

const stack = [
  { name: "Next.js", tag: "N", color: "#0a0a0a", text: "#ffffff" },
  { name: "TypeScript", tag: "TS", color: "#3178c6", text: "#ffffff" },
  { name: "Tailwind CSS", tag: "TW", color: "#0ea5b7", text: "#ffffff" },
  { name: "React", tag: "R", color: "#149eca", text: "#ffffff" },
  { name: "React Three Fiber", tag: "R3F", color: "#1f2937", text: "#3ed6c4" },
  { name: "Framer Motion", tag: "FM", color: "#e11d48", text: "#ffffff" },
  { name: "Prisma", tag: "PR", color: "#0f172a", text: "#38bdf8" },
  { name: "PostgreSQL", tag: "PG", color: "#336791", text: "#ffffff" },
  { name: "Neon", tag: "NE", color: "#00e599", text: "#0a0a0a" },
  { name: "Auth.js", tag: "AU", color: "#4a4a4a", text: "#ffffff" },
  { name: "Cloudinary", tag: "CL", color: "#3448c5", text: "#ffffff" },
  { name: "Paystack", tag: "PS", color: "#00c3f7", text: "#0a0a0a" },
  { name: "Flutterwave", tag: "FW", color: "#f5a623", text: "#0a0a0a" },
  { name: "Brevo", tag: "BR", color: "#0b996e", text: "#ffffff" },
  { name: "Vercel", tag: "▲", color: "#000000", text: "#ffffff" },
  { name: "Git", tag: "GIT", color: "#f1502f", text: "#ffffff" },
  { name: "AI", tag: "AI", color: "#e4b343", text: "#0a0a0a" },
];

export default function SkillsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Tech stack"
        title="Tools we work with"
        description="A focused set of tools used to ship real, working systems, not a buzzword list. Everything here is something NOBS AGENT actually builds with, on this platform included."
      />

      <div className="mx-auto max-w-4xl px-6 pt-8 pb-20">
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {stack.map((t, i) => (
          <RevealItem
            key={t.name}
            index={i}
            className="glass flex flex-col items-center gap-3 rounded-2xl p-5 text-center"
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl font-[family-name:var(--font-mono)] text-sm font-bold"
              style={{ backgroundColor: t.color, color: t.text }}
            >
              {t.tag}
            </div>
            <p className="text-sm text-[var(--color-paper)]">{t.name}</p>
          </RevealItem>
        ))}
      </div>
      </div>
    </div>
  );
}
