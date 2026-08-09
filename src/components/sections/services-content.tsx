"use client";

import { Carousel3D } from "@/components/carousel-3d";
import { HashScroll } from "@/components/hash-scroll";
import { useLanguage } from "@/lib/i18n/language-context";

export function ServicesContent() {
  const { t } = useLanguage();

  const groups = [
    { id: "institutional", title: t("service_institutional_name"), desc: t("svc_institutional_desc_full") },
    { id: "commerce", title: t("service_commerce_name"), desc: t("svc_commerce_desc_full") },
    { id: "corporate", title: t("service_corporate_name"), desc: t("svc_corporate_desc_full") },
    { id: "product", title: t("service_product_name"), desc: t("svc_product_desc_full") },
    { id: "care", title: t("svc_care_name"), desc: t("svc_care_desc_full") },
  ];

  const items = groups.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.desc,
    href: "/booking",
    meta: `${t("services_start_project")} \u2192`,
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <HashScroll />
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        {t("nav_services")}
      </p>
      <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        {t("services_page_title")}
      </h1>
      <p className="mt-4 max-w-lg text-sm text-[var(--color-slate)]">
        {t("services_page_hint")}
      </p>

      <div className="mt-14">
        <Carousel3D items={items} orientation="vertical" />
      </div>
    </div>
  );
}
