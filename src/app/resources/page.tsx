import type { Metadata } from "next";
import { ResourcesContent } from "@/components/sections/resources-content";

export const metadata: Metadata = {
  title: "Resources",
  description: "Guides and downloads for institutions planning a digital project.",
  alternates: {
    canonical: "/resources",
  },
};

export default function ResourcesPage() {
  return <ResourcesContent />;
}
