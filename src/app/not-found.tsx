import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-24 text-center">
      <Image src="/logo-mark.svg" alt="" width={56} height={56} className="mb-6" />
      <Compass size={28} className="mb-4 text-[var(--color-brass)]" />
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-[var(--color-slate)]">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Check the URL, or head back to somewhere useful.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
        >
          Back to home
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-[var(--color-slate)]/30 px-5 py-2.5 text-sm font-medium transition hover:border-[var(--color-slate)]/60"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
