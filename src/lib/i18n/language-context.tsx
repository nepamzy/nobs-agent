"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { languages, translations, type LanguageCode } from "./translations";

const COOKIE_NAME = "nobs_lang";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function isValidLanguage(value: string | null): value is LanguageCode {
  return languages.some((l) => l.code === value);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // Read the saved preference once on mount, this only runs client-side,
  // so the very first server-rendered paint is always English, then it
  // swaps if a saved preference exists. Interface strings only, per
  // scope, so this brief flash is a non-issue for the deeper page content.
  useEffect(() => {
    const saved = readCookie(COOKIE_NAME);
    if (isValidLanguage(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    const meta = languages.find((l) => l.code === language);
    document.documentElement.dir = meta?.dir ?? "ltr";
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(code: LanguageCode) {
    setLanguageState(code);
    document.cookie = `${COOKIE_NAME}=${code}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }

  function t(key: string): string {
    return translations[language]?.[key] ?? translations.en[key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
