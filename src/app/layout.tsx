import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { GoogleAnalytics } from "@/components/google-analytics";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { PageViewTracker } from "@/components/page-view-tracker";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { InstallPromptModal } from "@/components/install-prompt-modal";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { OrganizationJsonLd } from "@/components/organization-json-ld";
import { getSiteUrl } from "@/lib/env";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
});

export const metadata: Metadata = {
  title: {
    default: "NOBS AGENT, Digital Infrastructure for Growing Institutions",
    template: "%s | NOBS AGENT",
  },
  description:
    "A full-stack software engineer building websites, platforms, and systems for schools, hospitals, hotels, dealerships, churches, and ambitious businesses across Africa.",
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NOBS AGENT",
    description:
      "Digital infrastructure for growing institutions, built to global standard.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NOBS AGENT" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    title: "NOBS AGENT",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e4b343",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jbmono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <SkipLink />
        <OrganizationJsonLd />
        <GoogleAnalytics />
        <ServiceWorkerRegister />
        <PageViewTracker />
        <AuthSessionProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <ThemeProvider>
                <AnnouncementBanner />
                <SiteHeader />
                <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
                  {children}
                </main>
                <SiteFooter />
                <WhatsAppButton />
                <CookieConsentBanner />
                <InstallPromptModal />
              </ThemeProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
