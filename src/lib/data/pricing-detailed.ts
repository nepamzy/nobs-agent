// The detailed, categorized pricing shown on /pricing. Separate from the
// simple PricingPlan DB model (still used by /admin for a lighter-weight
// summary elsewhere) because this structure carries far more per-category
// detail than that model was designed for, tier labels, launch vs.
// standard pricing, and bullet-point scope. Static for now; the right
// long-term home is its own DB table if this needs day-to-day editing.

export type PricingTier = "Starter" | "Growth" | "Institutional";

export type PricingCategoryItem = {
  name: string;
  tier: PricingTier;
  standardPrice: number; // NGN, the studio's real long-term rate
  launchPrice: number; // NGN, current launch-phase rate (what's actually charged)
  unit?: string; // e.g. "/month" for recurring items, omit for one-time
  bullets: string[];
};

export type PricingGroup = {
  id: string;
  title: string;
  description: string;
  items: PricingCategoryItem[];
};

export const pricingGroups: PricingGroup[] = [
  {
    id: "institutional",
    title: "Institutional Platforms",
    description: "For the organizations a community depends on to run smoothly.",
    items: [
      {
        name: "School Portals",
        tier: "Institutional",
        standardPrice: 2200000,
        launchPrice: 1300000,
        bullets: [
          "Admissions and enrollment workflow",
          "Fee payment via Paystack",
          "Attendance and report cards",
          "Separate parent, teacher, and admin roles",
          "Class and timetable management",
        ],
      },
      {
        name: "Hospital Systems",
        tier: "Institutional",
        standardPrice: 3800000,
        launchPrice: 2200000,
        bullets: [
          "Patient records only the right staff can open",
          "Appointment scheduling",
          "Each staff member sees only what their job needs",
          "Billing connected to patient records",
          "Lab and prescription tracking",
        ],
      },
      {
        name: "Church Websites",
        tier: "Starter",
        standardPrice: 650000,
        launchPrice: 400000,
        bullets: [
          "Sermon archive and streaming",
          "Events calendar",
          "Online giving via Paystack",
          "Ministry and small-group pages",
          "Prayer request submission",
        ],
      },
    ],
  },
  {
    id: "commerce",
    title: "Commerce & Booking",
    description: "Systems that take real payments and real reservations, reliably.",
    items: [
      {
        name: "Hotel Booking",
        tier: "Growth",
        standardPrice: 1400000,
        launchPrice: 850000,
        bullets: [
          "Real-time availability calendar",
          "Deposit collection at booking",
          "Automated confirmation emails",
          "Room type and rate management",
          "Admin dashboard for reservations",
        ],
      },
      {
        name: "Restaurant Websites",
        tier: "Starter",
        standardPrice: 500000,
        launchPrice: 300000,
        bullets: [
          "Menu and pricing",
          "Table reservations",
          "Customers can order through WhatsApp",
          "Location and hours display",
          "Photo gallery of the space and dishes",
        ],
      },
      {
        name: "Car Dealership Websites",
        tier: "Growth",
        standardPrice: 900000,
        launchPrice: 550000,
        bullets: [
          "Searchable, filterable inventory",
          "An enquiry form on every vehicle",
          "Image galleries per listing",
          "Financing inquiry form",
          "Sold/available status tracking",
        ],
      },
      {
        name: "eCommerce",
        tier: "Growth",
        standardPrice: 1100000,
        launchPrice: 650000,
        bullets: [
          "Product catalog and cart",
          "Checkout with Paystack/Flutterwave",
          "Order management",
          "Inventory and stock tracking",
          "Discount codes and promotions",
        ],
      },
    ],
  },
  {
    id: "corporate",
    title: "Corporate & Brand",
    description: "The digital front door for a business that needs to be taken seriously.",
    items: [
      {
        name: "Business Websites",
        tier: "Starter",
        standardPrice: 646000,
        launchPrice: 380000,
        bullets: [
          "Up to 5 pages",
          "Works well on phones",
          "Contact form",
          "Basic setup to help you show up on Google",
          "Your Google Business Profile (Maps listing) set up",
        ],
      },
      {
        name: "Corporate Websites",
        tier: "Growth",
        standardPrice: 1054000,
        launchPrice: 620000,
        bullets: [
          "Larger page count",
          "Leadership/team structure",
          "More design polish for a larger org",
          "Careers/openings page",
          "Press and media section",
        ],
      },
      {
        name: "Landing Pages",
        tier: "Starter",
        standardPrice: 255000,
        launchPrice: 150000,
        bullets: [
          "Single-purpose page",
          "Fast turnaround",
          "Built to get visitors to take one action",
          "Mobile-first layout",
          "Visitor statistics set up",
        ],
      },
      {
        name: "Real Estate Platforms",
        tier: "Growth",
        standardPrice: 816000,
        launchPrice: 480000,
        bullets: [
          "Property listings",
          "Search and filter",
          "An enquiry form on every property",
          "Agent contact per property",
          "Map-based location display",
        ],
      },
    ],
  },
  {
    id: "product",
    title: "Product Engineering",
    description: "When the need is a system, not a page.",
    items: [
      {
        name: "Custom Web Applications",
        tier: "Institutional",
        standardPrice: 5500000,
        launchPrice: 3200000,
        bullets: [
          "User accounts where each person sees only what they should",
          "Your data organized exactly the way your business works",
          "Admin dashboard",
          "Secure logins and file storage",
          "Connected to other services you use, as needed",
        ],
      },
      {
        name: "UI/UX Design",
        tier: "Starter",
        standardPrice: 350000,
        launchPrice: 210000,
        bullets: [
          "Design-only engagement",
          "For clients with their own developer",
          "Layout sketches, then finished screen designs",
          "A reusable set of design building blocks",
          "Files your developer can build from directly",
        ],
      },
      {
        name: "Website Redesign",
        tier: "Growth",
        standardPrice: 550000,
        launchPrice: 330000,
        bullets: [
          "Rebuild of an existing site",
          "Content and structure carried over",
          "Modernized visual design",
          "Performance and mobile improvements",
          "Your Google rankings protected during the switch",
        ],
      },
    ],
  },
  {
    id: "care",
    title: "Ongoing Care",
    description: "What keeps a platform healthy after launch. Recurring, not one-time.",
    items: [
      {
        name: "Website Maintenance",
        tier: "Starter",
        standardPrice: 120000,
        launchPrice: 85000,
        unit: "/month",
        bullets: [
          "Updates and small fixes",
          "We watch that your site stays online",
          "Regular backups",
          "Security updates applied",
          "Monthly health report",
        ],
      },
      {
        name: "SEO",
        tier: "Starter",
        standardPrice: 130000,
        launchPrice: 90000,
        unit: "/month",
        bullets: [
          "Ongoing improvements to your pages for Google",
          "Showing up in local searches near you",
          "Your Google Business Profile kept up to date",
          "Monthly ranking and traffic report",
          "Content and keyword recommendations",
        ],
      },
      {
        name: "Hosting (management)",
        tier: "Starter",
        standardPrice: 80000,
        launchPrice: 80000,
        unit: "/year",
        bullets: [
          "Domain renewal",
          "We look after the servers your site runs on",
          "We watch your site around the clock",
          "The padlock (secure connection) kept valid",
          "Downtime alerts and response",
        ],
      },
      {
        name: "Branding",
        tier: "Starter",
        standardPrice: 180000,
        launchPrice: 120000,
        bullets: [
          "Logo",
          "Color system",
          "Basic brand guide",
          "Matching fonts chosen for your brand",
          "Social media profile assets",
        ],
      },
    ],
  },
];

// The build packages that come AI-ready, with Starter AI available as an
// add-on at a bundle discount. The size of the discount is agreed with the
// client after the scoping call, so no number appears anywhere on the
// site. Left out on purpose: UI/UX Design (design only, nothing is built)
// and the Ongoing Care items (Maintenance, SEO, Hosting, Branding).
export const STARTER_AI_BUNDLE_PACKAGES: string[] = [
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
  "Website Redesign",
];

export function hasStarterAiBundle(packageName: string): boolean {
  return STARTER_AI_BUNDLE_PACKAGES.includes(packageName);
}
