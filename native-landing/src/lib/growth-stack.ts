/**
 * Cross-product URLs — Bible Funland growth stack (Phase 1).
 * @see ai-cmo/docs/GROWTH_STACK_PLAN.md
 */

export const BIBLEFUNLAND_STUDIOS_URL = "https://www.biblefunlandstudios.com/";

export const GROWTH_STACK = {
  citePilot: {
    name: "CitePilot",
    tagline: "Track AI citations on buyer prompts",
    href: "https://getcitepilot.com",
  },
  aiCmo: {
    name: "AI CMO",
    tagline: "Strategy, SEO audits, and campaign workspace",
  },
  aegis: {
    name: "Aegis Loop",
    tagline: "Find vulnerabilities before you ship",
    href: "https://aegis-loop.onrender.com",
  },
  kerygma: {
    name: "Kerygma Social",
    tagline: "Social posts on autopilot from your URL",
    href: "https://kerygmasocial.com",
  },
} as const;

/** Set NEXT_PUBLIC_AI_CMO_APP_URL in production (e.g. https://cmo.yourdomain.com/app). */
export function aiCmoAppHref(): string {
  return process.env.NEXT_PUBLIC_AI_CMO_APP_URL ?? "http://localhost:3000/app";
}

export type StudioBundleId = "growth" | "social" | "devsec" | "studio";

export function aiCmoPublicOrigin(): string {
  return aiCmoAppHref().replace(/\/app\/?$/, "").replace(/\/+$/, "") || "http://localhost:3000";
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
