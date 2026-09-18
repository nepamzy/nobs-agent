"use client";

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Loader2, CheckCircle2, Paperclip, X } from "lucide-react";
import { SignupPromptModal } from "@/components/signup-prompt-modal";
import { uploadBookingFile } from "@/app/dashboard/new-project/actions";
import { TermsPanel } from "@/components/terms-panel";
import { services, budgetOptionsForService } from "@/lib/booking-budget-options";
import { BOOKING_CURRENCIES, type BookingCurrencyCode } from "@/lib/booking-currencies";
import { internationalFloorPrices } from "@/lib/data/pricing-international";
import { useCurrency } from "@/lib/currency-context";
import { convertAmount } from "@/lib/exchange-rates";

type Status = "idle" | "submitting" | "success" | "error";

// Rounds a computed tier boundary to a "clean" number worth showing a
// client — bucket size scales with magnitude, same idea as
// src/lib/booking-budget-options.ts's Naira rounding, but currency-agnostic
// since this runs on whatever currency the visitor picked, already
// converted from the USD floor.
function roundToNiceBudgetNumber(amount: number): number {
  const bucket = amount >= 50_000 ? 5_000 : amount >= 10_000 ? 1_000 : amount >= 2_000 ? 500 : 100;
  return Math.round(amount / bucket) * bucket;
}

// The budget field's real options for a given package + currency. NGN
// keeps the existing 3-tier range picker, anchored to the real /pricing
// minimum. Outside Nigeria a package's real floor price
// (src/lib/data/pricing-international.ts) is never a live-FX conversion
// of the Naira figure, but it also isn't shown as a single locked-in
// number — three escalating bands above the floor (4/3x, 10/3x, 5x, e.g.
// a $3,000 floor becomes $3,000–$4,000 / $4,000–$10,000 /
// $10,000–$15,000) let someone signal a bigger budget, plus a leading
// "Not sure yet" for someone who doesn't know yet. A service with no
// researched international floor (e.g. recurring items like SEO) falls
// back to a plain "to be quoted" option instead of guessing a number.
// `rates` still loading (null) returns no options at all, so the field
// can't be submitted until real prices are known —
// src/lib/exchange-rates.ts's convertAmount needs it to mean anything.
function computeBudgetOptions(
  service: string,
  currency: BookingCurrencyCode,
  rates: Record<string, number> | null
): string[] {
  if (!service) return [];
  if (currency === "NGN") return budgetOptionsForService(service);

  const floorUsd = internationalFloorPrices[service];
  if (floorUsd === undefined) return ["To be quoted after your call"];
  if (!rates) return [];

  const meta = BOOKING_CURRENCIES.find((c) => c.code === currency);
  const fmt = (n: number) => `${meta?.symbol ?? currency} ${n.toLocaleString()}`;

  const floor = Math.round(convertAmount(floorUsd, "USD", currency, rates));
  const tier1 = roundToNiceBudgetNumber(floor * (4 / 3));
  const tier2 = roundToNiceBudgetNumber(floor * (10 / 3));
  const tier3 = roundToNiceBudgetNumber(floor * 5);

  return [
    "Not sure yet",
    `${fmt(floor)} – ${fmt(tier1)}`,
    `${fmt(tier1)} – ${fmt(tier2)}`,
    `${fmt(tier2)} – ${fmt(tier3)}`,
  ];
}

