"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const close = () => setOpenIndex(null);
  const prev = () =>
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group overflow-hidden rounded-xl border border-[var(--color-line)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URL */}
            <img
              src={url}
              alt={`${title} — screenshot ${i + 1}`}
              className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-6 right-6 text-white/70 transition hover:text-white"
          >
            <X size={28} />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 transition hover:text-white sm:left-8"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URL */}
          <img
            src={images[openIndex]}
            alt={`${title} — screenshot ${openIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 transition hover:text-white sm:right-8"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
