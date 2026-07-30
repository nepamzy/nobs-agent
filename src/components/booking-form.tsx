"use client";

import { useState, type FormEvent } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

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

export function BookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      setStatus("success");
      form.reset();
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
          Check your email for confirmation, I&apos;ll follow up within one business day
          to lock in the exact time.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass space-y-5 rounded-2xl p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Full name
          </label>
          <input
            name="fullName"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          What are you looking to build?
        </label>
        <select
          name="serviceInterest"
          required
          defaultValue=""
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Budget range
          </label>
          <select
            name="budgetRange"
            required
            defaultValue=""
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          >
            <option value="" disabled>
              Select one
            </option>
            {budgets.map((b) => (
              <option key={b} value={b} className="bg-[var(--color-ink)]">
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Meeting type
          </label>
          <select
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
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Preferred date & time
        </label>
        <input
          name="scheduledFor"
          type="datetime-local"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Anything I should know beforehand? (optional)
        </label>
        <textarea
          name="notes"
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          placeholder="Project brief, current pain points, links to anything relevant."
        />
      </div>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" && <Loader2 size={16} className="animate-spin" />}
        {status === "submitting" ? "Sending…" : "Request consultation"}
      </button>
    </form>
  );
}
