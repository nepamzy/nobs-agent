import Link from "next/link";
import { getSiteUrl } from "@/lib/env";

export function Breadcrumbs({
  items,
  className = "",
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- static, non-user-controlled JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`mb-4 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-slate)] ${className}`}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="transition hover:text-[var(--color-brass)]">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-[var(--color-paper)]">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
