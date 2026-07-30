import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { getTestimonials } from "@/lib/data/clients";
import { Star, MessageSquareQuote } from "lucide-react";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "What clients say after working with NOBS AGENT.",
};

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div>
      <PageHeader eyebrow="Testimonials" title="In their own words" />

      {testimonials.length === 0 ? (
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <MessageSquareQuote size={28} className="mx-auto text-[var(--color-brass)]" />
          <p className="mt-4 text-sm text-[var(--color-slate)]">
            Client testimonials go here as projects wrap up. Nothing published yet.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-16 sm:grid-cols-2">
          {testimonials.map((t) => (
            <figure key={t.id} className="glass flex flex-col justify-between rounded-2xl p-7">
              <div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-[var(--color-brass)] text-[var(--color-brass)]" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-[var(--color-paper)]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-6 text-xs text-[var(--color-slate)]">
                <span className="font-medium text-[var(--color-paper)]">{t.authorName}</span>
                <br />
                {t.authorRole}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
