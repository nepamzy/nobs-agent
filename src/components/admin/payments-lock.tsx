"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";
import { lockPaymentsAction, unlockPaymentsAction } from "@/app/admin/payments/actions";

const pinInputClass =
  "w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm uppercase tracking-widest outline-none focus:border-[var(--color-brass)]";

// The locked state of the Payments page: nothing but this card is sent to the
// browser until the PIN is right.
export function PaymentsLockedCard({ pinIsSet }: { pinIsSet: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function unlock(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("pin", pin);
    const result = await unlockPaymentsAction(fd);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPin("");
    router.refresh();
  }

  return (
    <div className="glass mt-6 overflow-hidden rounded-2xl p-6">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-slate)]">
          <Lock size={13} /> Payments are hidden
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Reveal payments"
          className="text-[var(--color-slate)] transition hover:text-[var(--color-brass)]"
        >
          <Eye size={18} />
        </button>
      </div>
      <p className="mt-2 select-none font-[family-name:var(--font-mono)] text-2xl tracking-widest text-[var(--color-slate)]">
        ••••••••
      </p>
      <p className="mt-2 text-sm text-[var(--color-slate)]">
        Tap the eye and enter your PIN, the same one you use for revenue on the Analytics page.
      </p>

      {open &&
        (pinIsSet ? (
          <form onSubmit={unlock} className="mt-4 flex flex-wrap items-center gap-2">
            <Lock size={13} className="shrink-0 text-[var(--color-slate)]" />
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              autoFocus
              autoComplete="off"
              placeholder="PIN"
              aria-label="PIN"
              className={pinInputClass}
            />
            <button
              type="submit"
              disabled={loading || pin.trim().length !== 4}
              className="rounded-full bg-[var(--color-brass)] px-4 py-1.5 text-xs font-semibold text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Checking…" : "Unlock"}
            </button>
            {error && <p className="w-full text-xs text-red-300">{error}</p>}
          </form>
        ) : (
          <p className="mt-4 text-sm text-[var(--color-slate)]">
            No PIN is set yet. An admin can set one with the eye on the{" "}
            <Link href="/admin/analytics" className="text-[var(--color-brass)] underline underline-offset-4">
              Analytics page
            </Link>
            .
          </p>
        ))}
    </div>
  );
}

export function HidePaymentsButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await lockPaymentsAction();
        router.refresh();
      }}
      aria-label="Hide payments"
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 py-2 text-xs transition hover:border-[var(--color-brass)]"
    >
      <EyeOff size={14} /> Hide
    </button>
  );
}
