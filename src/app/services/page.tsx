import type { Metadata } from "next";
import { ServicesContent } from "@/components/sections/services-content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Websites and platforms for institutions, commerce, and growing businesses, plus the design, SEO, hosting, and maintenance behind them.",
};

export default function ServicesPage() {
  return <ServicesContent />;
}
