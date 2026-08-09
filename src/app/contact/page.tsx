import type { Metadata } from "next";
import { ContactContent } from "@/components/sections/contact-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with NOBS AGENT to discuss a project.",
};

export default function ContactPage() {
  return <ContactContent />;
}
