import type { Metadata } from "next";
import { AboutContent } from "@/components/sections/about-content";
import { getFounder } from "@/lib/data/founder";
import { getClientCount } from "@/lib/data/client-count";

export const metadata: Metadata = {
  title: "About",
  description: "The team, the standard, and the story behind NOBS AGENT.",
  alternates: {
    canonical: "/about",
  },
};

export default async function AboutPage() {
  const [founder, clientCount] = await Promise.all([getFounder(), getClientCount()]);
  return <AboutContent founder={founder} clientCount={clientCount} />;
}
