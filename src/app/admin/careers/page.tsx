import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleJobActive, deleteJob } from "./actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Plus, Eye, EyeOff, Trash2, Pencil, MessageSquare } from "lucide-react";

async function getJobs() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        applications: {
          include: { messages: { where: { fromAdmin: false, readByAdmin: false } } },
        },
      },
    });
    return { jobs, connected: true };
  } catch {
    return { jobs: [], connected: false };
  }
}

export default async function AdminCareersPage() {
  const { jobs, connected } = await getJobs();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
          Careers
        </h1>
        <Link
          href="/admin/careers/postings/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
        >
          <Plus size={15} /> New posting
        </Link>
      </div>

      {!connected && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-[var(--color-slate)]">
          Not connected to a database yet.
        </div>
      )}

      {connected && jobs.length === 0 && (
        <p className="mt-8 text-sm text-[var(--color-slate)]">
          No postings yet. Create one to start accepting applications.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {jobs.map((job) => {
          const unreadCount = job.applications.reduce(
            (sum: number, a: { messages: unknown[] }) => sum + a.messages.length,
            0
          );
          return (
            <div key={job.id} className="glass rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {job.title}
                    {!job.active && (
                      <span className="ml-2 rounded-full border border-[var(--color-line)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-slate)]">
                        Closed
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-slate)]">
                    {job.department ? `${job.department} · ` : ""}
                    {job.location} · {job.type}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/careers/postings/${job.id}/applications`}
                    className="relative inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs font-medium transition hover:border-[var(--color-brass)]"
                  >
                    <MessageSquare size={13} /> {job.applications.length}
                    {job.capacity != null ? ` / ${job.capacity}` : ""} applicant
                    {job.applications.length === 1 ? "" : "s"}
                    {job.capacity != null && job.applications.length >= job.capacity && (
                      <span className="ml-1 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-red-400">
                        Full
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-brass)] text-[10px] font-bold text-[var(--color-ink)]">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <form action={toggleJobActive}>
                    <input type="hidden" name="id" value={job.id} />
                    <input type="hidden" name="active" value={String(job.active)} />
                    <button
                      type="submit"
                      title={job.active ? "Close posting" : "Reopen posting"}
                      className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-[var(--color-brass)]"
                    >
                      {job.active ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </form>
                  <Link
                    href={`/admin/careers/postings/${job.id}/edit`}
                    className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-[var(--color-brass)]"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </Link>
                  <form action={deleteJob}>
                    <input type="hidden" name="id" value={job.id} />
                    <ConfirmSubmit
                      message={`Delete "${job.title}"? Applications tied to it will be deleted too.`}
                      title="Delete"
                      className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-red-500/50 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </ConfirmSubmit>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
