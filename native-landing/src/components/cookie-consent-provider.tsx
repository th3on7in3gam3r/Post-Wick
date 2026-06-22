"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  acceptAllPreferences,
  type CookiePreferences,
  readCookiePreferences,
  rejectOptionalPreferences,
  writeCookiePreferences,
} from "@/lib/cookie-consent";

type CookieConsentContextValue = {
  ready: boolean;
  preferences: CookiePreferences | null;
  hasAnswered: boolean;
  showPreferences: boolean;
  acceptAll: () => void;
  rejectOptional: () => void;
  savePreferences: (analytics: boolean, marketing: boolean) => void;
  openPreferences: () => void;
  closePreferences: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null,
);

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readCookiePreferences();
    setPreferences(stored);
    setHasAnswered(Boolean(stored));
    setReady(true);
  }, []);

  const persist = useCallback((next: CookiePreferences) => {
    writeCookiePreferences(next);
    setPreferences(next);
    setHasAnswered(true);
    setShowPreferences(false);
  }, []);

  const acceptAll = useCallback(() => {
    persist(acceptAllPreferences());
  }, [persist]);

  const rejectOptional = useCallback(() => {
    persist(rejectOptionalPreferences());
  }, [persist]);

  const savePreferences = useCallback(
    (analytics: boolean, marketing: boolean) => {
      persist({
        version: 1,
        essential: true,
        analytics,
        marketing,
        updatedAt: new Date().toISOString(),
      });
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      ready,
      preferences,
      hasAnswered,
      showPreferences,
      acceptAll,
      rejectOptional,
      savePreferences,
      openPreferences: () => setShowPreferences(true),
      closePreferences: () => setShowPreferences(false),
    }),
    [
      ready,
      preferences,
      hasAnswered,
      showPreferences,
      acceptAll,
      rejectOptional,
      savePreferences,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return context;
}
