import type { Metadata } from "next";
import { getTestimonials } from "@/lib/data/clients";
import { getServerLanguage, translateFields } from "@/lib/translate-content";
import { TestimonialsContent } from "@/components/sections/testimonials-content";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "What clients say after working with NOBS AGENT.",
};

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();
  const language = await getServerLanguage();

  const translated = await Promise.all(
    testimonials.map(async (item) => {
      const { quote } = await translateFields({ quote: item.quote }, language);
      return { ...item, quote };
    })
  );

  return <TestimonialsContent testimonials={translated} />;
}
