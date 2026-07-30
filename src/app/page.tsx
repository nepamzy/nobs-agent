import { Hero } from "@/components/sections/hero";
import { ServicesPreview } from "@/components/sections/services-preview";
import { Process } from "@/components/sections/process";
import { CtaSection } from "@/components/sections/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesPreview />
      <Process />
      <CtaSection />
    </>
  );
}
