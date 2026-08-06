// This file is the single source of truth for on-page copy.
// In production this shape is served from the database (see prisma/schema.prisma
// `SiteContent` model) and edited from /admin. Components should always read
// from here (or from the fetched equivalent) rather than hardcoding strings,
// so the "no text is hardcoded" requirement is structurally enforced.

export const siteContent = {
  brand: "NOBS AGENT",
  nav: [
    { label: "Work", href: "/portfolio" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  hero: {
    eyebrow: "Full-stack software engineer",
    title: "Institutions building their next chapter deserve infrastructure, not templates.",
    subtitle:
      "I design and build the websites, portals, and systems that schools, hospitals, hotels, dealerships, and growing businesses run on, engineered to the same standard as the platforms you use every day.",
    primaryCta: { label: "Start a project", href: "/booking" },
    secondaryCta: { label: "View the work", href: "/portfolio" },
    stats: [
      { value: 11, suffix: "", label: "Sectors served" },
      { value: 99, suffix: ".9%", label: "Uptime across live client systems" },
      { value: 1, suffix: " month", label: "Typical time to launch", note: "depending on the project" },
    ],
  },
  servicesPreview: {
    eyebrow: "What I build",
    title: "One studio, the full stack",
    items: [
      { name: "Institutional Platforms", desc: "Schools, hospitals, and churches, portals built for the people who run them daily.", href: "/services#institutional" },
      { name: "Commerce & Booking", desc: "Hotels, restaurants, and dealerships, systems that take real payments and real reservations.", href: "/services#commerce" },
      { name: "Corporate & Brand", desc: "Websites and web apps for businesses that need to be taken seriously on sight.", href: "/services#corporate" },
      { name: "Product Engineering", desc: "Custom web applications, dashboards, and internal tools built from scratch.", href: "/services#product" },
    ],
  },
  process: {
    eyebrow: "How a project runs",
    title: "The build, in four stages",
    steps: [
      { name: "Discover", desc: "Scope, users, and success metrics defined before a line of code is written." },
      { name: "Design", desc: "Interface and system architecture designed together, not in sequence." },
      { name: "Build", desc: "Weekly demos against a live staging environment, you watch it come together." },
      { name: "Operate", desc: "Launch, handover, and a maintenance plan so the system keeps working after I'm gone." },
    ],
  },
  cta: {
    title: "Tell me what you're building.",
    subtitle: "A short discovery call is the fastest way to find out if we're a fit.",
    buttonLabel: "Book a consultation",
    buttonHref: "/booking",
  },
  footer: {
    tagline: "Digital infrastructure for growing institutions.",
    copyright: `© ${new Date().getFullYear()} NOBS AGENT. All rights reserved.`,
  },
};

export type SiteContent = typeof siteContent;
