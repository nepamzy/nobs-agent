"use client";

import { PageHeader } from "@/components/page-header";
import { Star, MessageSquareQuote } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

type Testimonial = {
  id: string;
  rating: number;
  quote: string;
  authorName: string;
  authorRole: string;
};

export function TestimonialsContent({ testimonials }: { testimonials: Testimonial[] }) {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader eyebrow={t("nav_testimonials")} title={t("testimonials_title")} />

      {testimonials.length === 0 ? (
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <MessageSquareQuote size={28} className="mx-auto text-[var(--color-brass)]" />
          <p className="mt-4 text-sm text-[var(--color-slate)]">{t("testimonials_empty")}</p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-16 sm:grid-cols-2">
          {testimonials.map((item) => (
            <figure key={item.id} className="glass flex flex-col justify-between rounded-2xl p-7">
              <div>
                <div className="flex gap-0.5">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-[var(--color-brass)] text-[var(--color-brass)]" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-[var(--color-paper)]">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-6 text-xs text-[var(--color-slate)]">
                <span className="font-medium text-[var(--color-paper)]">{item.authorName}</span>
                <br />
                {item.authorRole}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
