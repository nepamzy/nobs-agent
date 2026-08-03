import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { AuthGate } from "@/components/auth-gate";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with NOBS AGENT to discuss a project.",
};

export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@nobsagent.com";
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "Set NEXT_PUBLIC_CONTACT_PHONE in .env";

  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Contact
      </p>
      <h1 className="max-w-xl font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        Let&apos;s talk about what you&apos;re building.
      </h1>

      <div className="mt-16 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 text-[var(--color-brass)]" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
                >
                  {email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={18} className="mt-0.5 text-[var(--color-brass)]" />
              <div>
                <p className="text-sm font-medium">Phone / WhatsApp</p>
                <a
                  href={`tel:${phone}`}
                  className="text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
                >
                  {phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 text-[var(--color-brass)]" />
              <div>
                <p className="text-sm font-medium">Based in</p>
                <p className="text-sm text-[var(--color-slate)]">Kaduna, Nigeria, remote-first</p>
              </div>
            </div>
          </div>
          <p className="mt-10 text-sm text-[var(--color-slate)]">
            Prefer a structured conversation? Use{" "}
            <a href="/booking" className="text-[var(--color-brass)] underline underline-offset-4">
              the booking page
            </a>{" "}
            to pick a time directly.
          </p>
        </div>

        <div className="lg:col-span-3">
          <AuthGate>
            <ContactForm />
          </AuthGate>
        </div>
      </div>
    </div>
  );
}
