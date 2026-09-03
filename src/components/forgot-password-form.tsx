"use client";

import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@/app/forgot-password/actions";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(new FormData(e.currentTarget));
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="glass flex flex-col items-center gap-3 rounded-2xl p-8 text-center">
        <CheckCircle2 className="text-[var(--color-brass)]" size={28} />
        <p className="font-[family-name:var(--font-display)] text-lg font-medium">
          Check your email.
        </p>
        <p className="text-sm text-[var(--color-slate)]">
          If an account exists with that address, a reset link is on its way. It expires
          in one hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass space-y-5 rounded-2xl p-8">
      <div>
        <label htmlFor="forgot-password-email" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Email
        </label>
        <input
          id="forgot-password-email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Sending" : "Send reset link"}
      </button>
    </form>
  );
}
