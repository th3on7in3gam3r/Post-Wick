"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { cn } from "@/lib/utils";

export type XSetupInfo = {
  configured: boolean;
  redirectUri: string;
  appUrl: string;
};

const X_ADMIN_CHECKLIST = [
  "X is Coming soon for customers (paid API). Keep credentials ready for a later re-enable.",
  "Create an app at developer.x.com with a paid API tier, inside a Project (not standalone).",
  "User authentication settings → Enable OAuth 2.0 → Type: Web App → App permissions: Read and write.",
  "Add the exact OAuth redirect URI below under Callback URI / Redirect URL (no trailing slash).",
  "Set Website URL to your production domain (e.g. https://kerygmasocial.com).",
  "Optional images: set X_OAUTH_INCLUDE_MEDIA_WRITE=1 when re-enabling Connect.",
  "Copy OAuth 2.0 Client ID and Client Secret into X_CLIENT_ID and X_CLIENT_SECRET.",
  "When re-enabling: restore oauthProvider on twitter in catalog, redeploy, verify GET /api/health/x.",
];

export function XSetupGuide({
  setup,
  showAdminGuide,
}: {
  setup: XSetupInfo;
  showAdminGuide: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyRedirectUri() {
    await navigator.clipboard.writeText(setup.redirectUri);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (!showAdminGuide) {
    return (
      <div className="rounded-xl border border-black/[0.06] bg-white px-4 py-4">
        <p className="text-sm font-medium text-near-black">X</p>
        <p className="mt-2 text-sm text-gray-body">
          Live Connect for X is Coming soon. You can still use Facebook, Instagram, LinkedIn,
          Pinterest, and Bluesky today.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-black/[0.06] bg-cream/40 px-4 py-4">
      <p className="text-sm font-medium text-near-black">X setup (Kerygma Social team)</p>
      <p className="mt-2 text-sm text-gray-body">
        Customer-facing Connect is disabled (Coming soon). This checklist is for a future re-enable.
      </p>
      {!setup.configured ? (
        <p className="mt-2 text-sm text-gray-body">X credentials not detected on the server yet.</p>
      ) : null}
      <ol className="mt-4 space-y-2 text-sm text-gray-body">
        {X_ADMIN_CHECKLIST.map((step, index) => (
          <li key={step} className="flex gap-2">
            <span className="font-medium text-gold">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
          OAuth redirect URI
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-xs text-near-black">
            {setup.redirectUri}
          </code>
          <TextureButton type="button" variant="secondary" size="sm" onClick={() => void copyRedirectUri()}>
            {copied ? (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </TextureButton>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 font-medium",
            setup.configured
              ? "bg-emerald-50 text-emerald-700"
              : "bg-cream text-gray-body",
          )}
        >
          X_CLIENT_ID + secret on server
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 font-medium",
            setup.appUrl ? "bg-emerald-50 text-emerald-700" : "bg-cream text-gray-body",
          )}
        >
          NEXT_PUBLIC_APP_URL set
        </span>
        <span className="rounded-full bg-cream px-2.5 py-1 font-medium text-gray-body">
          Coming soon (catalog gated)
        </span>
      </div>
    </div>
  );
}
