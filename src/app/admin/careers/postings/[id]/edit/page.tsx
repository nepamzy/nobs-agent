import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { JobForm } from "@/components/admin/job-form";
import { updateJob } from "../../../actions";
import { prisma } from "@/lib/prisma";

export default async function EditJobPage({
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
        Edit posting
      </h1>
      <JobForm action={updateJob} defaultValues={job} />
    </div>
  );
}
