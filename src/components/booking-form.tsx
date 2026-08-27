"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { Loader2, CheckCircle2, Paperclip, X } from "lucide-react";
import { SignupPromptModal } from "@/components/signup-prompt-modal";
import { uploadBookingFile } from "@/app/dashboard/new-project/actions";

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
  const [showSignup, setShowSignup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const pendingDataRef = useRef<Record<string, unknown> | null>(null);

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
          Check your email for confirmation, I&apos;ll follow up within one business day
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
          <label
            htmlFor="booking-budgetRange"
            className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]"
          >
            Budget range
          </label>
          <select
            id="booking-budgetRange"
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
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          placeholder="Project brief, current pain points, links to anything relevant."
        />
      </div>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

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
