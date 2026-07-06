"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { cn } from "@/lib/utils";

export type MetaSetupInfo = {
  instagramConfigured: boolean;
  facebookConfigured: boolean;
  redirectUri: string;
  appUrl: string;
  usesInstagramAppId?: boolean;
};

const INSTAGRAM_CONNECT_STEPS = [
  "Use an Instagram Business or Creator account.",
  "Click Connect Instagram and sign in with Instagram.",
  "Approve Kerygma Social when Meta asks for permissions.",
];

const FACEBOOK_CONNECT_STEPS = [
  "You must be an admin of a Facebook Page for your brand.",
  "Click Connect Facebook and sign in with Facebook.",
  "Approve Page access when Meta asks for permissions.",
];

const INSTAGRAM_ADMIN_CHECKLIST = [
  "Open your Meta app → Use cases → Manage messaging & content on Instagram.",
  "Go to API setup with Instagram login → Set up Instagram business login → Business login settings.",
  "Under OAuth redirect URIs, add the exact redirect URI below (character-for-character).",
  "Copy the Instagram App ID and Instagram App Secret from that same page — not App settings → Basic.",
  "Put them in Vercel as INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET (or META_APP_ID / META_APP_SECRET), then redeploy.",
  "In App roles, add your Instagram account as Admin, Developer, or Tester while the app is in Development mode.",
];

const FACEBOOK_ADMIN_CHECKLIST = [
  "Add the use case: Manage everything on your Page (Content management).",
  "Open Facebook Login for Business → Configurations → Create configuration.",
  "Token type: User access token. Permissions: pages_show_list, pages_manage_posts, pages_read_engagement.",
  "Copy the configuration ID into META_FB_LOGIN_CONFIG_ID in Vercel and .env.local.",
  "Facebook Login for Business → Settings → Valid OAuth Redirect URIs: add the URI below.",
  "Set META_APP_ID and META_APP_SECRET from App settings → Basic, then redeploy.",
];

const FACEBOOK_APP_REVIEW_CHECKLIST = [
  "App Review → Permissions and Features → request Advanced Access for pages_manage_posts (required to publish).",
  "Also request Advanced Access for pages_show_list. pages_read_engagement is optional but recommended.",
  "Prepare a screencast: sign in at kerygmasocial.com → Settings → Integrations → Connect Facebook → approve → approve a post → show it on the Page.",
  "Privacy Policy URL: https://kerygmasocial.com/privacy — Terms: https://kerygmasocial.com/terms.",
  "Explain use case: customers connect their own Facebook Page; Kerygma publishes approved posts only after they swipe to approve.",
  "While Development mode: only App roles (Admin/Developer/Tester) can publish. After approval, switch the app to Live.",
];

function ConnectSteps({
  title,
  steps,
  liveReady,
}: {
  title: string;
  steps: string[];
  liveReady: boolean;
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white px-4 py-4">
      <p className="text-sm font-medium text-near-black">{title}</p>
      <ol className="mt-4 space-y-2 text-sm text-gray-body">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-2">
            <span className="font-medium text-gold">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {!liveReady ? (
        <p className="mt-4 text-sm text-gray-body">
          Live connect isn&apos;t enabled on this workspace yet. Use{" "}
          <span className="font-medium text-near-black">Try demo mode</span> on the
          card below to preview publishing.
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
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <ConnectSteps
          title="How to connect Instagram"
          steps={INSTAGRAM_CONNECT_STEPS}
          liveReady={setup.instagramConfigured}
        />
        <ConnectSteps
          title="How to connect Facebook"
          steps={FACEBOOK_CONNECT_STEPS}
          liveReady={setup.facebookConfigured}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ConnectSteps
          title="Instagram (customers)"
          steps={INSTAGRAM_CONNECT_STEPS}
          liveReady={setup.instagramConfigured}
        />
        <ConnectSteps
          title="Facebook (customers)"
          steps={FACEBOOK_CONNECT_STEPS}
          liveReady={setup.facebookConfigured}
        />
      </div>

      <AdminChecklist
        title="Instagram setup (Kerygma Social team)"
        steps={INSTAGRAM_ADMIN_CHECKLIST}
        configured={setup.instagramConfigured}
        redirectUri={setup.redirectUri}
        copied={copied}
        onCopy={() => void copyRedirectUri()}
        pills={[
          { ok: setup.instagramConfigured, label: "Instagram credentials on server" },
          { ok: Boolean(setup.usesInstagramAppId), label: "INSTAGRAM_APP_ID set (recommended)" },
        ]}
      />

      <AdminChecklist
        title="Facebook Page setup (Kerygma Social team)"
        steps={FACEBOOK_ADMIN_CHECKLIST}
        configured={setup.facebookConfigured}
        redirectUri={setup.redirectUri}
        copied={copied}
        onCopy={() => void copyRedirectUri()}
        pills={[
          { ok: setup.facebookConfigured, label: "META_APP_ID + secret + config ID" },
          { ok: Boolean(setup.appUrl), label: "NEXT_PUBLIC_APP_URL set" },
        ]}
      />

      <AdminChecklist
        title="Facebook App Review (required for customer publishing)"
        steps={FACEBOOK_APP_REVIEW_CHECKLIST}
        configured={setup.facebookConfigured}
        redirectUri={setup.redirectUri}
        copied={copied}
        onCopy={() => void copyRedirectUri()}
      />
    </div>
  );
}

function AdminChecklist({
  title,
  steps,
  configured,
  redirectUri,
  copied,
  onCopy,
  pills,
}: {
  title: string;
  steps: string[];
  configured: boolean;
  redirectUri: string;
  copied: boolean;
  onCopy: () => void;
  pills?: Array<{ ok: boolean; label: string }>;
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-cream/40 px-4 py-4">
      <p className="text-sm font-medium text-near-black">{title}</p>
      {!configured ? (
        <p className="mt-2 text-sm text-gray-body">Credentials not detected on the server yet.</p>
      ) : null}
      <ol className="mt-4 space-y-2 text-sm text-gray-body">
        {steps.map((step, index) => (
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
            {redirectUri}
          </code>
          <TextureButton type="button" variant="secondary" size="sm" onClick={onCopy}>
            {copied ? (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </TextureButton>
        </div>
      </div>

      {pills && pills.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {pills.map((pill) => (
            <StatusPill key={pill.label} ok={pill.ok} label={pill.label} />
          ))}
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