export function BookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [serviceInterest, setServiceInterest] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [payCurrency, setPayCurrency] = useState<BookingCurrencyCode>("USD");
  const [currencyTouched, setCurrencyTouched] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const pendingDataRef = useRef<Record<string, unknown> | null>(null);
  const { isNigerian, rates } = useCurrency();

  // Defaults to NGN for a Nigerian visitor (once geo-IP resolves), USD for
  // everyone else — same default logic as CurrencyContext, but this is the
  // currency the client will actually PAY in at /pay/[id], not just a
  // display preference, so it's only set until they've touched the picker
  // themselves.
  useEffect(() => {
    if (!currencyTouched && isNigerian) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPayCurrency("NGN");
      // A budget already picked under the previous (non-NGN) currency
      // won't be one of NGN's own option strings, so it has to be
      // reset here too, not just the currency itself.
      if (serviceInterest) {
        const options = computeBudgetOptions(serviceInterest, "NGN", rates);
        setBudgetRange(options.length === 1 ? options[0] : "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNigerian, currencyTouched]);

  // Picking a new package or a new currency always recomputes the budget
  // options fresh and clears/reselects the amount, since the previous
  // selection may no longer be valid (or may now be a single forced
  // option) — see computeBudgetOptions above.
  const budgetOptions = computeBudgetOptions(serviceInterest, payCurrency, rates);

  // Rates load asynchronously after mount — if someone already had a
  // non-NGN currency + package selected before that finished, the single
  // real-price option above only becomes computable once `rates` arrives,
  // so it's backfilled here rather than leaving the field stuck empty.
  useEffect(() => {
    if (!rates || payCurrency === "NGN" || !serviceInterest) return;
    const options = computeBudgetOptions(serviceInterest, payCurrency, rates);
    if (options.length === 1 && budgetRange !== options[0]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBudgetRange(options[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates, payCurrency, serviceInterest]);

  function handleServiceChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setServiceInterest(next);
    const options = computeBudgetOptions(next, payCurrency, rates);
    // A single-option result (a recurring NGN rate, or any non-NGN
    // currency) auto-selects — no reason to make someone click a dropdown
    // with only one real choice in it.
    setBudgetRange(options.length === 1 ? options[0] : "");
  }

  function handleCurrencyChange(e: ChangeEvent<HTMLSelectElement>) {
    setCurrencyTouched(true);
    const next = e.target.value as BookingCurrencyCode;
    setPayCurrency(next);
    const options = computeBudgetOptions(serviceInterest, next, rates);
    setBudgetRange(options.length === 1 ? options[0] : "");
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0] ?? null);
  }

  // Runs after a booking is genuinely created, this is the piece that
  // makes attaching a file to a brand-new booking possible at all, the
  // booking doesn't exist yet at the moment someone picks a file, so the
  // actual upload has to happen right after the ID comes back, not
  // alongside the form fields themselves.
  async function attachFileToBooking(bookingId: string, file: File) {
    setUploadingFile(true);
    try {
      const sigRes = await fetch("/api/cloudinary/sign-client-upload", { method: "POST" });
      const sigJson = await sigRes.json();
      if (!sigRes.ok) throw new Error(sigJson.error ?? "Could not prepare the upload.");

      const { signature, timestamp, apiKey, cloudName, folder } = sigJson;

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", String(timestamp));
      uploadData.append("signature", signature);
      uploadData.append("folder", folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: uploadData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error?.message ?? "Upload failed.");

      const attachData = new FormData();
      attachData.set("bookingId", bookingId);
      attachData.set("url", uploadJson.secure_url);
      attachData.set("fileName", file.name);
      await uploadBookingFile(attachData);
    } catch {
      // The booking itself already succeeded, a failed attachment
      // shouldn't be reported as the whole request failing, the person
      // can always add the file afterward from their dashboard.
    } finally {
      setUploadingFile(false);
    }
  }

  async function submitBooking(data: Record<string, unknown>) {
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.status === 401) {
      // Not signed in: hold what they typed and show the signup pop-up
      // instead of just an error, so they don't lose their place.
      pendingDataRef.current = data;
      setShowSignup(true);
      setStatus("idle");
      return;
    }
    if (!res.ok) throw new Error(json.error ?? "Something went wrong.");

    if (selectedFile && json.bookingId) {
      await attachFileToBooking(json.bookingId, selectedFile);
    }

    setStatus("success");
    formRef.current?.reset();
    setSelectedFile(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      await submitBooking(data);
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
      await submitBooking(pendingDataRef.current);
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
          Request received.
        </p>
        <p className="text-sm text-[var(--color-slate)]">
          Check your email for confirmation, we&apos;ll follow up within one business day
          to lock in the exact time.
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
        <div>
          <label
            htmlFor="booking-fullName"
            className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]"
          >
            Full name
          </label>
          <input
            id="booking-fullName"
            name="fullName"
            required
            minLength={2}
            maxLength={100}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
        </div>
        <div>
          <label
            htmlFor="booking-email"
            className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]"
          >
            Email
          </label>
          <input
            id="booking-email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="booking-serviceInterest"
          className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]"
        >
          What are you looking to build?
        </label>
        <select
          id="booking-serviceInterest"
          name="serviceInterest"
          required
          value={serviceInterest}
          onChange={handleServiceChange}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        >
          <option value="" disabled>
            Select one
          </option>
          {services.map((s) => (
            <option key={s} value={s} className="bg-[var(--color-ink)]">
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="booking-currency"
          className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]"
        >
          Currency, where are you paying from?
        </label>
        <select
          id="booking-currency"
          name="currency"
          required
          value={payCurrency}
          onChange={handleCurrencyChange}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        >
          {BOOKING_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code} className="bg-[var(--color-ink)]">
              {c.code} — {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-[var(--color-slate)]">
          {payCurrency === "NGN"
            ? "You'll pay in Naira via Paystack."
            : "You'll pay in this currency directly, via Flutterwave."}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="booking-budgetRange"
            className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]"
          >
            Budget
          </label>
          <select
            id="booking-budgetRange"
            name="budgetRange"
            required
            disabled={!serviceInterest}
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              {!serviceInterest
                ? "Pick a package first"
                : budgetOptions.length === 0 && payCurrency !== "NGN"
                  ? "Loading price…"
                  : "Select one"}
            </option>
            {budgetOptions.map((b) => (
              <option key={b} value={b} className="bg-[var(--color-ink)]">
                {b}
              </option>
            ))}
          </select>
          {serviceInterest && payCurrency === "NGN" && budgetOptions.length > 1 && (
            <p className="mt-1.5 text-xs text-[var(--color-slate)]">
              Reflects this package&apos;s real starting price on{" "}
              <a href="/pricing" target="_blank" rel="noopener noreferrer" className="text-[var(--color-brass)] underline underline-offset-4">
                /pricing
              </a>
              .
            </p>
          )}
          {serviceInterest && payCurrency !== "NGN" && budgetOptions.length > 1 && internationalFloorPrices[serviceInterest] !== undefined && (
            <p className="mt-1.5 text-xs text-[var(--color-slate)]">
              Starts at this package&apos;s real floor price outside Nigeria — pick a higher range if you&apos;d like more scope discussed on the call.
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="booking-meetingType"
            className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]"
          >
            Meeting type
          </label>
          <select
            id="booking-meetingType"
            name="meetingType"
            required
            defaultValue=""
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          >
            <option value="" disabled>
              Select one
            </option>
            <option value="video" className="bg-[var(--color-ink)]">Video call</option>
            <option value="phone" className="bg-[var(--color-ink)]">Phone call</option>
            <option value="in-person" className="bg-[var(--color-ink)]">In person (Kaduna)</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="booking-scheduledFor"
          className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]"
        >
          Preferred date & time
        </label>
        <input
          id="booking-scheduledFor"
          name="scheduledFor"
          type="datetime-local"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>

      <div>
        <label
          htmlFor="booking-file"
          className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]"
        >
          Attach a file, photo, or video (optional)
        </label>
        {selectedFile ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brass)]/40 bg-[var(--color-brass)]/10 px-3 py-1.5 text-xs">
            <Paperclip size={13} className="text-[var(--color-brass)]" />
            {selectedFile.name.length > 30 ? `${selectedFile.name.slice(0, 30)}...` : selectedFile.name}
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              aria-label="Remove attachment"
              className="text-[var(--color-slate)] hover:text-red-400"
            >
              <X size={12} />
            </button>
          </span>
        ) : (
          <label
            htmlFor="booking-file"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 py-1.5 text-xs transition hover:border-[var(--color-brass)]"
          >
            <Paperclip size={13} />
            Choose a file
            <input id="booking-file" type="file" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>

      <div>
        <label
          htmlFor="booking-notes"
          className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]"
        >
          Anything I should know beforehand? (optional)
        </label>
        <textarea
          id="booking-notes"
          name="notes"
          maxLength={3000}
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          placeholder="Project brief, current pain points, links to anything relevant."
        />
      </div>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <TermsPanel />

      <label className="flex items-start gap-2.5 text-xs text-[var(--color-slate)]">
        <input
          type="checkbox"
          name="termsAccepted"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[var(--color-brass)]"
        />
        <span>
          I agree to the{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--color-brass)] underline underline-offset-4">
            Terms and Conditions
          </a>
          . A booking can&apos;t be submitted without this.
        </span>
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting" || uploadingFile}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
      >
        {(status === "submitting" || uploadingFile) && <Loader2 size={16} className="animate-spin" />}
        {status === "submitting" ? "Sending…" : uploadingFile ? "Uploading attachment…" : "Request consultation"}
      </button>
    </form>
    </>
  );
}
