// Single source of truth for the booking Terms and Conditions text — used
// by the public /terms page, the checkbox panel shown under every booking
// form (public booking form + dashboard "new project" form), and referenced
// (not duplicated) by the short-form Client Service Agreement PDF.
//
// This is the FULL legal text a client ticks "I agree" to before a booking
// can be submitted. It is deliberately generic (no client-specific blanks)
// since it governs every booking the same way — the price and scope for a
// given project live on that booking's own Client Service Agreement, not
// here.

export type TermsSection = {
  number: string;
  title: string;
  paragraphs: string[];
};

export const TERMS_VERSION_DATE = "10 September 2026";

export const TERMS_INTRO = [
  'These Terms and Conditions ("Terms") govern every project booked with NOBS AGENT ("the Studio", "we", "us") through nobs-agent.site.',
  'By ticking "I agree" and confirming a booking, the person or business booking ("the Client", "you") accepts these Terms in full, and they become a binding agreement between the Client and NOBS AGENT for that booking.',
];

export const TERMS_SECTIONS: TermsSection[] = [
  {
    number: "1",
    title: "Scope of Work",
    paragraphs: [
      "The specific service package, budget range, and project notes you select or enter at booking define the scope of your engagement. A typical engagement includes custom design built for your brand, core pages appropriate to your package, a booking or inquiry system with real notifications, full mobile responsiveness, basic on-page SEO, deployment to production, and a training walkthrough. Work outside the agreed scope is treated as a Change Request under Clause 4.",
    ],
  },
  {
    number: "2",
    title: "Timeline",
    paragraphs: [
      "Projects typically take 2–4 weeks from commencement, depending on scope; larger systems may take longer. Delays caused by you — late content, delayed feedback, unavailability — extend the delivery date accordingly and are not a breach by the Studio.",
    ],
  },
  {
    number: "3",
    title: "Fees and Payment",
    paragraphs: [
      "Your total project fee is shown at booking confirmation and confirmed before development begins. Payment is due in three instalments: 45% at project commencement, 35% on completion of development, and 20% at final delivery. Development does not begin until the deposit is confirmed received. All fees are in Nigerian Naira (₦) unless otherwise agreed in writing. You are responsible for your own domain and hosting costs unless otherwise agreed.",
    ],
  },
  {
    number: "4",
    title: "Revisions and Change Requests",
    paragraphs: [
      "Two rounds of revisions to the agreed design/scope are included in your fee. A “round” means one consolidated set of feedback submitted at one time. Additional rounds, or any request outside the original scope, are quoted and billed separately and require your written approval before work begins.",
    ],
  },
  {
    number: "5",
    title: "Deliverables",
    paragraphs: [
      "On completion and final payment you receive a fully built, live, deployed website or system; source code and full ownership per Clause 6; mobile-responsive design verified across real devices; basic SEO setup; and a training walkthrough. Thirty (30) days of post-launch bug fixing are included from the date of final delivery, covering defects in what was delivered — not new features, content changes, or issues caused by third-party changes outside our control.",
    ],
  },
  {
    number: "6",
    title: "Intellectual Property Ownership",
    paragraphs: [
      "Full ownership of the source code and deliverables built specifically for you transfers to you only upon receipt of the final payment in full. Before that, all work product remains the property of NOBS AGENT. We retain the right to reuse general-purpose code, components, and know-how that are not specific to your confidential business information. You may optionally display a small “Built by NOBS AGENT” credit linked to nobs-agent.site in your site’s footer — this is never mandatory and may be removed at any time.",
    ],
  },
  {
    number: "7",
    title: "Your Responsibilities",
    paragraphs: [
      "You agree to provide timely access to content (text, images, logos, credentials), feedback, and approvals needed to keep the project on schedule, and you warrant that any materials you supply do not infringe a third party's rights.",
    ],
  },
  {
    number: "8",
    title: "Ongoing Maintenance",
    paragraphs: [
      "Website maintenance, SEO, hosting management, and similar ongoing services are optional and outside this agreement, billed separately month-to-month if you choose to engage us for them.",
    ],
  },
  {
    number: "9",
    title: "Confidentiality",
    paragraphs: [
      "Each party keeps confidential any non-public business, technical, or financial information disclosed by the other in connection with the project, and this survives completion of the project.",
    ],
  },
  {
    number: "10",
    title: "Warranties and Disclaimer",
    paragraphs: [
      "We warrant the project will be built to function as described in the agreed scope and tested before delivery. Beyond that, the project is provided “as is”, without warranties of uninterrupted availability or compatibility with third-party changes occurring after delivery and the 30-day period in Clause 5.",
    ],
  },
  {
    number: "11",
    title: "Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, our total liability under this agreement is capped at the total fee you actually paid. Neither party is liable to the other for indirect or consequential loss.",
    ],
  },
  {
    number: "12",
    title: "Cancellation",
    paragraphs: [
      "If you cancel after work has commenced, the deposit and any further instalments paid for work already completed are non-refundable and forfeited in respect of work delivered to that point; we will deliver whatever work product exists as at that date once fees due for completed work are settled. If we are unable to complete the project for reasons within our control, any amount paid for undelivered work is refunded.",
    ],
  },
  {
    number: "13",
    title: "Force Majeure",
    paragraphs: [
      "Neither party is liable for delay caused by circumstances beyond its reasonable control (internet/power outages, acts of government, and similar events); the affected party will notify the other promptly and the timeline will be adjusted.",
    ],
  },
  {
    number: "14",
    title: "Relationship of the Parties",
    paragraphs: [
      "NOBS AGENT acts as an independent contractor. Nothing here creates a partnership, joint venture, agency, or employment relationship.",
    ],
  },
  {
    number: "15",
    title: "Governing Law and Disputes",
    paragraphs: [
      "These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes are first attempted to be resolved through good-faith negotiation; if unresolved within 30 days, referred to mediation, and thereafter arbitration under the Arbitration and Conciliation Act (or its successor legislation), seated in Nigeria.",
    ],
  },
  {
    number: "16",
    title: "Changes to These Terms",
    paragraphs: [
      "We may update these Terms from time to time; the version in force at the time you confirm a booking is the version that applies to that booking. Material changes will be reflected in the version date below.",
    ],
  },
  {
    number: "17",
    title: "Acceptance",
    paragraphs: [
      "By ticking “I agree to the Terms and Conditions” and confirming your booking on nobs-agent.site, you confirm you have read and accept these Terms in full for that booking. A booking cannot be submitted without this acceptance, and your acceptance — together with its date and time — is recorded against your booking.",
    ],
  },
];
