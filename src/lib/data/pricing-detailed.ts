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
          "Patient records with access controls",
          "Appointment scheduling",
          "Staff roles and permissions",
          "Billing integration",
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
          "WhatsApp ordering integration",
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
          "Per-vehicle lead capture",
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
        standardPrice: 380000,
        launchPrice: 230000,
        bullets: [
          "Up to 5 pages",
          "Mobile-responsive",
          "Contact form",
          "Basic on-page SEO",
          "Google Business Profile setup",
        ],
      },
      {
        name: "Corporate Websites",
        tier: "Growth",
        standardPrice: 620000,
        launchPrice: 380000,
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
        standardPrice: 150000,
        launchPrice: 95000,
        bullets: [
          "Single-purpose page",
          "Fast turnaround",
          "Built to convert one action",
          "Mobile-first layout",
          "Basic analytics wired in",
        ],
      },
      {
        name: "Real Estate Platforms",
        tier: "Growth",
        standardPrice: 480000,
        launchPrice: 290000,
        bullets: [
          "Property listings",
          "Search and filter",
          "Inquiry capture per listing",
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
          "Role-based accounts and permissions",
          "Custom database design",
          "Admin dashboard",
          "Secure authentication and file storage",
          "Third-party API integrations as needed",
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
          "Wireframes and high-fidelity mockups",
          "A reusable component/design system",
          "Handoff files ready for development",
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
          "SEO preserved through the transition",
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
          "Uptime monitoring",
          "Regular backups",
          "Security patching",
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
          "Ongoing on-page work",
          "Local SEO",
          "Google Business Profile upkeep",
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
          "Infrastructure oversight",
          "Monitoring",
          "SSL certificate management",
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
          "Typography pairing",
          "Social media profile assets",
        ],
      },
    ],
  },
];
