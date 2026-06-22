"use client";

import { useCookieConsent } from "@/components/cookie-consent-provider";

export function CookieSettingsTrigger({
  className = "hover:text-near-black",
}: {
  className?: string;
}) {
  const { openPreferences } = useCookieConsent();

  return (
    <button type="button" onClick={openPreferences} className={className}>
      Cookie settings
    </button>
  );
}
