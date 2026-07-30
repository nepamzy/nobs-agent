import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/admin/project-form";
import { createProject } from "../actions";

export default function NewProjectPage() {
  return (
    <div>
      <Link
        href="/admin/portfolio"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to portfolio
      </Link>
      <h1 className="mt-4 mb-6 font-[family-name:var(--font-display)] text-2xl font-medium">
        New project
      </h1>
      <ProjectForm action={createProject} />
    </div>
  );
}
