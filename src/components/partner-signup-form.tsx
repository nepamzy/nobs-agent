"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createReferralPartnerAccount } from "@/app/partner/signup/actions";
import { PasswordInput } from "@/components/password-input";

export function PartnerSignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await createReferralPartnerAccount(formData);
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
      router.push("/login");
      return;
    }

    router.push("/partner");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="glass space-y-5 rounded-2xl p-8">
      <div>
        <label htmlFor="partner-signup-name" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Full name
        </label>
        <input
          id="partner-signup-name"
          name="name"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>
      <div>
        <label htmlFor="partner-signup-email" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Email
        </label>
        <input
          id="partner-signup-email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>
      <div>
        <label htmlFor="partner-signup-phone" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Phone number (WhatsApp preferred)
        </label>
        <input
          id="partner-signup-phone"
          name="phone"
          type="tel"
          required
          placeholder="+234..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>
      <div>
        <label htmlFor="partner-signup-password" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Password
        </label>
        <PasswordInput id="partner-signup-password" name="password" required minLength={8} />
        <p className="mt-1.5 text-xs text-[var(--color-slate)]">At least 8 characters.</p>
      </div>

      <label className="flex items-start gap-2.5 text-xs text-[var(--color-slate)]">
        <input
          type="checkbox"
          name="agreedToTerms"
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brass)]"
        />
        <span>
          I have read and agree to the{" "}
          <a
            href="/partner/agreement"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-brass)] underline underline-offset-4"
          >
            Referral Partner Agreement
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-brass)] underline underline-offset-4"
          >
            Privacy Policy
          </a>
          . My account creation date below becomes the Effective Date of the Agreement.
        </span>
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Creating account…" : "Create partner account"}
      </button>

      <p className="text-center text-xs text-[var(--color-slate)]">
        Already a partner?{" "}
        <a href="/login" className="text-[var(--color-brass)] underline underline-offset-4">
          Sign in
        </a>
      </p>
    </form>
  );
}
