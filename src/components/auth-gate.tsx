"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, X } from "lucide-react";
import { SignupForm } from "@/components/signup-form";
import { LoginForm } from "@/components/login-form";

// Blocks anonymous visitors from booking or sending an inquiry until they
// create an account. Signed-in visitors see the wrapped form immediately;
// anonymous visitors see a locked preview plus a signup modal, matching
// "should not be able to [book/inquire] until he makes an account."
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signup" | "login">("signup");

  if (status === "loading") {
    return (
      <div className="glass flex items-center justify-center rounded-2xl p-16">
        <Loader2 className="animate-spin text-[var(--color-slate)]" size={20} />
      </div>
    );
  }

  if (session) return <>{children}</>;

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none select-none blur-sm opacity-40">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[var(--color-ink)]/70 p-8 text-center backdrop-blur-sm">
        <p className="font-[family-name:var(--font-display)] text-lg font-medium">
          Create an account to continue
        </p>
        <p className="max-w-xs text-sm text-[var(--color-slate)]">
          A free account lets you track this request, message the studio, and see
          payment status from your dashboard.
        </p>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setOpen(true);
          }}
          className="rounded-full bg-[var(--color-brass)] px-6 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
        >
          Create account
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setOpen(true);
          }}
          className="text-xs text-[var(--color-brass)] underline underline-offset-4"
        >
          Already have an account? Sign in
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative w-full max-w-sm">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute -top-10 right-0 text-[var(--color-slate)] hover:text-[var(--color-paper)]"
            >
              <X size={22} />
            </button>
            {mode === "signup" ? <SignupForm /> : <LoginForm />}
          </div>
        </div>
      )}
    </div>
  );
}
