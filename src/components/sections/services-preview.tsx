"use client";

import Link from "next/link";
import { siteContent } from "@/lib/content";
import { Carousel3D } from "@/components/carousel-3d";
import { useLanguage } from "@/lib/i18n/language-context";

export function ServicesPreview() {
  const { servicesPreview } = siteContent;
  const { t } = useLanguage();
  const items = [
    { title: t("service_institutional_name"), description: t("service_institutional_desc"), href: servicesPreview.items[0].href },
    { title: t("service_commerce_name"), description: t("service_commerce_desc"), href: servicesPreview.items[1].href },
    { title: t("service_corporate_name"), description: t("service_corporate_desc"), href: servicesPreview.items[2].href },
    { title: t("service_product_name"), description: t("service_product_desc"), href: servicesPreview.items[3].href },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-6 px-6">
        <div>
          <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
            {t("services_eyebrow")}
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl">
            {t("services_title")}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-slate)]">
            {t("services_drag_hint")}
          </p>
        </div>
        <Link
          href="/services"
          className="hidden shrink-0 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)] sm:inline"
        >
          {t("services_view_all")} →
        </Link>
      </div>

      <Carousel3D items={items} orientation="horizontal" />
    </section>
  );
}
