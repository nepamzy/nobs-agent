"use client";

import { useState, useRef, type FormEvent } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { SignupPromptModal } from "@/components/signup-prompt-modal";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const pendingDataRef = useRef<Record<string, unknown> | null>(null);

  async function submitContact(data: Record<string, unknown>) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.status === 401) {
      pendingDataRef.current = data;
      setShowSignup(true);
      setStatus("idle");
      return;
    }
    if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
    setStatus("success");
    formRef.current?.reset();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      await submitContact(data);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleSignupSuccess() {
    setShowSignup(false);
    if (!pendingDataRef.current) return;
    setStatus("submitting");
    try {
      await submitContact(pendingDataRef.current);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="glass flex flex-col items-center gap-3 rounded-2xl p-10 text-center">
        <CheckCircle2 className="text-[var(--color-brass)]" size={32} />
        <p className="font-[family-name:var(--font-display)] text-xl font-medium">
          Message sent.
        </p>
        <p className="text-sm text-[var(--color-slate)]">
          I reply to every inquiry within one business day.
        </p>
      </div>
    );
  }

  return (
    <>
    <SignupPromptModal
      open={showSignup}
      onClose={() => setShowSignup(false)}
      onSuccess={handleSignupSuccess}
    />
    <form ref={formRef} onSubmit={handleSubmit} className="glass space-y-5 rounded-2xl p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      <Field label="Company / Organization" name="company" />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Message
        </label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          placeholder="Tell me about the project, timeline, and budget range."
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" && <Loader2 size={16} className="animate-spin" />}
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
      />
    </div>
  );
}
