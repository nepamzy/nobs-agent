import type { Metadata } from "next";
import { Carousel3D } from "@/components/carousel-3d";
import { HashScroll } from "@/components/hash-scroll";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Websites and platforms for institutions, commerce, and growing businesses, plus the design, SEO, hosting, and maintenance behind them.",
};

const groups = [
  {
    id: "institutional",
    title: "Institutional Platforms",
    desc: "For the organizations a community depends on to run smoothly, school portals, hospital systems, church websites.",
  },
  {
    id: "commerce",
    title: "Commerce & Booking",
    desc: "Systems that take real payments and real reservations, reliably, hotel booking, restaurant websites, dealership inventory, eCommerce.",
  },
  {
    id: "corporate",
    title: "Corporate & Brand",
    desc: "The digital front door for a business that needs to be taken seriously, business and corporate websites, landing pages, real estate platforms.",
  },
  {
    id: "product",
    title: "Product Engineering",
    desc: "When the need is a system, not a page, custom web applications, UI/UX design, website redesign.",
  },
  {
    id: "care",
    title: "Ongoing Care",
    desc: "What keeps a platform healthy after launch, maintenance, SEO, hosting, branding.",
  },
];

export default function ServicesPage() {
  const items = groups.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.desc,
    href: "/booking",
    meta: "Start a project →",
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <HashScroll />
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Services
      </p>
      <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        Whatever the sector, the standard doesn&apos;t change.
      </h1>
      <p className="mt-4 max-w-lg text-sm text-[var(--color-slate)]">
        Drag up or down to browse, tap a card to start that conversation directly.
      </p>

      <div className="mt-14">
        <Carousel3D items={items} orientation="vertical" />
      </div>
    </div>
  );
}
