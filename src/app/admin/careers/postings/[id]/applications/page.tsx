import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function JobApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let job;
  try {
    job = await prisma.job.findUnique({
      where: { id },
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
          include: { messages: { where: { fromAdmin: false, readByAdmin: false } } },
        },
      },
    });
  } catch {
    job = null;
  }

  if (!job) notFound();

  return (
    <div>
      <Link
        href="/admin/careers"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to careers
      </Link>
      <h1 className="mt-4 mb-6 font-[family-name:var(--font-display)] text-2xl font-medium">
        Applications for {job.title}
      </h1>

      {job.applications.length === 0 ? (
        <p className="text-sm text-[var(--color-slate)]">No applications yet.</p>
      ) : (
        <div className="space-y-2">
          {job.applications.map((app: { id: string; name: string; email: string; status: string; messages: unknown[] }) => (
            <Link
              key={app.id}
              href={`/admin/careers/applications/${app.id}`}
              className="glass group relative flex items-center justify-between rounded-xl p-4 text-sm transition hover:border-[var(--color-brass)]/50"
            >
              <div>
                <p className="font-medium">{app.name}</p>
                <p className="text-xs text-[var(--color-slate)]">
                  {app.email} · {app.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {app.messages.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brass)] text-[10px] font-bold text-[var(--color-ink)]">
                    {app.messages.length}
                  </span>
                )}
                <ArrowUpRight
                  size={16}
                  className="text-[var(--color-slate)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-brass)]"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
