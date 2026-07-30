import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { FaqAccordion } from "@/components/faq-accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about working with NOBS AGENT.",
};

const faqs = [
  {
    q: "How long does a typical project take?",
    a: "Most business websites take 1-2 weeks from kickoff to launch. Institutional platforms with custom portals typically run 2-3 weeks. You'll get a specific timeline in your proposal, not a range, and it can shift depending on the changes you end up wanting along the way, either of us can suggest adjustments if scope changes mid-project.",
  },
  {
    q: "Do I own the website once it's built?",
    a: "Yes. Once your project is paid in full, you own the code, content, and design outright. There's no vendor lock-in, you can take the codebase to another developer at any time.",
  },
  {
    q: "Can I update the content myself after launch?",
    a: "On Growth and Institutional plans, yes, you get an admin dashboard for editing text, images, and pricing without touching code. On the Starter plan, content updates are handled by request.",
  },
  {
    q: "What payment providers do you support?",
    a: "Paystack and Flutterwave for local and pan-African payments, and Stripe for international cards. Most projects launch with one primary provider and add others as needed.",
  },
  {
    q: "Do you offer ongoing maintenance after launch?",
    a: "Every plan includes a post-launch support window (30-180 days depending on plan). After that, maintenance is available on a monthly retainer or per-request basis.",
  },
  {
    q: "What if I need something that isn't listed under Services?",
    a: "Most custom requests fit somewhere in Product Engineering. Book a consultation and describe what you need, if it's outside what I build, I'll tell you directly rather than take on the wrong project.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <PageHeader
        eyebrow="FAQ"
        title="Questions worth answering upfront"
        description="If something isn't covered here, it's one message away."
      />
      <div className="mx-auto max-w-2xl px-6 pb-24">
        <FaqAccordion items={faqs} />
      </div>
    </div>
  );
}
