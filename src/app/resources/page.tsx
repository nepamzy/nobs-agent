import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { BookOpen, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Resources",
  description: "Guides and downloads for institutions planning a digital project.",
};

const resources = [
  {
    title: "The agency, in full",
    desc: "Who I am, what I build, and how projects run, the same information a company profile would cover, always current.",
    action: "Read the agency profile",
    icon: BookOpen,
    href: "/about",
  },
  {
    title: "How to brief a developer so you actually get what you need",
    desc: "The questions worth answering before you contact anyone, including me, so the first conversation is useful.",
    action: "Read the guide",
    icon: ArrowUpRight,
    href: "/blog/how-to-brief-a-developer-properly",
  },
  {
    title: "Scoping a school portal: what to decide before you brief a developer",
    desc: "The questions that determine cost and timeline before a single wireframe exists.",
    action: "Read the guide",
    icon: ArrowUpRight,
    href: "/blog/why-school-portals-fail-in-year-two",
  },
  {
    title: "Choosing between Paystack, Flutterwave, and Stripe",
    desc: "A practical breakdown of fees, payout speed, and currency support for African and international clients.",
    action: "Read the guide",
    icon: ArrowUpRight,
    href: "/blog/paystack-vs-flutterwave-vs-stripe",
  },
  {
    title: "The real cost of a cheap website",
    desc: "What a low quote usually leaves out, and what that ends up costing later.",
    action: "Read the guide",
    icon: ArrowUpRight,
    href: "/blog/the-real-cost-of-a-cheap-website",
  },
  {
    title: "Why your business needs a WhatsApp button, not just a contact form",
    desc: "Where inquiries actually get answered versus where they go to die.",
    action: "Read the guide",
    icon: ArrowUpRight,
    href: "/blog/why-you-need-a-whatsapp-button-not-just-a-contact-form",
  },
];

export default function ResourcesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="Useful before you brief anyone, including me"
      />
      <div className="mx-auto max-w-3xl px-6 pb-24">
        <div className="mt-8 space-y-4">
          {resources.map((r) => (
            <Link
              key={r.title}
              href={r.href}
              className="glass group flex items-center justify-between gap-6 rounded-2xl p-6 transition hover:border-[var(--color-brass)]/50"
            >
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
                  {r.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-slate)]">{r.desc}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-sm text-[var(--color-brass)]">
                {r.action}
                <r.icon size={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
