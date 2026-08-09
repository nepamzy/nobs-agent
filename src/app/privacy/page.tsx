import type { Metadata } from "next";
import { getServerLanguage, translateList } from "@/lib/translate-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How NOBS AGENT collects, uses, and protects your information.",
};

const sections = [
  {
    heading: "1. Information we collect",
    body: "When you contact us, request a booking, or use the client portal, we collect information you provide directly: your name, email address, phone number, organization, and any project details you share. If you make a payment, our payment providers (Paystack or Flutterwave) process your payment details directly, we never store full card numbers on our own servers.",
  },
  {
    heading: "2. How we use it",
    body: "We use the information you provide to respond to inquiries, deliver contracted work, process payments, send project updates, and, where you've opted in, send occasional updates about our services. We do not sell your information to third parties.",
  },
  {
    heading: "3. Data storage & security",
    body: "Data is stored in a PostgreSQL database with encrypted connections, access restricted by role, and regular backups. Uploaded files are stored via Cloudinary or Supabase Storage under access-controlled buckets.",
  },
  {
    heading: "4. Your rights",
    body: "You can request a copy of the data we hold about you, ask us to correct it, or ask us to delete it, subject to any records we're required to keep for invoicing or legal purposes. Contact us at the address below to make a request.",
  },
  {
    heading: "5. Cookies",
    body: "We use a small number of strictly necessary cookies to keep you signed in and remember basic preferences (like your chosen language or theme), these don't require consent since the site can't function properly without them. With your permission, given through the cookie banner shown on your first visit, we also use Google Analytics to understand anonymized traffic patterns, page views, general location, device type, nothing that identifies you personally. You can change your choice at any time by clearing your cookies and revisiting the site.",
  },
  {
    heading: "6. Contact",
    body: "Questions about this policy can be sent to nobsagent0@gmail.com.",
  },
];

// Legal content is deliberately live-translated rather than hand-written
// per language, this is dense text with real legal weight, and a quick
// hand translation carries more risk of a subtle but meaningful
// inaccuracy than anywhere else on the site. The live-translation
// mechanism already used for blog and portfolio content is the more
// honest choice here, not a shortcut.
export default async function PrivacyPage() {
  const language = await getServerLanguage();
  const headings = await translateList(sections.map((s) => s.heading), language);
  const bodies = await translateList(sections.map((s) => s.body), language);
  const legalLabel = (await translateList(["Legal"], language))[0];
  const title = (await translateList(["Privacy Policy"], language))[0];
  const lastUpdated = (await translateList(["Last updated: July 9, 2026"], language))[0];

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        {legalLabel}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-[var(--color-slate)]">{lastUpdated}</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-[var(--color-slate)]">
        {sections.map((_, i) => (
          <section key={i}>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
              {headings[i]}
            </h2>
            <p>{bodies[i]}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
