import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ApplyForm } from "@/components/apply-form";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return {};
    return {
      title: job.title,
      description: job.description.slice(0, 160),
      alternates: {
        canonical: `/careers/${id}`,
      },
    };
  } catch {
    return {};
  }
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let job;
  try {
    job = await prisma.job.findUnique({ where: { id } });
  } catch {
    job = null;
  }

  if (!job || !job.active) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Careers", href: "/careers" },
          { label: job.title },
        ]}
      />
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        {job.department ? `${job.department} · ` : ""}
        {job.location} · {job.type}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl">
        {job.title}
      </h1>

      <div className="mt-8 space-y-3 text-sm leading-relaxed text-[var(--color-slate)]">
        {job.description.split("\n\n").map((para: string, i: number) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {job.requirements && (
        <div className="mt-8">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-medium">
            What we&apos;re looking for
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-[var(--color-slate)]">
            {job.requirements.split("\n\n").map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}

      <h2 className="mt-10 mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
        Apply
      </h2>
      <ApplyForm jobId={job.id} />
    </div>
  );
}
