import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How NOBS AGENT collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Legal
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-[var(--color-slate)]">Last updated: July 9, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-[var(--color-slate)]">
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
            1. Information we collect
          </h2>
          <p>
            When you contact us, request a booking, or use the client portal, we collect
            information you provide directly: your name, email address, phone number,
            organization, and any project details you share. If you make a payment, our
            payment providers (Paystack or Flutterwave) process your payment details
            directly, we never store full card numbers on our own servers.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
            2. How we use it
          </h2>
          <p>
            We use the information you provide to respond to inquiries, deliver
            contracted work, process payments, send project updates, and, where you&apos;ve
            opted in, send occasional updates about our services. We do not sell your
            information to third parties.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
            3. Data storage & security
          </h2>
          <p>
            Data is stored in a PostgreSQL database with encrypted connections, access
            restricted by role, and regular backups. Uploaded files are stored via
            Cloudinary or Supabase Storage under access-controlled buckets.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
            4. Your rights
          </h2>
          <p>
            You can request a copy of the data we hold about you, ask us to correct it,
            or ask us to delete it, subject to any records we&apos;re required to keep for
            invoicing or legal purposes. Contact us at the address below to make a
            request.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
            5. Cookies
          </h2>
          <p>
            We use a small number of strictly necessary cookies to keep you signed in
            and remember basic preferences (like your chosen language or theme), these
            don&apos;t require consent since the site can&apos;t function properly without them.
            With your permission, given through the cookie banner shown on your first
            visit, we also use Google Analytics to understand anonymized traffic
            patterns, page views, general location, device type, nothing that
            identifies you personally. You can change your choice at any time by
            clearing your cookies and revisiting the site.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
            6. Contact
          </h2>
          <p>Questions about this policy can be sent to nobsagent0@gmail.com.</p>
        </section>
      </div>
    </div>
  );
}
