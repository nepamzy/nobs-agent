import type { Metadata } from "next";
import { PricingContent } from "@/components/sections/pricing-content";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Scoped, category-by-category work. Book a consultation for your exact number.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return <PricingContent />;
}
