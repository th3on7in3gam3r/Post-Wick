import type { BrandRecord } from "@/lib/db";
import { getBrandAssetsFromResearch } from "@/lib/brand-assets";

export type Client = {
  id: string;
  name: string;
  logoUrl: string | null;
  industry: string;
};

export const EMPTY_CLIENT: Client = {
  id: "",
  name: "No clients yet",
  logoUrl: null,
  industry: "Add a brand to begin",
};

export function clientInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function brandToClient(brand: BrandRecord): Client {
  const research = brand.researchData
    ? (JSON.parse(brand.researchData) as { industry?: string; logoUrl?: string | null })
    : null;
  const assets = getBrandAssetsFromResearch(brand.websiteUrl, research);

  return {
    id: brand.id,
    name: brand.name,
    logoUrl: assets.logoUrl || null,
    industry: research?.industry?.trim() || "Business",
  };
}

export function postMatchesClient(
  post: { brandId?: string; brandName?: string },
  client: Client,
) {
  if (!client.id) return true;
  if (post.brandId && post.brandId === client.id) return true;
  if (post.brandName && post.brandName.toLowerCase() === client.name.toLowerCase()) {
    return true;
  }
  return false;
}
