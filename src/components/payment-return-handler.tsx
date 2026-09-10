"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

// Rendered on /pay/[id] when Paystack's redirect checkout sends the
// client back with ?verify=<reference> — replaces the old Inline JS
// popup's in-page callback, since a full-page redirect means there's no
// JS callback to run anymore, just a fresh page load carrying the
// reference in the URL. Calls the exact same verify endpoint the old
// popup flow used, so nothing about verification itself changed.
export function PaymentReturnHandler({ bookingId, reference }: { bookingId: string; reference: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/paystack/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, bookingId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok) {
          setStatus("success");
          // Strip ?verify=... and re-run the server component so the
          // paid-so-far / remaining-balance figures reflect this payment.
          router.replace(`/pay/${bookingId}`);
          router.refresh();
        } else {
          setStatus("error");
          setError(data.error ?? "Payment could not be verified.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setError("Payment could not be verified. Contact the studio.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId, reference, router]);

  if (status === "verifying") {
    return (
      <div className="glass mb-6 flex items-center gap-2 rounded-lg p-4 text-sm text-[var(--color-slate)]">
        <Loader2 size={16} className="animate-spin" /> Confirming your payment…
      </div>
    );
  }

  if (status === "success") {
    return (
      <p className="glass mb-6 inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
        <CheckCircle2 size={16} /> Payment received, thank you. A receipt is on its way to your email.
      </p>
    );
  }

  return (
    <p className="glass mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {error}
    </p>
  );
}
