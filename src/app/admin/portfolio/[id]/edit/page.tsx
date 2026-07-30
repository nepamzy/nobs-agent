import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import { ProjectForm } from "@/components/admin/project-form";
import { ProjectFileUpload } from "@/components/admin/project-file-upload";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { updateProject, addProjectFile, deleteProjectFile } from "../../actions";
import { prisma } from "@/lib/prisma";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let project;
  let files: { id: string; fileName: string; url: string }[] = [];
  try {
    project = await prisma.project.findUnique({ where: { id }, include: { client: true } });
    files = await prisma.projectFile.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    project = null;
  }

  if (!project) notFound();

  return (
    <div>
      <Link
        href="/admin/portfolio"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to portfolio
      </Link>
      <h1 className="mt-4 mb-6 font-[family-name:var(--font-display)] text-2xl font-medium">
        Edit project
      </h1>
      <ProjectForm action={updateProject} defaultValues={{ ...project, clientName: project.client?.name }} />

      <div className="glass mt-6 rounded-2xl p-6">
        <h2 className="mb-1 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-medium">
          <FileText size={18} className="text-[var(--color-brass)]" /> Client files
        </h2>
        <p className="mb-4 text-sm text-[var(--color-slate)]">
          Files attached here appear in this client&apos;s portal at{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">/dashboard</code>, contracts,
          briefs, deliverables, anything they should be able to download.
        </p>

        <ProjectFileUpload projectId={project.id} addFileAction={addProjectFile} />

        {files.length > 0 && (
          <ul className="mt-4 space-y-2">
            {files.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm">
                <a
                  href={f.url}
                  target="_blank"
                  className="truncate text-[var(--color-brass)] underline underline-offset-4"
                >
                  {f.fileName}
                </a>
                <form action={deleteProjectFile}>
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="projectId" value={project.id} />
                  <ConfirmSubmit
                    message={`Remove "${f.fileName}"?`}
                    title="Remove"
                    className="ml-3 shrink-0 rounded-lg p-1.5 text-[var(--color-slate)] transition hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </ConfirmSubmit>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
