// Owner-confirmed company facts. Public pages should read from here (or from
// the matching i18n keys) rather than hard-coding numbers, so nothing on the
// site can drift from what the owner has actually confirmed.
//
// Not confirmed, so deliberately absent: client names, revenue, headcount, certifications, office locations, uptime figures.
export const companyFacts = {
  tagline: "REAL SYSTEMS, NOT TEMPLATES.",
  positioning: "Software & AI Engineering Company",
  // Referral partners are a separate network and are never described as
  // employees or engineers.
  referralPartners: { count: 19, plus: true, region: "Nigeria" },
  // The owner confirmed 22 clients as of the date below. The homepage adds to
  // this for every client or portfolio project created after that date (see
  // lib/data/client-count.ts), so it grows on its own.
  clientsServed: { baseline: 22, countsFrom: "2026-11-15T00:00:00.000Z" },
  // The owner confirmed 20-30; the page shows the safe lower bound.
  projectsDelivered: { count: 20, plus: true },
  // Reported by the owner, measured using a combination of factors. Shown
  // with a qualifier until the methodology, reporting period and supporting
  // records are documented.
  reportedSuccessRatePercent: 98,
} as const;
