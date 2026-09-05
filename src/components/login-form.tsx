"use client";

import { useState, type FormEvent } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/password-input";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    // A middleman always lands on their own dashboard, regardless of
    // callbackUrl, since they have no reason to end up on the client portal.
    const session = await getSession();
    const destination =
      session?.user.role === "MIDDLEMAN" ? "/middleman/dashboard" : callbackUrl || "/dashboard";

    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="glass space-y-5 rounded-2xl p-8">
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="login-password" className="text-xs font-medium text-[var(--color-slate)]">Password</label>
          <a href="/forgot-password" className="text-xs text-[var(--color-brass)] hover:underline">
            Forgot password?
          </a>
        </div>
        <PasswordInput id="login-password" name="password" required minLength={8} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-xs text-[var(--color-slate)]">
        New client?{" "}
        <a href="/signup" className="text-[var(--color-brass)] underline underline-offset-4">
          Create an account
        </a>
        .
      </p>
    </form>
  );
}
