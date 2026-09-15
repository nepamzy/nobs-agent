"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { revealRevenueAction, setRevenuePinAction } from "@/app/admin/analytics/pin-actions";

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

const pinInputClass =
  "w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm uppercase tracking-widest outline-none focus:border-[var(--color-brass)]";

// The revenue figure never reaches this component as a prop while locked —
// only whether a PIN has been set, and (for admins) whether this viewer can
// manage it. The actual amount is fetched from revealRevenueAction only
// after a correct PIN, so a locked view has nothing to reveal by
// inspecting the page, unlike a plain CSS blur would.
export function RevenuePinGate({ pinIsSet, canManagePin }: { pinIsSet: boolean; canManagePin: boolean }) {
  const [hasPinSet, setHasPinSet] = useState(pinIsSet);
  const [amount, setAmount] = useState<number | null>(null);
  const [mode, setMode] = useState<"closed" | "unlock" | "set-pin">("closed");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function resetInputs() {
    setPin("");
    setConfirmPin("");
    setError(null);
  }

  function toggle() {
    if (amount !== null) {
      setAmount(null);
      setMode("closed");
      return;
    }
    resetInputs();
    setMode(hasPinSet ? "unlock" : "set-pin");
  }

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("pin", pin);
    const result = await revealRevenueAction(fd);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAmount(result.amount);
    setMode("closed");
  }

  async function handleSetPin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("pin", pin);
    fd.set("confirmPin", confirmPin);
    const result = await setRevenuePinAction(fd);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setHasPinSet(true);
    resetInputs();
    setMode("unlock");
  }

  return (
    <div className="glass overflow-hidden rounded-2xl p-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">Total revenue</p>
        <button
          type="button"
          onClick={toggle}
          aria-label={amount !== null ? "Hide revenue" : "Reveal revenue"}
          className="text-[var(--color-slate)] transition hover:text-[var(--color-brass)]"
        >
          {amount !== null ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {amount !== null ? (
        <>
          <p className="mt-2 break-words font-[family-name:var(--font-mono)] text-2xl text-[var(--color-brass)] sm:text-3xl">
            {formatNaira(amount)}
          </p>
          {canManagePin && (
            <button
              type="button"
              onClick={() => {
                setAmount(null);
                resetInputs();
                setMode("set-pin");
              }}
              className="mt-2 text-xs text-[var(--color-slate)] underline underline-offset-4 hover:text-[var(--color-brass)]"
            >
              Change PIN
            </button>
          )}
        </>
      ) : (
        <p className="mt-2 select-none font-[family-name:var(--font-mono)] text-2xl tracking-widest text-[var(--color-slate)] sm:text-3xl">
          ••••••••
        </p>
      )}

      {mode === "unlock" && (
        <form onSubmit={handleUnlock} className="mt-4 flex flex-wrap items-center gap-2">
          <Lock size={13} className="shrink-0 text-[var(--color-slate)]" />
          <input
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={4}
            placeholder="PIN"
            className={pinInputClass}
          />
          <button
            type="submit"
            disabled={loading || pin.length !== 4}
            className="rounded-lg bg-[var(--color-brass)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] disabled:opacity-60"
          >
            {loading ? "Checking…" : "Unlock"}
          </button>
        </form>
      )}

      {mode === "set-pin" && canManagePin && (
        <form onSubmit={handleSetPin} className="mt-4 space-y-2">
          <p className="text-xs text-[var(--color-slate)]">
            {hasPinSet ? "Set a new PIN" : "No PIN set yet"} — 4 characters: 2 letters and 2 digits, in
            whatever order you like.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              placeholder="New PIN"
              className={pinInputClass}
            />
            <input
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              maxLength={4}
              placeholder="Confirm"
              className={pinInputClass}
            />
            <button
              type="submit"
              disabled={loading || pin.length !== 4 || confirmPin.length !== 4}
              className="rounded-lg bg-[var(--color-brass)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] disabled:opacity-60"
            >
              {loading ? "Saving…" : "Set PIN"}
            </button>
          </div>
        </form>
      )}

      {mode === "set-pin" && !canManagePin && (
        <p className="mt-3 text-xs text-[var(--color-slate)]">
          No PIN has been set yet — ask an admin to set one.
        </p>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
