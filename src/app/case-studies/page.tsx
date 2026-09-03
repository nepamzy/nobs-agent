import type { Metadata } from "next";
import { getProjects } from "@/lib/data/projects";
import { CaseStudiesContent } from "@/components/sections/case-studies-content";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "In-depth breakdowns of problem, solution, and measured results from select projects.",
  alternates: {
    canonical: "/case-studies",
  },
};

export default async function CaseStudiesPage() {
  const projects = await getProjects();
  return <CaseStudiesContent projects={projects} />;
}
