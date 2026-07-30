import { getSiteUrl } from "@/lib/env";

const SITE_URL = getSiteUrl();

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "NOBS AGENT",
    url: SITE_URL,
    description:
      "A full-stack software engineer building websites, platforms, and systems for schools, hospitals, hotels, dealerships, churches, and ambitious businesses across Africa.",
    areaServed: "Africa",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kaduna",
      addressCountry: "NG",
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- static, non-user-controlled JSON-LD
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
