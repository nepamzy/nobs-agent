"use client";

import { useState, type ChangeEvent } from "react";
import { submitProjectBrief } from "@/app/dashboard/new-project/actions";
import { TermsPanel } from "@/components/terms-panel";
import { services, budgetOptionsForService } from "@/lib/booking-budget-options";

// Client component (not the plain server-action form this replaced) so the
// budget dropdown can react to which package is picked — same rule as the
// public booking form: pick a package first, and the amounts offered are
// anchored to that package's real /pricing minimum, not a generic guess.
export function NewProjectForm() {
  const [serviceInterest, setServiceInterest] = useState("");
  const [budgetRange, setBudgetRange] = useState("");

  const budgetOptions = serviceInterest ? budgetOptionsForService(serviceInterest) : [];

  function handleServiceChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setServiceInterest(next);
    const options = budgetOptionsForService(next);
    setBudgetRange(options.length === 1 ? options[0] : "");
  }

  return (
    <form action={submitProjectBrief} className="mt-6 space-y-5">
      <div>
        <label htmlFor="new-project-service-interest" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          What are you looking to build?
        </label>
        <select
          id="new-project-service-interest"
          name="serviceInterest"
          required
          value={serviceInterest}
          onChange={handleServiceChange}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        >
          <option value="" disabled>Select one</option>
          {services.map((s) => (
            <option key={s} value={s} className="bg-[var(--color-ink)]">{s}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="new-project-budget-range" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Budget
          </label>
          <select
            id="new-project-budget-range"
            name="budgetRange"
            required
            disabled={!serviceInterest}
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>{serviceInterest ? "Select one" : "Pick a package first"}</option>
            {budgetOptions.map((b) => (
              <option key={b} value={b} className="bg-[var(--color-ink)]">{b}</option>
            ))}
          </select>
          {serviceInterest && budgetOptions.length > 1 && (
            <p className="mt-1.5 text-xs text-[var(--color-slate)]">
              Reflects this package&apos;s real starting price on{" "}
              <a href="/pricing" target="_blank" rel="noopener noreferrer" className="text-[var(--color-brass)] underline underline-offset-4">
                /pricing
              </a>
              .
            </p>
          )}
        </div>
        <div>
          <label htmlFor="new-project-meeting-type" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Meeting type
          </label>
          <select
            id="new-project-meeting-type"
            name="meetingType"
            required
            defaultValue=""
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          >
            <option value="" disabled>Select one</option>
            <option value="video" className="bg-[var(--color-ink)]">Video call</option>
            <option value="phone" className="bg-[var(--color-ink)]">Phone call</option>
            <option value="in-person" className="bg-[var(--color-ink)]">In person (Kaduna)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="new-project-scheduled-for" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Preferred date & time
        </label>
        <input
          id="new-project-scheduled-for"
          name="scheduledFor"
          type="datetime-local"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>

      <div>
        <label htmlFor="new-project-notes" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
          Tell us about it
        </label>
        <textarea
          id="new-project-notes"
          name="notes"
          required
          rows={6}
          placeholder="What are you building, who is it for, and what should it be able to do? Any deadlines or must-haves are useful here too."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>

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

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
      >
        Submit brief
      </button>
    </form>
  );
}
