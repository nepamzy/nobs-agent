import { pricingGroups } from "@/lib/data/pricing-detailed";

// Single source of truth for every booking entry point (public form,
// dashboard "new project", admin manual entry) — a client must pick a
// package before an amount, and the amounts offered are tied to that
// package's real price on /pricing, never a generic guess. Pure/static,
// safe to import from a client component.

export const services = [
  // Listed first, deliberately — someone who doesn't yet know which
  // package they need shouldn't have to scroll past every option to find
  // the one that fits them, in any of the three forms this list feeds.
  "Not sure yet",
  "School Portals",
  "Hospital Systems",
  "Church Websites",
  "Hotel Booking",
  "Restaurant Websites",
  "Car Dealership Websites",
  "eCommerce",
  "Business Websites",
  "Corporate Websites",
  "Landing Pages",
  "Real Estate Platforms",
  "Custom Web Applications",
  "UI/UX Design",
  "Website Redesign",
  "Website Maintenance",
  "SEO",
  "Branding",
] as const;

// Shown for "Not sure yet" — the only case where we genuinely don't know
// a real minimum to anchor to.
const GENERIC_BUDGETS = ["Under ₦300k", "₦300k – ₦800k", "₦800k – ₦2m", "₦2m+"];

const pricingByService = Object.fromEntries(
  pricingGroups.flatMap((group) => group.items.map((item) => [item.name, item]))
);

function formatNaira(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `₦${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}m`;
  }
  return `₦${Math.round(amount / 1000)}k`;
}

// Rounds a computed tier boundary to a "clean" number worth showing a
// client — the bucket size scales with magnitude so a ₦150k package
// doesn't get rounded to the nearest ₦250k, and a ₦3m one doesn't get
// rounded to the nearest ₦50k.
function roundToNiceNumber(amount: number): number {
  const bucket = amount >= 5_000_000 ? 250_000 : amount >= 1_000_000 ? 100_000 : 50_000;
  return Math.round(amount / bucket) * bucket;
}

// The full set of amounts allowed for a given package — what the budget
// dropdown shows, AND what the server accepts. Anchored at the package's
// real launch price from /pricing (never below it), escalating in two
// steps above that so a client can still signal a bigger budget.
export function budgetOptionsForService(serviceInterest: string): string[] {
  if (serviceInterest === "Not sure yet") return GENERIC_BUDGETS;

  const item = pricingByService[serviceInterest];
  if (!item) return GENERIC_BUDGETS;

  // Recurring services (Website Maintenance, SEO) are billed at one fixed
  // monthly rate, not a project budget range — a single option, not a tier.
  if (item.unit) {
    return [`₦${item.launchPrice.toLocaleString("en-NG")}${item.unit}`];
  }

  const min = item.launchPrice;
  const tier1 = roundToNiceNumber(min * 1.5);
  const tier2 = roundToNiceNumber(min * 2.2);

  return [
    `${formatNaira(min)} – ${formatNaira(tier1)}`,
    `${formatNaira(tier1)} – ${formatNaira(tier2)}`,
    `${formatNaira(tier2)}+`,
  ];
}
