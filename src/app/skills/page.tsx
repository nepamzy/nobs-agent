import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills",
  description: "The actual tools NOBS AGENT builds with, day to day.",
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
];

export default function SkillsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Tech stack
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-medium">
        Tools I work with
      </h1>
      <p className="mt-4 max-w-lg text-[var(--color-slate)]">
        A focused set of tools used to ship real, working systems, not a buzzword list.
        Everything here is something NOBS AGENT actually builds with, on this platform
        included.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {stack.map((t) => (
          <div
            key={t.name}
            className="glass flex flex-col items-center gap-3 rounded-2xl p-5 text-center"
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl font-[family-name:var(--font-mono)] text-sm font-bold"
              style={{ backgroundColor: t.color, color: t.text }}
            >
              {t.tag}
            </div>
            <p className="text-sm text-[var(--color-paper)]">{t.name}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-[var(--color-brass)]/30 bg-[var(--color-brass)]/5 p-8">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
          And, honestly
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-medium">
          Claude
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--color-slate)]">
          This entire platform, the portal, the payments, the messaging, all of it, was
          built working directly with Claude. Not as a shortcut, as a real part of the
          process. Knowing how to actually use AI well isn&apos;t typing a request and
          hoping, it&apos;s knowing what to ask for, reading what comes back critically,
          catching what&apos;s wrong before it ships, and verifying everything actually
          works rather than just looks right. That&apos;s a genuine skill, and treating
          it as one, rather than pretending it doesn&apos;t exist, is exactly how this
          got built as fast and as solid as it did. No pretending otherwise. That&apos;s
          the whole point of the name.
        </p>
      </div>
    </div>
  );
}
