export const COOKIE_CONSENT_KEY = "postwick-cookie-preferences";
export const LEGACY_CONSENT_KEY = "postwick-cookie-consent";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_EVENT = "postwick-cookie-consent-change";

export type CookieCategory = "essential" | "analytics" | "marketing";

export type CookiePreferences = {
  version: typeof COOKIE_CONSENT_VERSION;
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export const defaultCookiePreferences = (): CookiePreferences => ({
  version: COOKIE_CONSENT_VERSION,
  essential: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date().toISOString(),
});

export const acceptAllPreferences = (): CookiePreferences => ({
  version: COOKIE_CONSENT_VERSION,
  essential: true,
  analytics: true,
  marketing: false,
  updatedAt: new Date().toISOString(),
});

export const rejectOptionalPreferences = (): CookiePreferences => ({
  version: COOKIE_CONSENT_VERSION,
  essential: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date().toISOString(),
});

export function readCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as CookiePreferences;
      if (parsed.version === COOKIE_CONSENT_VERSION && parsed.essential === true) {
        return parsed;
      }
    } catch {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
    }
  }

  const legacy = localStorage.getItem(LEGACY_CONSENT_KEY);
  if (legacy === "accepted") {
    const migrated = acceptAllPreferences();
    writeCookiePreferences(migrated);
    localStorage.removeItem(LEGACY_CONSENT_KEY);
    return migrated;
  }

  return null;
}

export function writeCookiePreferences(preferences: CookiePreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_EVENT, { detail: preferences }),
  );
}

export function hasConsent(category: CookieCategory, preferences: CookiePreferences) {
  if (category === "essential") return true;
  return preferences[category];
}
