"use client";

import { useCookieConsent } from "@/components/cookie-consent-provider";
import { CookiePreferencesModal } from "@/components/cookie-preferences-modal";
import { TextureButton } from "@/components/ui/texture-button";

export function CookieConsentUI() {
  const { ready, hasAnswered, acceptAll, rejectOptional, openPreferences } =
    useCookieConsent();

  const showBanner = ready && !hasAnswered;

  return (
    <>
      {showBanner ? (
        <div
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-[640px] rounded-2xl border border-black/[0.06] bg-white p-5 shadow-cookie md:inset-x-6 md:bottom-6 md:p-6"
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-description"
        >
          <p
            id="cookie-banner-title"
            className="font-playfair text-lg italic text-near-black"
          >
            We use cookies
          </p>
          <p
            id="cookie-banner-description"
            className="mt-2 text-[0.85rem] leading-relaxed text-gray-body"
          >
            Post-Wick uses essential cookies to keep you signed in and remember
            your choices. With your permission, we also use analytics cookies to
            improve the product.{" "}
            <a
              href="/cookies"
              className="font-medium text-gold underline decoration-gold/40 underline-offset-2"
            >
              Cookie Policy
            </a>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <TextureButton
              type="button"
              variant="primary"
              size="sm"
              onClick={acceptAll}
            >
              Accept all
            </TextureButton>
            <TextureButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={rejectOptional}
            >
              Reject optional
            </TextureButton>
            <TextureButton
              type="button"
              variant="minimal"
              size="sm"
              onClick={openPreferences}
            >
              Customize
            </TextureButton>
          </div>
        </div>
      ) : null}

      <CookiePreferencesModal />
    </>
  );
}
