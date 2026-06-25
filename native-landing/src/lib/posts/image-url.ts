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
