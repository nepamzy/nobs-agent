"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClientAccount } from "@/app/signup/actions";
import { PasswordInput } from "@/components/password-input";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await createClientAccount(formData);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Sign in immediately with the same credentials rather than send them
    // back to a login screen right after they just typed a password in.
    const signInResult = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      // Account was created but auto-login failed for some reason,
      // send them to login rather than strand them on a broken state.
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="glass space-y-5 rounded-2xl p-8">
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
          Organization (optional)
        </label>
        <input
          name="organization"
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
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Phone number (WhatsApp preferred)
        </label>
        <input
          name="phone"
          type="tel"
          required
          placeholder="+234..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Password
        </label>
        <PasswordInput name="password" required minLength={8} />
        <p className="mt-1.5 text-xs text-[var(--color-slate)]">At least 8 characters.</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-xs text-[var(--color-slate)]">
        Already have an account?{" "}
        <a href="/login" className="text-[var(--color-brass)] underline underline-offset-4">
          Sign in
        </a>
      </p>
    </form>
  );
}
