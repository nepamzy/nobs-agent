// The discovery questions asked before quoting a client, one set per
// package (everything except Ongoing Care — Maintenance/SEO/Hosting/
// Branding are add-ons discussed after the core build is scoped, not
// scoped on their own). Answering these here, on a client's record, is
// what a ClientBrief snapshots — see src/app/admin/clients/[id]/briefs/.

export type ScopingQuestionGroup = {
  title: string;
  questions: string[];
};

export type ScopingPackage = {
  // Matches a name in src/lib/booking-budget-options.ts's `services` list
  // where one exists, so a package picked here lines up with the same
  // package a client picked on the booking form.
  key: string;
  category: string;
  tier: "Starter" | "Growth" | "Institutional";
  recap: string;
  groups: ScopingQuestionGroup[];
};

export const scopingBookPackages: ScopingPackage[] = [
  // ---------- Institutional Platforms ----------
  {
    key: "School Portals",
    category: "Institutional Platforms",
    tier: "Institutional",
    recap:
      "Admissions & enrollment workflow, fee payment via Paystack, attendance & report cards, separate parent/teacher/admin roles, class & timetable management.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "How many students currently, and expected growth over the next 2–3 years?",
          "Replacing an existing system (spreadsheets, other software), or the school's first digital system?",
          "Which problem does this solve first — admissions chaos, fee collection, or record-keeping?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Academic calendar/term structure documented (terms, class levels, subjects)?",
          "Current fee structure — per term, per class, discounts/scholarships to account for?",
          "Existing student records to migrate (paper files, spreadsheets, another system)?",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "Does the school already have a Paystack account for fee collection, or does one need setting up?",
          "Does report-card generation need to follow a specific grading scale/format they already use?",
          "SMS or email notifications to parents — needed at launch, or a later add-on?",
        ],
      },
      {
        title: "Users & operations",
        questions: [
          "Just Admin/Teacher/Parent, or also a separate Bursar/Accountant role?",
          "How many staff need accounts at launch?",
          "Do teachers enter attendance/grades themselves, or front-office on their behalf?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "Budgeted by the school directly, or a proprietor/board needing a formal proposal?",
          "Any state education-board record requirement this needs to satisfy?",
          "Target launch — start of a specific term?",
        ],
      },
    ],
  },
  {
    key: "Hospital Systems",
    category: "Institutional Platforms",
    tier: "Institutional",
    recap:
      "Patient records with access controls, appointment scheduling, staff roles & permissions, billing integration, lab & prescription tracking.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "What kind of facility — clinic, hospital, diagnostic lab — and roughly how many patients/week?",
          "Replacing paper records, or an existing (possibly outdated) software system?",
          "Single location, or multiple branches needing shared records?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Existing patient record format that needs migrating or referencing for structure?",
          "Full Electronic Health Record (diagnoses, history, allergies), or a lighter registration + scheduling + billing system? — materially changes scope.",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "Billing — Paystack/Flutterwave for patients, or integration with an existing accounting system?",
          "Any regulatory data-protection requirement for patient data handling?",
          "Lab/prescription tracking — manual entry, or interfacing with real lab equipment/external software?",
        ],
      },
      {
        title: "Users & operations",
        questions: [
          "Which roles need distinct access — Doctor, Nurse, Receptionist, Pharmacist, Lab Tech, Admin?",
          "Who schedules appointments — walk-in, staff-entered phone bookings, or patient self-booking?",
          "Multi-branch staff accounts needed if more than one location?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "Given the scale of this build, self-funded or does it need a formal proposal for investors/a board?",
          "Any hard deadline (a new facility opening)?",
          "Budget allowance for the security/compliance review real patient data usually needs?",
        ],
      },
    ],
  },
  {
    key: "Church Websites",
    category: "Institutional Platforms",
    tier: "Starter",
    recap:
      "Sermon archive & streaming, events calendar, online giving via Paystack, ministry & small-group pages, prayer request submission.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "Rough congregation size, and how many services/week to represent?",
          "Already livestreaming (YouTube, Facebook Live) that just needs embedding, or new?",
          "Main goal — visibility for visitors, giving convenience, or internal ministry coordination?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "How many past sermons to load at launch, and in what format?",
          "Branding already exists (logo, colors), or does that need building?",
          "How many ministries/small groups, and who maintains that content going forward?",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "Paystack account for giving already exists? Does giving need per-giver tracking for statements?",
          "Prayer requests — email a specific pastor/team, or just log to an admin panel?",
        ],
      },
      {
        title: "Users & operations",
        questions: [
          "Who updates the site after launch — one tech-comfortable person, or staff needing training?",
          "Recurring events (weekly service, monthly programs) or mostly one-off?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "Who's approving this — the pastor directly, a board/committee?",
          "Any target date (an anniversary, a relaunch event)?",
        ],
      },
    ],
  },

  // ---------- Commerce & Booking ----------
  {
    key: "Hotel Booking",
    category: "Commerce & Booking",
    tier: "Growth",
    recap:
      "Real-time availability calendar, deposit collection at booking, automated confirmation emails, room type & rate management, admin dashboard for reservations.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "How many rooms, and how many distinct room types/rate tiers?",
          "Current booking process — phone/WhatsApp, a listing site, walk-in only?",
          "Only booking channel, or does it need to stay in sync with Booking.com/Airbnb to avoid double-booking? — much bigger scope if yes.",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Photos/descriptions per room type ready, or need creating?",
          "Fixed rates, or seasonal/weekend pricing the system needs to reflect?",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "Deposit collection via Paystack/Flutterwave — what percentage does the hotel require?",
          "Staff need bookings visible on a phone, or is a desktop dashboard enough?",
          "Cancellation/refund policy — enforced automatically, or handled manually by staff?",
        ],
      },
      {
        title: "Users & operations",
        questions: [
          "Who manages reservations day-to-day — front desk, the owner directly?",
          "Need a housekeeping/room-status view (clean/dirty/occupied), or booking-only?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "Peak season timing — a date this must be live before?",
          "Losing bookings from no online presence, or upgrading a clunky existing system?",
        ],
      },
    ],
  },
  {
    key: "Restaurant Websites",
    category: "Commerce & Booking",
    tier: "Starter",
    recap:
      "Menu & pricing, table reservations, WhatsApp ordering integration, location & hours display, photo gallery.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "Dine-in only, or represent online ordering/delivery too?",
          "Existing menu — a PDF/printed menu to digitize, or written from scratch?",
          "Already taking orders informally on WhatsApp — does this just formalize/link that?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Food photography existing and usable, or does this need a shoot?",
          "Does pricing change often, and who updates the menu after launch?",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "Table reservations — real seat/table availability, or a request form staff confirms manually?",
          "WhatsApp orders to one number, or does staff need a shared inbox?",
        ],
      },
      {
        title: "Users & operations",
        questions: [
          "One location, or multiple branches to represent?",
          "Who owns updating hours/menu/photos after launch?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "What's prompting this now — no online presence, or moving on from Instagram/WhatsApp only?",
          "Any opening/relaunch date to hit?",
        ],
      },
    ],
  },
  {
    key: "Car Dealership Websites",
    category: "Commerce & Booking",
    tier: "Growth",
    recap:
      "Searchable/filterable inventory, per-vehicle lead capture, image galleries per listing, financing inquiry form, sold/available status tracking.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "Roughly how many vehicles in inventory, and how often does stock turn over?",
          "New, used/tokunbo, or both — changes how listings should filter (make/model/year/price/mileage)?",
          "Currently listing elsewhere (Jiji, Cars45, Instagram) that inventory needs to stay consistent with?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Photo process per vehicle already exists, or does upload need to be easy for staff per car?",
          "Specs/descriptions ready, or written per-listing at launch?",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "Where should lead inquiries land — email, WhatsApp, both?",
          "Financing form — just capturing interest for follow-up, or integrating an actual finance partner?",
          "Sold/available status — updated manually by staff in real time?",
        ],
      },
      {
        title: "Users & operations",
        questions: [
          "Who uploads new inventory — him directly, sales staff, one dedicated person?",
          "How many staff need admin access to add/edit/remove listings?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "Replacing a listing-only presence, or a previous website?",
          "Any seasonal sales push this needs to be ready for?",
        ],
      },
    ],
  },
  {
    key: "eCommerce",
    category: "Commerce & Booking",
    tier: "Growth",
    recap:
      "Product catalog & cart, checkout with Paystack/Flutterwave, order management, inventory & stock tracking, discount codes & promotions.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "Roughly how many products, at launch and expected within the first year?",
          "Variants (size, color) per product, or mostly single-SKU items?",
          "Physical, digital, or a mix of products?",
          "Existing store selling right now (Instagram, WhatsApp, another platform) needing migration?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Product photos/descriptions ready, or does that need to be built into scope?",
          "Logo/brand identity ready, or does that need building too?",
        ],
      },
      {
        title: "Payments & shipping",
        questions: [
          "Naira only, or also international/dollar payments?",
          "Ships nationwide, specific cities, or local pickup only?",
          "Fixed shipping rates, rate-by-location, or live courier rate integration?",
        ],
      },
      {
        title: "Store operations",
        questions: [
          "Discount codes/promotions needed at launch, or a later addition?",
          "Customer accounts (order history, saved addresses), or guest checkout is enough?",
          "Stock auto-decrement per sale, with low-stock alerts?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "Existing offline business going online, or a brand-new venture?",
          "Expected order volume in the first few months — affects which tier actually fits?",
          "Launch date targeted? Ongoing maintenance/SEO bundled, or website-only for now?",
        ],
      },
    ],
  },

  // ---------- Corporate & Brand ----------
  {
    key: "Business Websites",
    category: "Corporate & Brand",
    tier: "Starter",
    recap: "Up to 5 pages, mobile-responsive, contact form, basic on-page SEO, Google Business Profile setup.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "What are the 5 pages likely to be — has he thought through the structure yet?",
          "First website, or a replacement for an outdated one?",
          "Main goal — credibility, lead generation via the contact form, or just a presence to point people to?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Copy written for each page, or does that need drafting?",
          "Logo and brand colors exist already, or needed?",
          "Real photos of the business/team/work, or stock imagery for now?",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "Contact form submissions — email, WhatsApp, both?",
          "Google Business Profile already set up, or needed from scratch?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "What's driving this now — a specific opportunity, or general legitimacy?",
          "Domain — does he already own one?",
          "Will he ever edit content himself, or is this hand-off-and-static?",
        ],
      },
    ],
  },
  {
    key: "Corporate Websites",
    category: "Corporate & Brand",
    tier: "Growth",
    recap: "Larger page count, leadership/team structure, more design polish, careers/openings page, press & media section.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "Roughly how many pages/sections beyond the Business Websites baseline?",
          "Careers page needed because actively hiring, or just for long-term legitimacy?",
          "Any existing press/media coverage that needs a home on the site?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Leadership bios and photos ready, or need collecting?",
          "Existing brand guidelines to follow, or is visual direction open?",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "Careers applications — flow to an email, a form, a separate system?",
          "Any need for multi-language support given the corporate scale?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "Rebrand/relaunch, or the company's first real corporate site?",
          "Does the site need to read a certain way for investors/a board specifically?",
          "Who owns Press/Careers sections after launch?",
        ],
      },
    ],
  },
  {
    key: "Landing Pages",
    category: "Corporate & Brand",
    tier: "Starter",
    recap: "Single-purpose page, fast turnaround, built to convert one action, mobile-first layout, basic analytics.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "What's the one action this page needs to drive — signup, purchase, booking, download?",
          "Supporting a specific campaign (an ad push, a launch) with a deadline?",
          "Copy/messaging ready, or does that need developing?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Existing ad creative/messaging this needs to visually match?",
          "Hero image/video ready, or does that need sourcing?",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "Where does the conversion lead — external checkout, a form emailing him, a booking link?",
          "What does “basic analytics” need to tell him — visits only, or conversion tracking?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "What's the campaign timeline — is speed the main constraint?",
          "One-off, or the first of several landing pages built the same way?",
        ],
      },
    ],
  },
  {
    key: "Real Estate Platforms",
    category: "Corporate & Brand",
    tier: "Growth",
    recap: "Property listings, search & filter, inquiry capture per listing, agent contact per property, map-based location display.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "Roughly how many active listings at launch, and how often does inventory change?",
          "Individual agent, a small agency with multiple agents, or a developer showcasing projects?",
          "For sale, for rent, or both — does the site need to distinguish?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Photo/description process per property already exists?",
          "Exact addresses/coordinates for the map, or just neighborhood-level?",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "Inquiries — one shared inbox, or routed to the specific agent per listing?",
          "Any need to sync with an existing listing source (spreadsheet, another platform)?",
        ],
      },
      {
        title: "Users & operations",
        questions: [
          "Who uploads new listings — him directly, or multiple agents managing their own?",
          "How many agent profiles needed at launch?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "Replacing reliance on Property24/Jiji-type platforms, or complementary to them?",
          "Any development/launch this needs to coincide with?",
        ],
      },
    ],
  },

  // ---------- Product Engineering ----------
  {
    key: "Custom Web Applications",
    category: "Product Engineering",
    tier: "Institutional",
    recap: "Role-based accounts & permissions, custom database design, admin dashboard, secure auth & file storage, third-party API integrations.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "Walk through the real workflow this replaces — manual process, spreadsheets, disconnected tools?",
          "Who are the distinct user types, and what does each need to be able to do?",
          "An existing system (even a bad one) to reference, or designing from a blank page?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Existing data that needs migrating (records, a spreadsheet, an old database)?",
          "Real example scenarios/edge cases he can walk through, so scope isn't discovered mid-build?",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "What third-party services must this talk to — payments, SMS, another company's API? Get a real list.",
          "Any specific security/compliance requirement given the data involved?",
          "Expected user volume/concurrency — ten people daily, or hundreds?",
        ],
      },
      {
        title: "Users & operations",
        questions: [
          "Who's the actual admin/owner of this system day-to-day once live?",
          "Need for audit logs/activity history for accountability?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "Given this is the highest-complexity package, internally funded, investor-backed, or needs a formal scoping doc first?",
          "Realistic timeline — has he been given an unrealistic deadline by someone else?",
          "Fixed one-time build, or ongoing feature development expected after launch?",
        ],
      },
    ],
  },
  {
    key: "UI/UX Design",
    category: "Product Engineering",
    tier: "Starter",
    recap: "Design-only engagement, for clients with their own developer, wireframes & high-fidelity mockups, reusable component/design system, handoff files.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "Confirm he has his own developer/dev team lined up — no code is delivered in this package.",
          "New product from scratch, or a redesign of something existing?",
          "How many distinct screens/pages does he expect?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Existing brand guidelines to design within, or is that part of this scope too?",
          "Content/copy for each screen ready, or use placeholder text?",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "What format does his developer expect handoff in (Figma files, exported assets)?",
          "Existing component library/design system to extend, or building from scratch?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "What's his developer's timeline — design must be ready before they start building?",
          "One-time engagement, or ongoing design support as the product grows?",
        ],
      },
    ],
  },
  {
    key: "Website Redesign",
    category: "Product Engineering",
    tier: "Growth",
    recap: "Rebuild of an existing site, content & structure carried over, modernized visual design, performance & mobile improvements, SEO preserved.",
    groups: [
      {
        title: "Scope & core need",
        questions: [
          "What's actually wrong with the current site — outdated look, slow, hard to update, not mobile-friendly?",
          "Get the current site link — is all existing content staying, or is this a chance to restructure/cut pages?",
          "Anything on the current site working well that should be kept as-is?",
        ],
      },
      {
        title: "Content & assets",
        questions: [
          "Access to the current site's content/admin, or does content need re-extracting from live pages?",
          "Brand evolution alongside this (new logo/colors), or keeping the current identity?",
        ],
      },
      {
        title: "Technical & integrations",
        questions: [
          "Does he know which pages/keywords currently bring traffic, so those specifically don't break in the move?",
          "Existing integrations (email signup, booking, payments) that need to carry over without disruption?",
        ],
      },
      {
        title: "Business context",
        questions: [
          "What prompted this now — a specific complaint, a rebrand, or general upkeep?",
          "Any traffic/business currently being lost because of the old site's problems, to quantify urgency?",
        ],
      },
    ],
  },
];

export function getScopingPackage(key: string): ScopingPackage | undefined {
  return scopingBookPackages.find((p) => p.key === key);
}
