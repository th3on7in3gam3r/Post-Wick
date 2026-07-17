"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_EVENT,
  readCookiePreferences,
  type CookiePreferences,
} from "@/lib/cookie-consent";

const PULSE_SCRIPT_ID = "kerygma-pulse-script";
const PULSE_SRC = "https://pulse-5o1m.onrender.com/pulse.js?v=2026-07-17";
const PULSE_SITE = "kerygmasocial-com";

function loadPulse() {
  if (typeof window === "undefined") return;
  if (document.getElementById(PULSE_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = PULSE_SCRIPT_ID;
  script.src = PULSE_SRC;
  script.async = true;
  script.defer = true;
  script.dataset.site = PULSE_SITE;
  document.body.appendChild(script);
}

function unloadPulse() {
  document.getElementById(PULSE_SCRIPT_ID)?.remove();
  try {
    delete (window as Window & { Pulse?: unknown }).Pulse;
  } catch {
    // ignore
  }
}

function applyPulseConsent(preferences: CookiePreferences | null) {
  if (preferences?.analytics) {
    loadPulse();
  } else {
    unloadPulse();
  }
}

export function PulseAnalytics() {
  useEffect(() => {
    applyPulseConsent(readCookiePreferences());

    const onConsentChange = (event: Event) => {
      const custom = event as CustomEvent<CookiePreferences>;
      applyPulseConsent(custom.detail);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
  }, []);

  return null;
}
