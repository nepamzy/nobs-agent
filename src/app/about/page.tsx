import type { Metadata } from "next";
import { AboutContent } from "@/components/sections/about-content";
import { getFounder } from "@/lib/data/founder";

export const metadata: Metadata = {
  title: "About",
  description: "The studio, the standard, and the story behind NOBS AGENT.",
  alternates: {
    canonical: "/about",
  },
};

export default async function AboutPage() {
  const founder = await getFounder();
  return <AboutContent founder={founder} />;
}
