import type { Metadata } from "next";
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

export default function BookingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Booking"
        title="Book a consultation"
        description="A 30-minute call to scope what you're building and whether it's a fit, no pitch deck, no pressure."
      />
      <div className="mx-auto max-w-xl px-6 pb-24 pt-8">
        <AuthGate>
          <BookingForm />
        </AuthGate>
      </div>
    </div>
  );
}
