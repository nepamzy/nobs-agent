"use client";

import { useState } from "react";
import { Star, X, Loader2, CheckCircle2 } from "lucide-react";
import { submitDashboardTestimonial } from "@/app/dashboard/testimonial-actions";

export function TestimonialPopup({
  projectId,
  projectTitle,
}: {
  projectId: string;
  projectTitle: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (dismissed) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("rating", String(rating));

    const result = await submitDashboardTestimonial(formData);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6">
      <div className="glass relative w-full max-w-md rounded-2xl p-8">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Close"
          className="absolute right-4 top-4 text-[var(--color-slate)] hover:text-[var(--color-paper)]"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="py-4 text-center">
            <CheckCircle2 size={28} className="mx-auto text-emerald-400" />
            <p className="mt-3 font-[family-name:var(--font-display)] text-lg font-medium">
              Thank you.
            </p>
            <p className="mt-1 text-sm text-[var(--color-slate)]">
              Your testimonial is in, the studio reviews it before it goes public.
            </p>
          </div>
        ) : (
          <>
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
              Project delivered
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-medium">
              How was working on {projectTitle}?
            </h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <input type="hidden" name="projectId" value={projectId} />

              <div>
                <span id="testimonial-rating-label" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
                  Rating
                </span>
                <div role="group" aria-labelledby="testimonial-rating-label" className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      className="p-0.5"
                    >
                      <Star
                        size={24}
                        className={
                          n <= rating
                            ? "fill-[var(--color-brass)] text-[var(--color-brass)]"
                            : "text-[var(--color-slate)]/40"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="testimonial-quote" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
                  A few words
                </label>
                <textarea
                  id="testimonial-quote"
                  name="quote"
                  required
                  rows={4}
                  placeholder="What was it like working together, and what changed for you?"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? "Sending…" : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="text-sm text-[var(--color-slate)] hover:text-[var(--color-paper)]"
                >
                  Maybe later
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
