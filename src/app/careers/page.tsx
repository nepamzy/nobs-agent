import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { ArrowUpRight, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles at NOBS AGENT.",
};

async function getOpenRoles() {
  try {
    return await prisma.job.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function CareersPage() {
  const roles = await getOpenRoles();

  return (
    <div>
      <PageHeader
        eyebrow="Careers"
        title="Building the next hire list"
        description="Real openings show up here the moment they exist, nothing more, nothing less."
      />
      <div className="mx-auto max-w-2xl px-6 pb-24">
        {roles.length === 0 ? (
          <div className="glass mt-8 rounded-2xl p-8 text-center">
            <p className="text-sm text-[var(--color-slate)]">
              There&apos;s nothing open right now. If you&apos;re a designer or engineer
              who wants to be first in line when that changes, send a short note and a
              link to your work, it goes straight to my inbox, not a form abyss.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
            >
              Introduce yourself
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {roles.map((role) => (
              <li key={role.id}>
                <Link
                  href={`/careers/${role.id}`}
                  className="glass group flex items-center justify-between rounded-xl px-5 py-4 transition hover:border-[var(--color-brass)]/50"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase size={16} className="shrink-0 text-[var(--color-brass)]" />
                    <div>
                      <p className="font-medium">{role.title}</p>
                      <p className="text-xs text-[var(--color-slate)]">
                        {role.department ? `${role.department} · ` : ""}
                        {role.location} · {role.type}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-[var(--color-slate)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-brass)]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
