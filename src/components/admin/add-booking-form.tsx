"use client";

import { useState, type FormEvent } from "react";
import { Plus, X, Loader2, CheckCircle2 } from "lucide-react";
import { createBookingManually } from "@/app/admin/bookings/actions";

const services = [
  "School Portals",
  "Hospital Systems",
  "Church Websites",
  "Hotel Booking",
  "Restaurant Websites",
  "Car Dealership Websites",
  "eCommerce",
  "Business Websites",
  "Corporate Websites",
  "Landing Pages",
  "Real Estate Platforms",
  "Custom Web Applications",
  "UI/UX Design",
  "Website Redesign",
  "Website Maintenance",
  "SEO",
  "Branding",
  "Not sure yet",
];

const budgets = ["Under ₦300k", "₦300k – ₦800k", "₦800k – ₦2m", "₦2m+"];

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-brass)]";

// For a client who called, WhatsApp'd, or was booked in person — same
// Booking row the rest of the app already works from, entered by staff
// instead of submitted through the public form.
export function AddBookingForm() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const result = await createBookingManually(new FormData(e.currentTarget));
    if (!result.ok) {
      setStatus("error");
      setError(result.error);
      return;
    }

    setStatus("success");
    e.currentTarget.reset();
    setTimeout(() => {
      setStatus("idle");
      setOpen(false);
    }, 1500);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium transition hover:border-[var(--color-brass)]"
      >
        <Plus size={14} /> Add booking manually
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass relative mt-4 space-y-4 rounded-xl p-5">
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close"
        className="absolute right-4 top-4 text-[var(--color-slate)] hover:text-[var(--color-paper)]"
      >
        <X size={16} />
      </button>
      <p className="text-sm font-medium">Add a booking taken by phone, WhatsApp, or in person</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">Client name</label>
          <input name="fullName" required minLength={2} maxLength={100} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">Email</label>
          <input name="email" type="email" required className={inputClass} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">What are they looking to build?</label>
        <select name="serviceInterest" required defaultValue="" className={inputClass}>
          <option value="" disabled>Select one</option>
          {services.map((s) => (
            <option key={s} value={s} className="bg-[var(--color-ink)]">{s}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">Budget range</label>
          <select name="budgetRange" required defaultValue="" className={inputClass}>
            <option value="" disabled>Select one</option>
            {budgets.map((b) => (
              <option key={b} value={b} className="bg-[var(--color-ink)]">{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">Meeting type</label>
          <select name="meetingType" required defaultValue="" className={inputClass}>
            <option value="" disabled>Select one</option>
            <option value="video" className="bg-[var(--color-ink)]">Video call</option>
            <option value="phone" className="bg-[var(--color-ink)]">Phone call</option>
            <option value="in-person" className="bg-[var(--color-ink)]">In person (Kaduna)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">Date &amp; time</label>
        <input name="scheduledFor" type="datetime-local" required className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">Notes (optional)</label>
        <textarea name="notes" maxLength={3000} rows={3} className={inputClass} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" && <Loader2 size={14} className="animate-spin" />}
        {status === "success" && <CheckCircle2 size={14} />}
        {status === "submitting" ? "Adding…" : status === "success" ? "Added!" : "Add booking"}
      </button>
    </form>
  );
}
