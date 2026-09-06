// AI Automation is a new service line, scoped per client rather than
// priced off a fixed card like the rest of /pricing — no standardPrice/
// launchPrice fields here on purpose. Kept as its own file/shape rather
// than forced into PricingCategoryItem so a real number can be added
// later without fighting a type built for the launch-price display.

export type AiAutomationTier = {
  id: string;
  name: string;
  audience: string;
  summary: string;
  inclusions: string[];
};

export const aiAutomationTiers: AiAutomationTier[] = [
  {
    id: "starter-ai",
    name: "Starter AI",
    audience: "Small businesses & solo operators",
    summary:
      "One clear automation, done properly — a support chat, a booking assistant, or a lead-qualifier trained on your own content, not a generic bot.",
    inclusions: [
      "Discovery call to scope exactly one core use case: customer support, booking assistance, lead qualification, or review/reputation management",
      "Custom-trained on your own FAQs, docs, menu, or policies — never a generic off-the-shelf script",
      "Deployed on your website plus one messaging channel (WhatsApp or Instagram DM)",
      "Branded chat widget matched to your site's actual look, not a default template",
      "Human handoff built in — flags anything it can't answer confidently and routes it straight to you",
      "Conversation logging so you can see exactly what customers are asking, in plain view",
      "One full round of tone and response refinement after real customer conversations come in",
      "A short setup walkthrough call for you or your staff, plus a written quick-start guide",
      "30 days of post-launch adjustments included at no extra cost",
      "Monthly usage and uptime report",
    ],
  },
  {
    id: "growth-ai",
    name: "Growth AI",
    audience: "Medium businesses, multi-location or multi-department",
    summary:
      "AI woven into how you actually operate — connected to the tools you already run, not just a chat widget bolted onto the homepage.",
    inclusions: [
      "Everything in Starter AI, extended across multiple locations or departments",
      "Integration with your existing CRM, booking system, inventory, or scheduling tools — so the AI can take real action, not just answer questions",
      "Multi-channel deployment (website, WhatsApp, email, and/or SMS) unified into one AI-assisted inbox with human takeover at any point",
      "An internal \"ask our docs\" assistant for staff, trained on your SOPs, policies, or product/service information to cut onboarding time",
      "Document processing automation — structured data extracted automatically from intake forms, applications, or receipts",
      "No-show and re-engagement automation — predictive reminders and follow-up sequences for bookings or appointments",
      "Custom conversation flows built around your specific process (multi-step booking, financing/insurance qualification, appointment triage, etc.)",
      "An analytics dashboard showing automation volume, resolution rate, and exactly where the AI hands off to a human",
      "A staff training session on reviewing and correcting the AI's behavior over time",
      "60 days of post-launch tuning plus one scheduled review call",
      "Priority support through setup and the first month live",
    ],
  },
  {
    id: "enterprise-ai",
    name: "Enterprise AI",
    audience: "Institutions & company-size organizations",
    summary:
      "Built to the same security and compliance standard as the rest of your platform — for hospitals, multi-branch dealerships, and institutions with real data-governance requirements.",
    inclusions: [
      "Everything in Growth AI, scoped across your full organization",
      "A custom retrieval-augmented (RAG) system built over your own proprietary data — policy manuals, medical protocols, engineering docs, case files — with source citations on every answer",
      "Role-based access control and full audit logging on every AI interaction, matching the security standard the rest of your platform is already held to",
      "Tool-using AI agents that operate your internal systems directly — creating bookings, updating records, sending notifications — not just answering questions",
      "Automatic multi-language support, matching each customer's or staff member's own language",
      "Fraud and anomaly detection tuned to your transaction or claims data, where applicable",
      "A plain-English analytics copilot answering questions directly from your existing dashboards and reports",
      "A dedicated data pipeline keeping the AI's knowledge current as your internal documents change",
      "A formal security review and data-handling agreement completed before go-live",
      "A phased rollout — a pilot department or branch first, then full deployment once it's proven",
      "A dedicated point of contact throughout the build and a defined post-launch support window",
      "Ongoing model and integration maintenance available as a retainer after launch",
    ],
  },
];
