import { cookies } from "next/headers";
import type { LanguageCode } from "@/lib/i18n/translations";

// MyMemory is free, requires no API key, and is genuinely reasonable for
// this use case, real-time translation of admin-authored content
// (blog posts, portfolio write-ups) rather than the fixed interface
// strings, which are hand-translated separately for quality and control.
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

const MYMEMORY_LANG_MAP: Record<LanguageCode, string> = {
  en: "en", fr: "fr", es: "es", pt: "pt", ar: "ar", zh: "zh-CN",
};

// In-memory cache, resets on redeploy, this is intentionally simple: the
// goal is avoiding repeat calls for the same text within a single
// server's uptime, not a durable translation store. Content that's
// translated often enough to matter is a good candidate for a real
// per-language database field later, this is the pragmatic version for
// now, not the final one.
const cache = new Map<string, string>();

async function translateOne(text: string, target: string): Promise<string> {
  if (!text.trim()) return text;
  const cacheKey = `${target}:${text}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=en|${target}`;
    const res = await fetch(url, { next: { revalidate: 604800 } }); // cache 7 days
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (typeof translated !== "string" || !translated) return text;
    cache.set(cacheKey, translated);
    return translated;
  } catch (err) {
    console.error("[translate-content] live translation failed, showing original", err);
    return text;
  }
}

// Reads the visitor's saved language preference server-side (the same
// cookie the client-side switcher writes), so dynamic content can be
// translated before the page ever renders, not swapped in after the
// fact.
export async function getServerLanguage(): Promise<LanguageCode> {
  const store = await cookies();
  const saved = store.get("nobs_lang")?.value;
  const valid: LanguageCode[] = ["en", "fr", "es", "pt", "ar", "zh"];
  return valid.includes(saved as LanguageCode) ? (saved as LanguageCode) : "en";
}

// Translates a set of named fields together, English is returned as-is
// with no network call, since it's already the source language.
export async function translateFields<T extends Record<string, string>>(
  fields: T,
  language: LanguageCode
): Promise<T> {
  if (language === "en") return fields;
  const target = MYMEMORY_LANG_MAP[language];

  const entries = await Promise.all(
    Object.entries(fields).map(async ([key, value]) => [key, await translateOne(value, target)])
  );

  return Object.fromEntries(entries) as T;
}

// For array content like a blog post's paragraphs, where each entry
// needs translating independently but the array order and length must
// stay exactly the same.
export async function translateList(items: string[], language: LanguageCode): Promise<string[]> {
  if (language === "en") return items;
  const target = MYMEMORY_LANG_MAP[language];
  return Promise.all(items.map((item) => translateOne(item, target)));
}
