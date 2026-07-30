// Reads from the database (`PricingPlan` model) with a graceful fallback,
// see the note in projects.ts for why. Prices are in NGN, whole naira for
// display (the DB schema stores this as-is, unlike Invoice.amount which
// uses the smallest currency unit).

import { prisma } from "@/lib/prisma";

export type PricingPlan = {
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  highlighted: boolean;
};

const fallbackPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: 450000,
    interval: "one-time",
    description: "A professional presence for a business that needs to be found and trusted.",
    features: [
      "Up to 5 pages",
      "Mobile-responsive design",
      "Contact form with email routing",
      "Basic on-page SEO",
      "2 rounds of revisions",
    ],
    highlighted: false,
  },
  {
    name: "Growth",
    price: 1200000,
    interval: "one-time",
    description: "For businesses that need a real content management layer and payments.",
    features: [
      "Up to 15 pages",
      "Admin dashboard for content edits",
      "Payment integration (Paystack/Flutterwave/Stripe)",
      "Blog with categories & SEO metadata",
      "Booking or inquiry system",
      "3 months of post-launch support",
    ],
    highlighted: true,
  },
  {
    name: "Institutional",
    price: 2500000,
    interval: "one-time",
    description: "Custom portals for schools, hospitals, and multi-role organizations.",
    features: [
      "Custom-built portal architecture",
      "Role-based accounts (staff, clients, admin)",
      "File exchange & document storage",
      "Custom reporting & analytics",
      "Priority support & SLA",
      "6 months of post-launch support",
    ],
    highlighted: false,
  },
];

async function fetchFromDb(): Promise<PricingPlan[] | null> {
  try {
    const rows = await prisma.pricingPlan.findMany({ orderBy: { order: "asc" } });
    if (rows.length === 0) return null;
    return rows.map((r) => ({
      name: r.name,
      price: r.price,
      interval: r.interval ?? "one-time",
      description: r.description ?? "Full details confirmed in your proposal.",
      features: r.features,
      highlighted: r.highlighted,
    }));
  } catch {
    return null;
  }
}

export async function getPricingPlans() {
  return (await fetchFromDb()) ?? fallbackPlans;
}
