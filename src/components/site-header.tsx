"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { siteContent } from "@/lib/content";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoTripleTap } from "@/components/logo-triple-tap";
import { useLanguage } from "@/lib/i18n/language-context";
import { Menu, X } from "lucide-react";

const navKeyByHref: Record<string, string> = {
  "/portfolio": "nav_work",
  "/services": "nav_services",
  "/about": "nav_about",
  "/pricing": "nav_pricing",
  "/blog": "nav_blog",
  "/contact": "nav_contact",
};

export function SiteHeader() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const dashboardHref =
    session?.user.role === "ADMIN" || session?.user.role === "STAFF" ? "/admin" : "/dashboard";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <LogoTripleTap brand={siteContent.brand} />

        <nav className="hidden items-center gap-8 md:flex">
          {siteContent.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[var(--color-slate)] transition hover:text-[var(--color-brass)]"
            >
              {navKeyByHref[item.href] ? t(navKeyByHref[item.href]) : item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href={session ? dashboardHref : "/login"}
            className="hidden text-sm font-bold tracking-tight text-[var(--color-paper)] transition hover:text-[var(--color-brass)] sm:inline-block"
          >
            {session ? t("dashboard") : t("sign_in")}
          </Link>
          <ThemeToggle />
          <Link
            href="/booking"
            className="hidden rounded-full bg-[var(--color-brass)] px-5 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 md:inline-block"
          >
            {t("book_a_call")}
          </Link>
          <button
            className="p-1 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="glass flex flex-col gap-1 px-6 pb-6 md:hidden">
          {siteContent.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 text-sm text-[var(--color-slate)]"
              onClick={() => setOpen(false)}
            >
              {navKeyByHref[item.href] ? t(navKeyByHref[item.href]) : item.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="mt-2 rounded-full bg-[var(--color-brass)] px-5 py-2 text-center text-sm font-medium text-[var(--color-ink)]"
            onClick={() => setOpen(false)}
          >
            {t("book_a_call")}
          </Link>
        </nav>
      )}
    </header>
  );
}
