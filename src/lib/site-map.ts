export type SiteMapAccess = "public" | "client" | "referrer" | "admin";

export type SiteMapEntry = {
  label: string;
  href: string;
  section: string;
  access: SiteMapAccess;
};

// Every reachable page on the site, keyed by who can reach it. Dynamic
// detail pages (a specific blog post, project, booking, referral partner,
// etc.) aren't enumerable here without a data fetch, so this covers every
// static route and list/section page, powering the global search so a
// signed-in user can jump straight to any page or sub-page they have
// access to.
export const siteMap: SiteMapEntry[] = [
  // ---- Public ----
  { label: "Home", href: "/", section: "Site", access: "public" },
  { label: "About", href: "/about", section: "Site", access: "public" },
  { label: "Services", href: "/services", section: "Site", access: "public" },
  { label: "Portfolio", href: "/portfolio", section: "Site", access: "public" },
  { label: "Case Studies", href: "/case-studies", section: "Site", access: "public" },
  { label: "Clients", href: "/clients", section: "Site", access: "public" },
  { label: "Testimonials", href: "/testimonials", section: "Site", access: "public" },
  { label: "Pricing", href: "/pricing", section: "Site", access: "public" },
  { label: "Blog", href: "/blog", section: "Site", access: "public" },
  { label: "Resources", href: "/resources", section: "Site", access: "public" },
  { label: "Skills", href: "/skills", section: "Site", access: "public" },
  { label: "Careers", href: "/careers", section: "Site", access: "public" },
  { label: "FAQ", href: "/faq", section: "Site", access: "public" },
  { label: "Contact", href: "/contact", section: "Site", access: "public" },
  { label: "Book a call", href: "/booking", section: "Site", access: "public" },
  { label: "Privacy Policy", href: "/privacy", section: "Site", access: "public" },
  { label: "Terms", href: "/terms", section: "Site", access: "public" },
  { label: "Client sign in", href: "/login", section: "Account", access: "public" },
  { label: "Client sign up", href: "/signup", section: "Account", access: "public" },
  { label: "Become a referral partner", href: "/partner/signup", section: "Account", access: "public" },
  { label: "Referral Partner Agreement", href: "/partner/agreement", section: "Account", access: "public" },

  // ---- Client portal ----
  { label: "Portal overview", href: "/dashboard", section: "Client portal", access: "client" },
  { label: "Start a new project", href: "/dashboard/new-project", section: "Client portal", access: "client" },
  { label: "Messages", href: "/dashboard/messages", section: "Client portal", access: "client" },
  { label: "Inquiries", href: "/dashboard/inquiries", section: "Client portal", access: "client" },
  { label: "Payments", href: "/dashboard/payments", section: "Client portal", access: "client" },
  { label: "Settings", href: "/dashboard/settings", section: "Client portal", access: "client" },

  // ---- Referral partner ----
  { label: "Partner dashboard", href: "/partner", section: "Referral partner", access: "referrer" },

  // ---- Admin ----
  { label: "Admin overview", href: "/admin", section: "Admin", access: "admin" },
  { label: "Site content", href: "/admin/content", section: "Admin", access: "admin" },
  { label: "Portfolio", href: "/admin/portfolio", section: "Admin", access: "admin" },
  { label: "New portfolio project", href: "/admin/portfolio/new", section: "Admin", access: "admin" },
  { label: "Founder profile", href: "/admin/founder", section: "Admin", access: "admin" },
  { label: "Blog posts", href: "/admin/blog", section: "Admin", access: "admin" },
  { label: "New blog post", href: "/admin/blog/new", section: "Admin", access: "admin" },
  { label: "Clients", href: "/admin/clients", section: "Admin", access: "admin" },
  { label: "Careers postings", href: "/admin/careers", section: "Admin", access: "admin" },
  { label: "New job posting", href: "/admin/careers/postings/new", section: "Admin", access: "admin" },
  { label: "Referral partners", href: "/admin/partners", section: "Admin", access: "admin" },
  { label: "Inbox", href: "/admin/inbox", section: "Admin", access: "admin" },
  { label: "Messages", href: "/admin/messages", section: "Admin", access: "admin" },
  { label: "Inquiries", href: "/admin/inquiries", section: "Admin", access: "admin" },
  { label: "Bookings", href: "/admin/bookings", section: "Admin", access: "admin" },
  { label: "Payments", href: "/admin/payments", section: "Admin", access: "admin" },
  { label: "Analytics", href: "/admin/analytics", section: "Admin", access: "admin" },
  { label: "Google Analytics detail", href: "/admin/analytics/google", section: "Admin", access: "admin" },
];

export function siteMapFor(role: "ADMIN" | "STAFF" | "CLIENT" | "REFERRER" | undefined): SiteMapEntry[] {
  return siteMap.filter((entry) => {
    if (entry.access === "public") return true;
    if (entry.access === "admin") return role === "ADMIN" || role === "STAFF";
    if (entry.access === "client") return role === "CLIENT";
    if (entry.access === "referrer") return role === "REFERRER";
    return false;
  });
}
