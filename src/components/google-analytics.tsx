"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { readConsent } from "@/lib/consent";

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsented(readConsent() === "granted");

    function handleConsentChange() {
      setConsented(readConsent() === "granted");
    }
    window.addEventListener("nobs-consent-changed", handleConsentChange);
    return () => window.removeEventListener("nobs-consent-changed", handleConsentChange);
  }, []);

  // Two independent gates, both must be true: the studio has actually
  // configured GA (the key exists), and the visitor has actually
  // consented, not just "the key exists" like before.
  if (!measurementId || !consented) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
