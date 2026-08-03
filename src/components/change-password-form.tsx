"use client";

import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { changePassword } from "@/app/dashboard/settings/actions";
import { PasswordInput } from "@/components/password-input";

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await changePassword(formData);

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Current password
        </label>
        <PasswordInput
          name="currentPassword"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          New password
        </label>
        <PasswordInput
          name="newPassword"
          required
          minLength={8}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Confirm new password
        </label>
        <PasswordInput
          name="confirmPassword"
          required
          minLength={8}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && (
        <p className="flex items-center gap-1.5 text-sm text-emerald-400">
          <CheckCircle2 size={14} /> Password updated.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--color-brass)] disabled:opacity-60"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
