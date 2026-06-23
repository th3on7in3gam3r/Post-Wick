"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Cookie, Settings2 } from "lucide-react";
import { useCookieConsent } from "@/components/cookie-consent-provider";
import { CookiePreferencesModal } from "@/components/cookie-preferences-modal";
import { TextureButton } from "@/components/ui/texture-button";
import { cn } from "@/lib/utils";

function isAuthRoute(pathname: string) {
  return pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
}

export function CookieConsentUI() {
  const pathname = usePathname();
  const { ready, hasAnswered, acceptAll, rejectOptional, openPreferences } =
    useCookieConsent();

  const showBanner = ready && !hasAnswered;
  const onAuthPage = isAuthRoute(pathname ?? "");

  return (
    <>
      {showBanner ? (
        <>
          {onAuthPage ? (
            <div
              className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-[2px]"
              aria-hidden
            />
          ) : null}
          <div
            className={cn(
              "fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-[720px] rounded-2xl border border-black/[0.08] bg-white p-5 shadow-cookie md:inset-x-6 md:bottom-6 md:p-6",
              onAuthPage && "bottom-5 md:bottom-8",
            )}
            role="dialog"
            aria-labelledby="cookie-banner-title"
            aria-describedby="cookie-banner-description"
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.06]"
                aria-hidden
              >
                <Cookie className="h-[18px] w-[18px] text-near-black" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  id="cookie-banner-title"
                  className="font-playfair text-lg font-semibold not-italic text-near-black md:text-xl"
                >
                  We value your privacy
                </p>
                <p
                  id="cookie-banner-description"
                  className="mt-2 text-[0.85rem] leading-relaxed text-gray-body md:text-sm"
                >
                  We use cookies to enhance your browsing experience, analyze site
                  traffic, and personalize content. By clicking &ldquo;Accept All&rdquo;,
                  you consent to our use of cookies. Learn more in our{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-near-black underline decoration-black/30 underline-offset-2 hover:decoration-black/60"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/cookies"
                    className="font-medium text-near-black underline decoration-black/30 underline-offset-2 hover:decoration-black/60"
                  >
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <TextureButton
                type="button"
                variant="primary"
                shape="rounded"
                size="sm"
                className="w-full sm:min-w-[140px] sm:flex-1"
                onClick={acceptAll}
              >
                Accept All
              </TextureButton>
              <button
                type="button"
                onClick={openPreferences}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.12] bg-white px-4 py-2.5 text-sm font-medium text-near-black transition hover:bg-black/[0.02] sm:w-auto"
              >
                <Settings2 className="h-4 w-4 text-gray-body" aria-hidden />
                Customize
                <ChevronDown className="h-4 w-4 text-gray-body" aria-hidden />
              </button>
              <button
                type="button"
                onClick={rejectOptional}
                className="px-2 py-2.5 text-sm font-medium text-gray-body transition hover:text-near-black sm:ml-auto"
              >
                Decline
              </button>
            </div>
          </div>
        </>
      ) : null}

      <CookiePreferencesModal />
    </>
  );
}
