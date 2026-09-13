import type { Metadata } from "next";
import { getWorkerPoolJobId } from "@/lib/worker-pool-job";
import { ApplyForm } from "@/components/apply-form";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Work with us",
  description: "No open roles right now — leave your details for when something opens up.",
  alternates: {
    canonical: "/careers/worker",
  },
};

export default async function WorkerApplicationPage() {
  const jobId = await getWorkerPoolJobId();

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Careers", href: "/careers" },
          { label: "Work with us" },
        ]}
      />
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Remote &middot; Tech
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl">
        No open roles right now
      </h1>

      <div className="mt-6 space-y-3 text-sm leading-relaxed text-[var(--color-slate)]">
        <p>
          There&apos;s nothing open on the team at the moment — but leave your details
          anyway. When a real role does open up, we go through this list first instead of
          starting from zero.
        </p>
        <p>
          Developers, designers, or anyone building real technical work — send your CV,
          a portfolio link, and a short note on what you do.
        </p>
      </div>

      <h2 className="mt-10 mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
        Submit your info
      </h2>
      <ApplyForm jobId={jobId} />
    </div>
  );
}
