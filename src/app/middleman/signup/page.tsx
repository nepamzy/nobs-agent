import type { Metadata } from "next";
import Image from "next/image";
import { MiddlemanSignupForm } from "@/components/middleman-signup-form";
import { MIDDLEMAN_CAPACITY, getMiddlemanCount } from "@/lib/middleman";

// The full/not-full state depends on a live DB count, so this page must
// never be served from the static prerender cache built at deploy time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Become a Middleman",
  robots: { index: false },
  alternates: {
    canonical: "/middleman/signup",
  },
};

export default async function MiddlemanSignupPage() {
  const count = await getMiddlemanCount();
  const isFull = count >= MIDDLEMAN_CAPACITY;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-24">
      <Image src="/logo-mark.svg" alt="" width={56} height={56} className="mx-auto mb-6" />
      <p className="mb-3 text-center font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Middleman Access
      </p>
      <h1 className="mb-8 text-center font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight">
        Create your account
      </h1>
      {isFull ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="font-medium text-red-400">Not available</p>
          <p className="mt-2 text-sm text-[var(--color-slate)]">
            All {MIDDLEMAN_CAPACITY} middleman spots are taken right now. Check back later.
          </p>
        </div>
      ) : (
        <MiddlemanSignupForm />
      )}
    </div>
  );
}
