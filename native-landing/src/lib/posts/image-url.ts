import { siteUrl } from "@/lib/brand";

const GENERATED_FILENAME = /^[0-9a-f-]{36}\.png$/i;

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

export function resolvePostImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl?.trim()) return null;

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
  if (!imageUrl?.trim()) return true;
  const trimmed = imageUrl.trim();
  if (trimmed.includes("blob.vercel-storage.com")) return false;
  if (/^https?:\/\//i.test(trimmed)) {
    // Temporary provider URLs are not reliable long-term on production.
    return Boolean(process.env.VERCEL);
  }
  // Dev-only /generated paths are fine locally; on Vercel they 404 without Blob.
  return Boolean(process.env.VERCEL);
}
