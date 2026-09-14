"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { acknowledgeInactivityPolicy } from "@/app/partner/policy/actions";

export function PartnerPolicyForm() {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await acknowledgeInactivityPolicy(formData);
    setLoading(false);

    // A successful call redirects server-side and never returns here — only
    // the checkbox-not-ticked rejection comes back as a value to show.
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass space-y-5 rounded-2xl p-8">
      <label className="flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          name="agreed"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brass)]"
        />
        <span>I understand and agree to this policy.</span>
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading || !checked}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Continuing…" : "Continue to my dashboard"}
      </button>
    </form>
  );
}
