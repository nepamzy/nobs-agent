"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Loader2, X } from "lucide-react";
import { createClientAccount } from "@/app/signup/actions";
import { PasswordInput } from "@/components/password-input";

export function SignupPromptModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  // Called once the account exists AND the user is signed in, so the
  // caller can immediately resubmit whatever they were trying to do
  // (booking/inquiry) without losing their place.
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await createClientAccount(formData);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      setError("Account created, but sign-in failed. Please refresh and try signing in.");
      return;
    }

    onSuccess();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="glass relative w-full max-w-md rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-[var(--color-slate)] transition hover:text-[var(--color-brass)]"
        >
          <X size={18} />
        </button>

        <h2 className="mb-1 font-[family-name:var(--font-display)] text-lg font-medium">
          Create an account to continue
        </h2>
        <p className="mb-5 text-sm text-[var(--color-slate)]">
          Bookings and inquiries need an account, this is how you&apos;ll track status and
          messages afterward. Takes under a minute.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            placeholder="Full name"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
          <input
            name="organization"
            placeholder="Organization (optional)"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
          <PasswordInput name="password" placeholder="Password (min 8 characters)" required minLength={8} />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Creating account…" : "Create account & continue"}
          </button>

          <p className="text-center text-xs text-[var(--color-slate)]">
            Already have an account?{" "}
            <a href="/login" className="text-[var(--color-brass)] underline underline-offset-4">
              Sign in
            </a>{" "}
            first, then come back to this page.
          </p>
        </form>
      </div>
    </div>
  );
}
