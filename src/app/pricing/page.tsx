import type { Metadata } from "next";
import { PricingContent } from "@/components/sections/pricing-content";

export const metadata: Metadata = {
  title: "Packages",
  description: "Every NOBS AGENT package, what it includes, and the AI built into each one. Book a consultation for your exact number.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return <PricingContent />;
}
