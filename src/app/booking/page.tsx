import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { BookingForm } from "@/components/booking-form";
import { AuthGate } from "@/components/auth-gate";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description: "Pick a time to discuss your project with NOBS AGENT.",
  alternates: {
    canonical: "/booking",
  },
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ postSignup?: string }>;
}) {
  const { postSignup } = await searchParams;

  return (
    <div>
      <PageHeader
        eyebrow="Booking"
        title={postSignup ? "One more thing — book a consultation" : "Book a consultation"}
        description="A 30-minute call to scope what you're building and whether it's a fit, no pitch deck, no pressure."
      />
      <div className="mx-auto max-w-xl px-6 pb-24 pt-8">
        <AuthGate>
          <BookingForm />
        </AuthGate>
        {postSignup && (
          <p className="mt-6 text-center text-sm text-[var(--color-slate)]">
            Not ready yet?{" "}
            <Link href="/dashboard" className="text-[var(--color-brass)] underline underline-offset-4">
              Skip for now, go to your dashboard
            </Link>
            . You can always come back and book from here later.
          </p>
        )}
      </div>
    </div>
  );
}
