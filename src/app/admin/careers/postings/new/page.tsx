import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JobForm } from "@/components/admin/job-form";
import { createJob } from "../../actions";

export default function NewJobPage() {
  return (
    <div>
      <Link
        href="/admin/careers"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to careers
      </Link>
      <h1 className="mt-4 mb-6 font-[family-name:var(--font-display)] text-2xl font-medium">
        New posting
      </h1>
      <JobForm action={createJob} />
    </div>
  );
}
