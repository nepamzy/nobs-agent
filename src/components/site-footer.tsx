"use client";

import Link from "next/link";
import Image from "next/image";
import { siteContent } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/language-context";

const columns = [
  {
    title: "Studio",
    titleKey: "footer_studio",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    title: "Work",
    titleKey: "footer_work",
    links: [
      { label: "Portfolio", href: "/portfolio" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Clients", href: "/clients" },
      { label: "Testimonials", href: "/testimonials" },
    ],
  },
  {
    title: "Engage",
    titleKey: "footer_engage",
    links: [
      { label: "Services", href: "/services" },
      { label: "Pricing", href: "/pricing" },
      { label: "Book a call", href: "/booking" },
      { label: "Client portal", href: "/dashboard" },
    ],
  },
  {
    title: "Legal",
    titleKey: "footer_legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <>
      <div className="border-t border-[var(--color-line)] bg-[var(--color-brass)] px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-ink)]">
            {t("footer_cta")}
          </p>
          <Link
            href="/booking"
            className="shrink-0 rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-medium text-[var(--color-paper)] transition hover:opacity-90"
          >
            {t("footer_cta_button")}
          </Link>
        </div>
      </div>
      <footer className="border-t border-[var(--color-line)] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Image src="/logo-full.svg" alt={siteContent.brand} width={200} height={57} className="h-10 w-auto" />
            <p className="mt-4 max-w-xs text-sm text-[var(--color-slate)]">
              {siteContent.footer.tagline}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-slate)]">
                {t(col.titleKey)}
              </p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-[var(--color-slate)] transition hover:text-[var(--color-brass)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-[var(--color-line)] pt-6 text-xs text-[var(--color-slate)] sm:flex-row sm:items-center sm:justify-between">
          <p>{siteContent.footer.copyright}</p>
          <p className="font-[family-name:var(--font-mono)]">Kaduna · Remote-first</p>
        </div>
      </div>
      </footer>
    </>
  );
}
