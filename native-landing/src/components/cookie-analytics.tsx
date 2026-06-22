"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_EVENT,
  readCookiePreferences,
  type CookiePreferences,
} from "@/lib/cookie-consent";

function loadAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId || typeof window === "undefined") return;

  if (document.getElementById("postwick-ga-script")) return;

  const script = document.createElement("script");
  script.id = "postwick-ga-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", gaId, { anonymize_ip: true });
}

function unloadAnalytics() {
  const script = document.getElementById("postwick-ga-script");
  script?.remove();
  delete window.gtag;
  delete window.dataLayer;
}

function applyAnalyticsConsent(preferences: CookiePreferences | null) {
  if (preferences?.analytics) {
    loadAnalytics();
  } else {
    unloadAnalytics();
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function CookieAnalytics() {
  useEffect(() => {
    applyAnalyticsConsent(readCookiePreferences());

    const onConsentChange = (event: Event) => {
      const custom = event as CustomEvent<CookiePreferences>;
      applyAnalyticsConsent(custom.detail);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, []);

  return null;
}
