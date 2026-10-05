// USD floor prices for visitors outside Nigeria — researched market-rate
// floors (the cheapest end of what an offshore/budget freelancer charges
// globally for equivalent work), not a currency conversion of the NGN
// price. Nigerian visitors keep paying the NGN prices in pricing-detailed.ts
// unchanged; this table only applies when
// CurrencyContext's `isNigerian` is false — see src/lib/currency-context.tsx.
//
// Keyed by the same `name` used in pricing-detailed.ts's PricingCategoryItem
// (everything on the booking form addresses a service by its display name,
// see src/lib/booking-budget-options.ts's `services`), so a lookup miss is a
// real bug (a package renamed in one file and not the other), not a silent
// fallback.

export const internationalFloorPrices: Record<string, number> = {
  // ---- pricing-detailed.ts ----
  "School Portals": 15000,
  "Hospital Systems": 30000,
  "Church Websites": 2000,
  "Hotel Booking": 10000,
  "Restaurant Websites": 1500,
  "Car Dealership Websites": 5000,
  "eCommerce": 5000,
  "Business Websites": 1500,
  "Corporate Websites": 2500,
  "Landing Pages": 300,
  "Real Estate Platforms": 2000,
  "Custom Web Applications": 15000,
  "UI/UX Design": 3000,
  "Website Redesign": 1500,

  // Ongoing Care: a straight conversion of the NGN launch price (not a
  // researched market floor like the entries above), at ₦1,331 = $1 on
  // 2026-10-05, rounded to a clean number. Maintenance and SEO are per
  // month and Hosting per year (same `unit` as pricing-detailed.ts);
  // Branding is one-time.
  "Website Maintenance": 65,
  "SEO": 70,
  "Hosting (management)": 60,
  "Branding": 90,

  // AI Automation (ai-automation-pricing.ts) deliberately has no entry:
  // it's never priced on the site, in any currency — the number is agreed
  // on the scoping call. See AI_BUDGET_OPTION in booking-budget-options.ts.
};
