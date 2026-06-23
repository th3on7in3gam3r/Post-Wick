"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { cn } from "@/lib/utils";

export type MetaSetupInfo = {
  configured: boolean;
  redirectUri: string;
  appUrl: string;
};

const USER_STEPS = [
  "Use an Instagram Business or Creator account.",
  "Click Connect Instagram and sign in with your Instagram account.",
  "Approve Post-Wick when Meta asks for permissions.",
];

const ADMIN_STEPS = [
  "Create one Meta app for Post-Wick at developers.facebook.com (Business type).",
  "Add use cases: Facebook Login + Instagram (Content management).",
  "Facebook Login → Settings → paste the redirect URI below.",
  "App settings → Basic → copy App ID and App Secret.",
  "Add META_APP_ID and META_APP_SECRET to Vercel, then redeploy.",
];

export function MetaSetupGuide({ setup }: { setup: MetaSetupInfo }) {
  const [copied, setCopied] = useState(false);

  if (setup.configured) {
    return null;
  }

  async function copyRedirectUri() {
    await navigator.clipboard.writeText(setup.redirectUri);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-black/[0.06] bg-white px-4 py-4">
        <p className="text-sm font-medium text-near-black">How to connect Instagram</p>
        <p className="mt-1 text-sm text-gray-body">
          You do <span className="font-medium text-near-black">not</span> create a Meta
          developer app. Post-Wick handles that — you only connect your account.
        </p>
        <ol className="mt-4 space-y-2 text-sm text-gray-body">
          {USER_STEPS.map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="font-medium text-gold">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-gray-body">
          Live Instagram connect is not enabled on this workspace yet. Use{" "}
          <span className="font-medium text-near-black">Try demo mode</span> on the card
          below to preview publishing.
        </p>
      </div>

      <details className="rounded-xl border border-black/[0.06] bg-cream/40">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-body">
          Platform setup (Post-Wick administrators only)
        </summary>
        <div className="space-y-4 border-t border-black/[0.06] px-4 py-4">
          <p className="text-xs text-gray-body">
            One-time setup for the Post-Wick team — not for customers connecting their
            accounts.
          </p>
          <ol className="space-y-2 text-sm text-gray-body">
            {ADMIN_STEPS.map((step, index) => (
              <li key={step} className="flex gap-2">
                <span className="font-medium text-gold">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
              Valid OAuth Redirect URI
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

          <div className="flex flex-wrap gap-2 text-xs">
            <StatusPill ok={setup.configured} label="META_APP_ID + SECRET on server" />
            <StatusPill ok={Boolean(setup.appUrl)} label="NEXT_PUBLIC_APP_URL set" />
          </div>
        </div>
      </details>
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
