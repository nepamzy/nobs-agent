"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { completePasswordReset } from "@/app/forgot-password/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("token", token);

    const result = await completePasswordReset(formData);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (success) {
    return (
      <div className="glass flex flex-col items-center gap-3 rounded-2xl p-8 text-center">
        <CheckCircle2 className="text-emerald-400" size={28} />
        <p className="font-[family-name:var(--font-display)] text-lg font-medium">
          Password updated.
        </p>
        <p className="text-sm text-[var(--color-slate)]">Taking you to sign in now.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass space-y-5 rounded-2xl p-8">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          New password
        </label>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Confirm new password
        </label>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Updating" : "Set new password"}
      </button>
    </form>
  );
}
