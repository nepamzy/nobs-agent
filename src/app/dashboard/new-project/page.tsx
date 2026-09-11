import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cancelProjectBrief } from "./actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { BookingFileUpload } from "@/components/booking-file-upload";
import { toDownloadUrl } from "@/lib/cloudinary-download";
import { NewProjectForm } from "@/components/new-project-form";
import { CheckCircle2, ArrowUpRight, X } from "lucide-react";

const NEW_STATUSES = ["SUBMITTED", "IN_REVIEW"];
const ONGOING_STATUSES = ["IN_PROGRESS", "REVISION"];
const OLD_STATUSES = ["DELIVERED"];

const statusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  IN_REVIEW: "In review",
  IN_PROGRESS: "In progress",
  REVISION: "Revision",
  DELIVERED: "Delivered",
};

async function getProjects(userId: string) {
  try {
    return await prisma.project.findMany({
      where: { clientUserId: userId },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    return [];
  }
}

async function getPendingBriefs(userId: string) {
  try {
    return await prisma.booking.findMany({
      where: { userId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { files: { orderBy: { createdAt: "desc" } } },
    });
  } catch {
    return [];
  }
}

function ProjectGroup({
  title,
  projects,
  emptyText,
}: {
  title: string;
  projects: { id: string; title: string; status: string }[];
  emptyText: string;
}) {
  return (
    <div>
      <h2 className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        {title}
      </h2>
      {projects.length === 0 ? (
        <p className="text-sm text-[var(--color-slate)]">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/projects/${p.id}`}
              className="glass group flex items-center justify-between rounded-xl p-4 text-sm transition hover:border-[var(--color-brass)]/50"
            >
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-[var(--color-slate)]">{statusLabels[p.status] ?? p.status}</p>
              </div>
              <ArrowUpRight
                size={16}
                className="text-[var(--color-slate)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-brass)]"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { submitted } = await searchParams;
  const session = await auth();
  const projects = await getProjects(session!.user.id);
  const pendingBriefs = await getPendingBriefs(session!.user.id);

  const newProjects = projects.filter((p) => NEW_STATUSES.includes(p.status));
  const ongoingProjects = projects.filter((p) => ONGOING_STATUSES.includes(p.status));
  const oldProjects = projects.filter((p) => OLD_STATUSES.includes(p.status));

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Projects
      </h1>

      {submitted && (
        <div className="glass mt-4 flex items-center gap-2 rounded-xl border-emerald-500/40 p-4 text-sm text-emerald-400">
          <CheckCircle2 size={16} /> Brief received, the studio will follow up shortly.
        </div>
      )}

      {pendingBriefs.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
            Awaiting review
          </h2>
          <div className="space-y-2">
            {pendingBriefs.map((b) => (
              <div key={b.id} className="glass rounded-xl p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{b.serviceInterest}</p>
                    <p className="text-xs text-[var(--color-slate)]">
                      Submitted {new Date(b.createdAt).toLocaleDateString()}, not yet reviewed
                    </p>
                  </div>
                  <form action={cancelProjectBrief}>
                    <input type="hidden" name="bookingId" value={b.id} />
                    <ConfirmSubmit
                      message="Cancel this brief? You can always submit a new one."
                      title="Cancel"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 py-1.5 text-xs transition hover:border-red-500/50 hover:text-red-400"
                    >
                      <X size={12} /> Cancel
                    </ConfirmSubmit>
                  </form>
                </div>
                {b.files.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-[var(--color-line)] pt-3">
                    {b.files.map((f: { id: string; url: string; fileName: string }) => (
                      <li key={f.id}>
                        <a
                          href={toDownloadUrl(f.url, f.fileName)}
                          className="text-xs text-[var(--color-brass)] underline underline-offset-4"
                        >
                          {f.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                <BookingFileUpload bookingId={b.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ProjectGroup title="New" projects={newProjects} emptyText="Nothing submitted yet." />
        <ProjectGroup title="Ongoing" projects={ongoingProjects} emptyText="Nothing in progress right now." />
        <ProjectGroup title="Old" projects={oldProjects} emptyText="No completed projects yet." />
      </div>

      <div className="glass mt-10 rounded-2xl p-8">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-medium">
          Submit a new project
        </h2>
        <p className="mt-2 max-w-lg text-sm text-[var(--color-slate)]">
          Same brief the studio reviews for anyone, minus the details it already has on
          file for you.
        </p>

        <NewProjectForm />
      </div>
    </div>
  );
}
