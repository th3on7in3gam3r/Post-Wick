"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCookieConsent } from "@/components/cookie-consent-provider";
import { TextureButton } from "@/components/ui/texture-button";
import { cn } from "@/lib/utils";

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-gold" : "bg-black/15",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

export function CookiePreferencesModal() {
  const {
    preferences,
    showPreferences,
    closePreferences,
    savePreferences,
    acceptAll,
    rejectOptional,
  } = useCookieConsent();

  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (showPreferences) {
      setAnalytics(preferences?.analytics ?? false);
      setMarketing(preferences?.marketing ?? false);
    }
  }, [showPreferences, preferences]);

  useEffect(() => {
    if (!showPreferences) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreferences();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showPreferences, closePreferences]);

  if (!showPreferences) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={closePreferences}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
        className="relative max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-cream p-6 shadow-cookie md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={closePreferences}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-body hover:bg-black/5"
          aria-label="Close cookie preferences"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="cookie-preferences-title"
          className="pr-8 font-playfair text-2xl italic text-near-black"
        >
          Cookie preferences
        </h2>
        <p className="body-copy mt-3 text-sm">
          Choose which optional cookies you allow. Essential cookies are always
          active because the site cannot work without them.
        </p>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-black/[0.08] bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-near-black">Essential</p>
                <p className="mt-1 text-sm text-gray-body">
                  Sign-in, security, and saving your consent choice. Required
                  for Post-Wick to function.
                </p>
              </div>
              <Toggle checked label="Essential cookies" disabled onChange={() => {}} />
            </div>
          </div>

          <div className="rounded-xl border border-black/[0.08] bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-near-black">Analytics</p>
                <p className="mt-1 text-sm text-gray-body">
                  Help us understand how the site is used so we can improve
                  Post-Wick. No advertising profiles are built from this data.
                </p>
              </div>
              <Toggle
                checked={analytics}
                label="Analytics cookies"
                onChange={setAnalytics}
              />
            </div>
          </div>

          <div className="rounded-xl border border-black/[0.08] bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-near-black">Marketing</p>
                <p className="mt-1 text-sm text-gray-body">
                  Not currently used on Post-Wick. You can leave this off. If we
                  add marketing cookies later, this setting will control them.
                </p>
              </div>
              <Toggle
                checked={marketing}
                label="Marketing cookies"
                onChange={setMarketing}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <TextureButton
            type="button"
            variant="primary"
            size="sm"
            onClick={() => savePreferences(analytics, marketing)}
          >
            Save preferences
          </TextureButton>
          <TextureButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={acceptAll}
          >
            Accept all
          </TextureButton>
          <TextureButton
            type="button"
            variant="minimal"
            size="sm"
            onClick={rejectOptional}
          >
            Reject optional
          </TextureButton>
        </div>

        <p className="mt-4 text-xs text-gray-label">
          Read our{" "}
          <a href="/cookies" className="text-gold underline underline-offset-2">
            Cookie Policy
          </a>{" "}
          for full details.
        </p>
      </div>
    </div>
  );
}
