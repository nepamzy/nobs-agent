"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { getBankList, resolveBankAccount, savePayoutDetails } from "@/app/partner/(dashboard)/actions";

type Bank = { name: string; code: string; slug: string };

export function PayoutDetailsForm() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getBankList()
      .then(setBanks)
      .catch(() => setError("Could not load the bank list. Refresh to try again."))
      .finally(() => setBanksLoading(false));
  }, []);

  async function handleVerify() {
    setError(null);
    setResolvedName(null);
    setResolving(true);

    const formData = new FormData();
    formData.set("accountNumber", accountNumber);
    formData.set("bankCode", bankCode);

    const result = await resolveBankAccount(formData);
    setResolving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setResolvedName(result.accountName);
  }

  async function handleConfirm() {
    if (!resolvedName) return;
    setError(null);
    setSaving(true);

    const formData = new FormData();
    formData.set("accountNumber", accountNumber);
    formData.set("bankCode", bankCode);
    formData.set("accountName", resolvedName);

    const result = await savePayoutDetails(formData);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400">
        <CheckCircle2 size={16} /> Payout details saved — your commission now pays out automatically.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--color-slate)]">
        Use a regular bank account (e.g. GTBank, Access, Zenith, UBA) rather than a mobile-money
        wallet like OPay, PalmPay, or Moniepoint — a standard bank account settles automatic
        commission payouts most reliably.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="payout-bank" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Bank
          </label>
          <select
            id="payout-bank"
            value={bankCode}
            onChange={(e) => {
              setBankCode(e.target.value);
              setResolvedName(null);
            }}
            disabled={banksLoading}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          >
            <option value="" className="bg-[var(--color-ink)]">
              {banksLoading ? "Loading banks…" : "Select your bank"}
            </option>
            {banks.map((bank) => (
              <option key={bank.code} value={bank.code} className="bg-[var(--color-ink)]">
                {bank.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="payout-account" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Account number
          </label>
          <input
            id="payout-account"
            value={accountNumber}
            onChange={(e) => {
              setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
              setResolvedName(null);
            }}
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit account number"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
        </div>
      </div>

      {resolvedName ? (
        <div className="glass rounded-lg p-4">
          <p className="text-xs text-[var(--color-slate)]">This account belongs to</p>
          <p className="mt-1 font-medium">{resolvedName}</p>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? "Saving…" : "Confirm & save"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleVerify}
          disabled={resolving || !bankCode || accountNumber.length !== 10}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--color-brass)] disabled:opacity-50"
        >
          {resolving && <Loader2 size={15} className="animate-spin" />}
          {resolving ? "Verifying…" : "Verify account"}
        </button>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
