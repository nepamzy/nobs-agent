"use client";

import { ContactForm } from "@/components/contact-form";
import { AuthGate } from "@/components/auth-gate";
import { Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function ContactContent() {
  const { t } = useLanguage();
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@nobsagent.com";
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "Set NEXT_PUBLIC_CONTACT_PHONE in .env";

  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        {t("nav_contact")}
      </p>
      <h1 className="max-w-xl font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        {t("contact_title")}
      </h1>

      <div className="mt-16 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 text-[var(--color-brass)]" />
              <div>
                <p className="text-sm font-medium">{t("contact_email_label")}</p>
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
                <p className="text-sm font-medium">{t("contact_phone_label")}</p>
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
                <p className="text-sm font-medium">{t("contact_based_label")}</p>
                <p className="text-sm text-[var(--color-slate)]">{t("contact_based_value")}</p>
              </div>
            </div>
          </div>
          <p className="mt-10 text-sm text-[var(--color-slate)]">
            {t("contact_prefer_call")}{" "}
            <a href="/booking" className="text-[var(--color-brass)] underline underline-offset-4">
              {t("contact_booking_link")}
            </a>{" "}
            {t("contact_pick_time")}
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
