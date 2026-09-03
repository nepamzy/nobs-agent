import type { Metadata } from "next";
import { FaqContent } from "@/components/sections/faq-content";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about working with NOBS AGENT.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FaqPage() {
  return <FaqContent />;
}
