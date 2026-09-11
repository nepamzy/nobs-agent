"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { resendPartnerAgreement } from "@/app/admin/partners/actions";

type Status = "idle" | "sending" | "sent" | "skipped" | "error";

// The plain `<form action={...}>` this replaced gave zero feedback either
// way — clicking it looked identical whether the email actually sent,
// silently no-op'd (BREVO_API_KEY unset on this deployment — a real,
// distinct outcome, not a bug, but indistinguishable from success without
// this), or failed outright. Calling the action directly instead of
// through form submission is what makes a result available to show at all.
export function ResendAgreementButton({ partnerId }: { partnerId: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setStatus("sending");
    setError(null);

    const formData = new FormData();
    formData.set("id", partnerId);
    const result = await resendPartnerAgreement(formData);

    if (!result.ok) {
      setStatus("error");
      setError(result.error);
      return;
    }

    setStatus(result.skipped ? "skipped" : "sent");
    setTimeout(() => setStatus("idle"), 6000);
  }

  const label =
    status === "sending"
      ? "Sending…"
      : status === "sent"
        ? "Sent!"
        : status === "skipped"
          ? "Email not configured"
          : "Resend Referral Partner Agreement";

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-3.5 py-1.5 text-xs font-medium transition hover:border-[var(--color-brass)] disabled:opacity-60"
      >
        {status === "sending" ? (
          <Loader2 size={13} className="animate-spin" />
        ) : status === "sent" ? (
          <CheckCircle2 size={13} className="text-emerald-400" />
        ) : status === "skipped" ? (
          <AlertTriangle size={13} className="text-amber-400" />
        ) : (
          <Mail size={13} />
        )}
        {label}
      </button>
      {status === "skipped" && (
        <p className="mt-1.5 text-xs text-amber-400">
          The PDF generated fine, but no email was sent — BREVO_API_KEY isn&apos;t set on this
          deployment.
        </p>
      )}
      {status === "error" && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
