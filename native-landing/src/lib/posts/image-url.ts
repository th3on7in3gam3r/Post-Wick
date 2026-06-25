import { siteUrl } from "@/lib/brand";

const GENERATED_FILENAME = /^[0-9a-f-]{36}\.png$/i;

function isProductionRuntime() {
  if (typeof window !== "undefined") {
    return !["localhost", "127.0.0.1"].includes(window.location.hostname);
  }
  return Boolean(process.env.VERCEL);
}

export function normalizePostImagePath(imageUrl: string) {
  const trimmed = imageUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (GENERATED_FILENAME.test(trimmed)) {
    return `/api/generated/${trimmed}`;
  }

  if (trimmed.startsWith("generated/")) {
    return `/api/generated/${trimmed.slice("generated/".length)}`;
  }

  if (trimmed.startsWith("/generated/")) {
    return `/api/generated/${trimmed.slice("/generated/".length)}`;
  }

  if (trimmed.startsWith("/api/generated/")) {
    return trimmed;
  }

  return trimmed;
}

/** Stored URL points at dev-only files or another host — not displayable on production. */
export function postHasBrokenImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl?.trim()) return false;
  const trimmed = imageUrl.trim();
  if (trimmed.includes("blob.vercel-storage.com")) return false;
  if (!isProductionRuntime()) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  return true;
}

export function postNeedsRepair(imageUrl: string | null | undefined) {
  if (!imageUrl?.trim()) return true;
  return postHasBrokenImageUrl(imageUrl);
}

export function resolvePostImageUrl(
  imageUrl: string | null | undefined,
  options?: { display?: boolean },
) {
  if (!imageUrl?.trim()) return null;
  if (options?.display && postHasBrokenImageUrl(imageUrl)) return null;

  const normalized = normalizePostImagePath(imageUrl);
  if (/^https?:\/\//i.test(normalized)) return normalized;

  if (normalized.startsWith("/")) {
    if (typeof window === "undefined") {
      return `${siteUrl()}${normalized}`;
    }
    return normalized;
  }

  return normalized;
}

/** True when a post still needs a durable image URL (missing, local-only, or non-blob remote). */
export function postNeedsImageGeneration(imageUrl: string | null | undefined) {
  return postNeedsRepair(imageUrl);
}
