"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { submitJobApplication } from "@/app/careers/actions";
import { ResumeUpload } from "@/components/resume-upload";

export function ApplyForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [resumeUrl, setResumeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!resumeUrl) {
      setError("Please attach a resume before submitting.");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("jobId", jobId);
    formData.set("resumeUrl", resumeUrl);

    const result = await submitJobApplication(formData);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(result.statusUrl.replace(/^https?:\/\/[^/]+/, ""));
  }

  return (
    <form onSubmit={handleSubmit} className="glass space-y-5 rounded-2xl p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Full name
          </label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Why you, for this role
        </label>
        <textarea
          name="coverLetter"
          required
          rows={7}
          placeholder="What have you built, and why does this particular role interest you?"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>

      <ResumeUpload onUploaded={setResumeUrl} />

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Sending" : "Submit application"}
      </button>
    </form>
  );
}
