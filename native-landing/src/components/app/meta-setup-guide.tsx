"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { cn } from "@/lib/utils";

export type MetaSetupInfo = {
  configured: boolean;
  redirectUri: string;
  appUrl: string;
  usesInstagramAppId?: boolean;
};

const CONNECT_STEPS = [
  "Use an Instagram Business or Creator account.",
  "Click Connect Instagram and sign in with Instagram.",
  "Approve Post-Wick when Meta asks for permissions.",
];

const ADMIN_CHECKLIST = [
  "Open your Meta app → Use cases → Manage messaging & content on Instagram.",
  "Go to API setup with Instagram login → Set up Instagram business login → Business login settings.",
  "Under OAuth redirect URIs, add the exact redirect URI below (character-for-character).",
  "Copy the Instagram App ID and Instagram App Secret from that same page — not App settings → Basic.",
  "Put them in Vercel as META_APP_ID and META_APP_SECRET (or INSTAGRAM_APP_ID / INSTAGRAM_APP_SECRET), then redeploy.",
  "In App roles, add your Instagram account as Admin, Developer, or Tester while the app is in Development mode.",
];

function CustomerConnectGuide({ configured }: { configured: boolean }) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white px-4 py-4">
      <p className="text-sm font-medium text-near-black">How to connect Instagram</p>
      <p className="mt-1 text-sm text-gray-body">
        You do <span className="font-medium text-near-black">not</span> create a Meta
        developer app. Post-Wick handles that — you only connect your account.
      </p>
      <ol className="mt-4 space-y-2 text-sm text-gray-body">
        {CONNECT_STEPS.map((step, index) => (
          <li key={step} className="flex gap-2">
            <span className="font-medium text-gold">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {!configured ? (
        <p className="mt-4 text-sm text-gray-body">
          Live Instagram connect is not enabled on this workspace yet. Use{" "}
          <span className="font-medium text-near-black">Try demo mode</span> on the card
          below to preview publishing.
        </p>
      ) : null}
    </div>
  );
}

export function MetaSetupGuide({
  setup,
  showAdminGuide,
}: {
  setup: MetaSetupInfo;
  showAdminGuide: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyRedirectUri() {
    await navigator.clipboard.writeText(setup.redirectUri);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (!showAdminGuide) {
    return <CustomerConnectGuide configured={setup.configured} />;
  }

  return (
    <div className="space-y-4">
      {!setup.configured ? (
        <CustomerConnectGuide configured={false} />
      ) : (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-4">
          <p className="text-sm font-medium text-near-black">
            If Connect Instagram shows &ldquo;page isn&apos;t available&rdquo;
          </p>
          <p className="mt-1 text-sm text-gray-body">
            This is a Meta app configuration issue. Complete the checklist below — especially
            the redirect URI and Instagram App ID from the Instagram login setup page.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-black/[0.06] bg-cream/40 px-4 py-4">
        <p className="text-sm font-medium text-near-black">
          {setup.configured
            ? "Meta setup checklist (Post-Wick team)"
            : "Platform setup (Post-Wick administrators only)"}
        </p>
        <ol className="mt-4 space-y-2 text-sm text-gray-body">
          {ADMIN_CHECKLIST.map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="font-medium text-gold">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
            OAuth redirect URI (paste in Meta Business login settings)
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-xs text-near-black">
              {setup.redirectUri}
            </code>
            <TextureButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void copyRedirectUri()}
            >
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
          <StatusPill ok={setup.configured} label="Instagram credentials on server" />
          <StatusPill ok={Boolean(setup.appUrl)} label="NEXT_PUBLIC_APP_URL set" />
          <StatusPill
            ok={Boolean(setup.usesInstagramAppId)}
            label="INSTAGRAM_APP_ID set (recommended)"
          />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 font-medium",
        ok ? "bg-emerald-50 text-emerald-700" : "bg-cream text-gray-body",
      )}
    >
      {label}
    </span>
  );
}
