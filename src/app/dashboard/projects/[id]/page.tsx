import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { postProjectComment } from "./actions";
import { ClientFileUpload } from "@/components/client-file-upload";
import { toDownloadUrl } from "@/lib/cloudinary-download";
import { FileText, CheckCircle2, Circle } from "lucide-react";

const STATUS_ORDER = ["SUBMITTED", "IN_REVIEW", "IN_PROGRESS", "REVISION", "DELIVERED"] as const;
const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  IN_REVIEW: "In review",
  IN_PROGRESS: "In progress",
  REVISION: "Revision",
  DELIVERED: "Delivered",
};

async function getProject(id: string, userId: string, role: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      progress: { orderBy: { createdAt: "desc" }, take: 1 },
      files: { orderBy: { createdAt: "desc" } },
      milestones: { orderBy: { order: "asc" } },
      messages: { orderBy: { createdAt: "asc" }, include: { sender: true } },
    },
  });

  if (!project) return null;
  if (role === "CLIENT" && project.clientUserId !== userId) return null;
  return project;
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  let project;
  try {
    project = await getProject(id, session.user.id, session.user.role);
  } catch {
    project = null;
  }

  if (!project) notFound();

  const currentStepIndex = STATUS_ORDER.indexOf(project.status as (typeof STATUS_ORDER)[number]);
  const latestProgress = project.progress[0]?.percentage ?? 0;

  let payments: Awaited<ReturnType<typeof prisma.booking.findMany>> = [];
  try {
    payments = await prisma.booking.findMany({
      where: {
        agreedAmount: { not: null },
        OR: [
          { userId: session.user.id },
          project.clientId ? { clientId: project.clientId } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    payments = [];
  }

  function formatNaira(kobo: number) {
    return `₦${(kobo / 100).toLocaleString("en-NG")}`;
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        {project.title}
      </h1>
      {project.clientBrief && (
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-slate)]">{project.clientBrief}</p>
      )}

      {/* Status timeline */}
      <div className="glass mt-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          {STATUS_ORDER.map((step, i) => (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                {i <= currentStepIndex ? (
                  <CheckCircle2 size={18} className="text-[var(--color-brass)]" />
                ) : (
                  <Circle size={18} className="text-[var(--color-slate)]/50" />
                )}
                <span
                  className={`text-center text-[10px] uppercase tracking-wider ${
                    i <= currentStepIndex ? "text-[var(--color-brass)]" : "text-[var(--color-slate)]/60"
                  }`}
                >
                  {STATUS_LABELS[step]}
                </span>
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div
                  className={`mx-1 h-px flex-1 ${
                    i < currentStepIndex ? "bg-[var(--color-brass)]" : "bg-[var(--color-line)]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[var(--color-brass)] transition-all"
            style={{ width: `${latestProgress}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-[var(--color-slate)]">{latestProgress}% complete</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Milestones */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
            Milestones
          </h2>
          {project.milestones.length === 0 ? (
            <p className="text-sm text-[var(--color-slate)]">
              No milestones set yet, the studio breaks larger projects into phases here.
            </p>
          ) : (
            <ul className="space-y-2">
              {project.milestones.map((m: { id: string; title: string; completed: boolean }) => (
                <li key={m.id} className="flex items-center gap-2.5 text-sm">
                  {m.completed ? (
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  ) : (
                    <Circle size={16} className="shrink-0 text-[var(--color-slate)]/50" />
                  )}
                  <span className={m.completed ? "text-[var(--color-slate)] line-through" : ""}>
                    {m.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Files */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-1.5 font-[family-name:var(--font-display)] text-lg font-medium">
            <FileText size={16} /> Files
          </h2>
          {project.files.length === 0 ? (
            <p className="text-sm text-[var(--color-slate)]">No files shared yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {project.files.map((f: { id: string; url: string; fileName: string; uploadedByRole: string }) => (
                <li key={f.id} className="flex items-center gap-2">
                  <a
                    href={toDownloadUrl(f.url, f.fileName)}
                    className="text-sm text-[var(--color-brass)] underline underline-offset-4"
                  >
                    {f.fileName}
                  </a>
                  <span className="text-[10px] text-[var(--color-slate)]">
                    {f.uploadedByRole === "CLIENT" ? "you" : "studio"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <ClientFileUpload projectId={project.id} />
        </div>
      </div>

      {payments.length > 0 && (
        <div className="glass mt-6 rounded-2xl p-6">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
            Payment
          </h2>
          <div className="space-y-4">
            {payments.map((b) => {
              const total = b.agreedAmount ?? 0;
              const percent = total > 0 ? Math.round((b.amountPaid / total) * 100) : 0;
              const fullyPaid = total > 0 && b.amountPaid >= total;
              return (
                <div key={b.id} className="rounded-lg bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{b.serviceInterest}</p>
                    <span
                      className={`text-xs ${fullyPaid ? "text-emerald-400" : "text-[var(--color-brass)]"}`}
                    >
                      {fullyPaid ? "Paid in full" : `${percent}% paid`}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-slate)]">
                    {formatNaira(b.amountPaid)} of {formatNaira(total)}
                  </p>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[var(--color-brass)] transition-all"
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    {!fullyPaid && (
                      <Link
                        href={`/pay/${b.id}`}
                        className="text-xs font-medium text-[var(--color-brass)] underline underline-offset-4"
                      >
                        Continue payment
                      </Link>
                    )}
                    {b.amountPaid > 0 && (
                      <a
                        href={`/api/invoice/${b.id}`}
                        className="text-xs text-[var(--color-slate)] underline underline-offset-4"
                      >
                        Download invoice
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comments thread */}
      <div className="glass mt-6 rounded-2xl p-6">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
          Comments & revisions
        </h2>
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {project.messages.length === 0 && (
            <p className="text-sm text-[var(--color-slate)]">
              No messages yet, this is where revision requests and updates land.
            </p>
          )}
          {project.messages.map(
            (m: { id: string; body: string; createdAt: Date; sender: { name: string; role: string } }) => (
              <div key={m.id} className="rounded-lg border border-[var(--color-line)] p-3">
                <p className="text-xs text-[var(--color-slate)]">
                  <span className="font-medium text-[var(--color-paper)]">{m.sender.name}</span>{" "}
                  {m.sender.role !== "CLIENT" && (
                    <span className="text-[var(--color-brass)]">(studio)</span>
                  )}{" "}
                  · {new Date(m.createdAt).toLocaleString()}
                </p>
                <p className="mt-1 text-sm">{m.body}</p>
              </div>
            )
          )}
        </div>

        <form action={postProjectComment} className="mt-4 flex gap-2">
          <input type="hidden" name="projectId" value={project.id} />
          <input
            name="body"
            required
            placeholder="Ask a question or request a revision…"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-brass)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
