import type { Metadata } from "next";
import { ServicesContent } from "@/components/sections/services-content";
import { getProjects } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Websites and platforms for institutions, commerce, and growing businesses, plus the design, SEO, hosting, and maintenance behind them.",
};

export default async function ServicesPage() {
  const projects = await getProjects();
  return <ServicesContent hasPortfolioExamples={projects.length > 0} />;
}
