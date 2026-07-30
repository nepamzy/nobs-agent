import Link from "next/link";
import { siteContent } from "@/lib/content";
import { Carousel3D } from "@/components/carousel-3d";

export function ServicesPreview() {
  const { servicesPreview } = siteContent;
  const items = servicesPreview.items.map((item) => ({
    title: item.name,
    description: item.desc,
    href: item.href,
  }));

  return (
    <section className="py-20">
      <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-6 px-6">
        <div>
          <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
            {servicesPreview.eyebrow}
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl">
            {servicesPreview.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-slate)]">
            Drag sideways to browse, tap a card to see it in full.
          </p>
        </div>
        <Link
          href="/services"
          className="hidden shrink-0 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)] sm:inline"
        >
          All services →
        </Link>
      </div>

      <Carousel3D items={items} orientation="horizontal" />
    </section>
  );
}
