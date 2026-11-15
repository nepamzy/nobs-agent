import { Hero } from "@/components/sections/hero";
import { ServicesPreview } from "@/components/sections/services-preview";
import { Process } from "@/components/sections/process";
import { CtaSection } from "@/components/sections/cta";
import { getClientCount } from "@/lib/data/client-count";

export default async function Home() {
  const clientCount = await getClientCount();

  return (
    <>
      <Hero clientCount={clientCount} />
      <ServicesPreview />
      <Process />
      <CtaSection />
    </>
  );
}
