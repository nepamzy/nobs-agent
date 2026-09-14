// USD floor prices for visitors outside Nigeria — researched market-rate
// floors (the cheapest end of what an offshore/budget freelancer charges
// globally for equivalent work), not a currency conversion of the NGN
// price. Nigerian visitors keep paying the NGN prices in pricing-detailed.ts
// and ai-automation-pricing.ts unchanged; this table only applies when
// CurrencyContext's `isNigerian` is false — see src/lib/currency-context.tsx.
//
// Keyed by the same `name`/`id` used in pricing-detailed.ts's
// PricingCategoryItem and ai-automation-pricing.ts's AiAutomationTier, so a
// lookup miss is a real bug (a package renamed in one file and not the
// other), not a silent fallback.

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

  // ---- ai-automation-pricing.ts (id, not name) ----
  "starter-ai": 2000,
  "growth-ai": 20000,
  "enterprise-ai": 75000,
};
