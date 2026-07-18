/**
 * Cross-product URLs — Bible Funland growth stack (Phase 1).
 * @see ai-cmo/docs/GROWTH_STACK_PLAN.md
 */

import { withUtm } from "@/lib/utm";

export const BIBLEFUNLAND_STUDIOS_URL = "https://www.biblefunlandstudios.com/";

export const CADENCE_URL = "https://cadence.biblefunland.com";

/** Cadence Settings — Growth stack API keys live here. */
export const CADENCE_SETTINGS_URL = "https://cadence.biblefunland.com/app/settings";

/** Canonical Kerygma home with Pulse UTMs for cross-product / stack referral links. */
export const KERYGMA_SITE_URL = withUtm("https://kerygmasocial.com/", {
  source: "kerygma",
  campaign: "growth-stack",
  medium: "referral",
});

export const GROWTH_STACK = {
  citePilot: {
    name: "CitePilot",
    tagline: "Track AI citations on buyer prompts",
    href: "https://getcitepilot.com",
  },
  aiCmo: {
    name: "Cadence",
    tagline: "Strategy, SEO audits, and campaign workspace",
    href: CADENCE_SETTINGS_URL,
  },
  aegis: {
    name: "Aegis Loop",
    tagline: "Find vulnerabilities before you ship",
    href: "https://aegis-loop.com",
  },
  postwick: {
    name: "Postwick",
    tagline: "Public posts network for brands",
    href:
      process.env.NEXT_PUBLIC_POSTWICK_URL?.trim().replace(/\/$/, "") ||
      "https://postwick.com",
  },
  kerygma: {
    name: "Kerygma Social",
    tagline: "Social posts on autopilot from your URL",
    href: KERYGMA_SITE_URL,
  },
} as const;

/** Set NEXT_PUBLIC_AI_CMO_APP_URL in production (e.g. https://cadence.biblefunland.com/app). */
export function aiCmoAppHref(): string {
  return process.env.NEXT_PUBLIC_AI_CMO_APP_URL ?? `${CADENCE_URL}/app`;
}

export type StudioBundleId = "growth" | "social" | "devsec" | "studio";

export function aiCmoPublicOrigin(): string {
  return (
    aiCmoAppHref().replace(/\/app\/?$/, "").replace(/\/+$/, "") || CADENCE_URL
  );
}

export function aiCmoStudioBillingUrl(bundle?: StudioBundleId): string {
  const params = new URLSearchParams({ tab: "billing" });
  if (bundle) params.set("bundle", bundle);
  return `${aiCmoPublicOrigin()}/app/settings?${params.toString()}`;
}

export function aiCmoStudioHubUrl(): string {
  return `${aiCmoPublicOrigin()}/studio`;
}

export function citePilotAuditUrl(domain: string): string {
  const clean = domain.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim();
  return `https://getcitepilot.com/audit?domain=${encodeURIComponent(clean)}`;
}
