import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FolderPlus, MessageSquare, CreditCard, ArrowUpRight } from "lucide-react";
import { TestimonialPopup } from "@/components/testimonial-popup";

const statusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  IN_REVIEW: "In review",
  IN_PROGRESS: "In progress",
  REVISION: "Revision",
  DELIVERED: "Delivered",
};

function fetchClientProjects(userId: string) {
  return prisma.project.findMany({
    where: { clientUserId: userId },
    include: {
      progress: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
}

type ClientProject = Awaited<ReturnType<typeof fetchClientProjects>>[number];

async function getClientProjects(userId: string) {
  try {
    const projects = await fetchClientProjects(userId);
    return { projects, connected: true };
  } catch {
    return { projects: [] as ClientProject[], connected: false };
  }
}

async function getPendingTestimonialProject(userId: string) {
  try {
    return await prisma.project.findFirst({
      where: {
        clientUserId: userId,
        status: "DELIVERED",
        testimonial: null, // the auto-popup only fires once per project, ever
      },
      select: { id: true, title: true },
    });
  } catch {
    return null;
  }
}

export default async function DashboardOverviewPage() {
  const session = await auth();
  const { projects, connected } = await getClientProjects(session!.user.id);
  const pendingTestimonial = await getPendingTestimonialProject(session!.user.id);

  return (
    <div>
      {pendingTestimonial && (
        <TestimonialPopup projectId={pendingTestimonial.id} projectTitle={pendingTestimonial.title} />
      )}
      <div className="glass rounded-2xl p-6">
        <p className="font-[family-name:var(--font-display)] text-lg font-medium">
          Hi {session!.user.name?.split(" ")[0] ?? "there"}, here&apos;s what&apos;s happening.
        </p>
        <p className="mt-1 text-sm text-[var(--color-slate)]">
          {projects.length === 0
            ? "No active projects linked to your account yet."
            : `${projects.length} project${projects.length === 1 ? "" : "s"} on file.`}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link
          href="/dashboard/new-project"
          className="glass flex items-center gap-2.5 rounded-xl p-4 text-sm font-medium transition hover:border-[var(--color-brass)]/50"
        >
          <FolderPlus size={18} className="text-[var(--color-brass)]" /> New project
        </Link>
        <Link
          href="/dashboard/messages"
          className="glass flex items-center gap-2.5 rounded-xl p-4 text-sm font-medium transition hover:border-[var(--color-brass)]/50"
        >
          <MessageSquare size={18} className="text-[var(--color-brass)]" /> Message us
        </Link>
        <Link
          href="/dashboard/payments"
          className="glass flex items-center gap-2.5 rounded-xl p-4 text-sm font-medium transition hover:border-[var(--color-brass)]/50"
        >
          <CreditCard size={18} className="text-[var(--color-brass)]" /> Make a payment
        </Link>
      </div>

      {!connected && (
        <div className="glass mt-6 rounded-2xl p-8 text-sm text-[var(--color-slate)]">
          Not connected to a database yet, once your project is set up, its progress
          will appear here.
        </div>
      )}

      {connected && projects.length === 0 && (
        <div className="glass mt-6 rounded-2xl p-8 text-sm text-[var(--color-slate)]">
          No projects are linked to your account yet.{" "}
          <Link href="/dashboard/new-project" className="text-[var(--color-brass)] underline underline-offset-4">
            Submit a brief
          </Link>{" "}
          to get one started.
        </div>
      )}

      <div className="mt-6 space-y-3">
        {projects.map((project) => {
          const latestProgress = project.progress[0]?.percentage ?? 0;
          return (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="glass group flex items-center justify-between gap-4 rounded-2xl p-6 transition hover:border-[var(--color-brass)]/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-medium">
                    {project.title}
                  </h2>
                  <span className="rounded-full border border-[var(--color-line)] px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-[var(--color-slate)]">
                    {statusLabels[project.status] ?? project.status}
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[var(--color-brass)] transition-all"
                    style={{ width: `${latestProgress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-[var(--color-slate)]">{latestProgress}% complete</p>
              </div>
              <ArrowUpRight
                size={18}
                className="shrink-0 text-[var(--color-slate)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-brass)]"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
