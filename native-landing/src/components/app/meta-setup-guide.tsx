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

const SETUP_STEPS = [
  "Create an app at developers.facebook.com (Business type).",
  "Add use cases: Facebook Login + Instagram (Content management).",
  "Facebook Login → Settings → paste the redirect URI below.",
  "App settings → Basic → copy App ID and App Secret.",
  "Add META_APP_ID and META_APP_SECRET to Vercel, then redeploy.",
  "Link Instagram Business to your Facebook Page in Meta Business Suite.",
];

export function MetaSetupGuide({ setup }: { setup: MetaSetupInfo }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(!setup.configured);

  async function copyRedirectUri() {
    await navigator.clipboard.writeText(setup.redirectUri);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div id="meta-setup-guide" className="rounded-xl border border-black/[0.06] bg-cream/40">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
      >
        <div>
          <p className="text-sm font-medium text-near-black">
            Instagram &amp; Facebook setup guide
          </p>
          <p className="mt-0.5 text-xs text-gray-body">
            {setup.configured
              ? "Meta keys detected on the server. Complete Meta app settings if connect fails."
              : "Add META_APP_ID and META_APP_SECRET on Vercel to enable live connect."}
          </p>
        </div>
        <span className="text-xs text-gray-label">{open ? "Hide" : "Show"}</span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-black/[0.06] px-4 py-4">
          <ol className="space-y-2 text-sm text-gray-body">
            {SETUP_STEPS.map((step, index) => (
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
      ) : null}
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
