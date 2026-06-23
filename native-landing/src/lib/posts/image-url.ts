import { siteUrl } from "@/lib/brand";

export function resolvePostImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl?.trim()) return null;

  const trimmed = imageUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (trimmed.startsWith("/")) {
    return `${siteUrl()}${trimmed}`;
  }

  return trimmed;
}
