import type { Metadata } from "next";
import { AboutContent } from "@/components/sections/about-content";

export const metadata: Metadata = {
  title: "About",
  description: "The studio, the standard, and the story behind NOBS AGENT.",
};

export default function AboutPage() {
  return <AboutContent />;
}
