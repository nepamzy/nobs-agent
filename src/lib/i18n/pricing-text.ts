import { useLanguage } from "@/lib/i18n/language-context";
import type { LanguageCode } from "@/lib/i18n/translations";
import { pricingFr } from "@/lib/i18n/pricing/fr";
import { pricingEs } from "@/lib/i18n/pricing/es";
import { pricingPt } from "@/lib/i18n/pricing/pt";
import { pricingAr } from "@/lib/i18n/pricing/ar";
import { pricingZh } from "@/lib/i18n/pricing/zh";

// Hand translations for the package catalog shown on /pricing and
// /services (package names, bullets, AI tiers, page copy). Keyed by the
// exact English text in src/lib/data/pricing-detailed.ts and
// ai-automation-pricing.ts, so those files stay the single source of the
// English copy. Edit an English string there and the old translation stops
// matching: the page then shows English for it until the language files
// are updated (scripts/check-pricing-translations.ts lists any gaps).
export const pricingTranslations: Record<Exclude<LanguageCode, "en">, Record<string, string>> = {
  fr: pricingFr,
  es: pricingEs,
  pt: pricingPt,
  ar: pricingAr,
  zh: pricingZh,
};

export function translatePricing(text: string, language: LanguageCode): string {
  if (language === "en") return text;
  return pricingTranslations[language][text] ?? text;
}

export function usePricingText(): (text: string) => string {
  const { language } = useLanguage();
  return (text) => translatePricing(text, language);
}
