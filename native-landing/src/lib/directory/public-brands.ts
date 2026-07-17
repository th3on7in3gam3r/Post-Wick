import type { BrandRecord } from "@/lib/db";

export type PublicBrandListing = {
  id: string;
  name: string;
  niche: string;
  websiteUrl: string;
  publicSlug: string | null;
  description: string | null;
};

export const DIRECTORY_NICHE_FILTERS = [
  { id: "all", label: "All niches" },
  { id: "church", label: "Church" },
  { id: "coffee-shop", label: "Coffee shop" },
  { id: "retail", label: "Retail" },
  { id: "professional-services", label: "Professional services" },
  { id: "technology", label: "Technology" },
  { id: "health-wellness", label: "Health & wellness" },
] as const;

export type DirectoryNicheFilterId = (typeof DIRECTORY_NICHE_FILTERS)[number]["id"];

function nicheFromBrand(brand: BrandRecord) {
  if (brand.publicNiche?.trim()) {
    return brand.publicNiche.trim();
  }

  if (brand.researchData) {
    try {
      const research = JSON.parse(brand.researchData) as { industry?: string };
      if (research.industry?.trim()) {
        return research.industry.trim();
      }
    } catch {
      // ignore invalid JSON
    }
  }

  return "Small business";
}

export function toPublicBrandListing(brand: BrandRecord): PublicBrandListing {
  return {
    id: brand.id,
    name: brand.name,
    niche: nicheFromBrand(brand),
    websiteUrl: brand.websiteUrl,
    publicSlug: brand.publicSlug,
    description: brand.description,
  };
}

export function getPublicBrandListings(brands: BrandRecord[]) {
  return brands.map(toPublicBrandListing);
}

const NICHE_MATCHERS: Record<Exclude<DirectoryNicheFilterId, "all">, RegExp> = {
  church: /church|faith|ministry|parish|worship|community/i,
  "coffee-shop": /coffee|cafe|café|bakery|restaurant|food|hospitality/i,
  retail: /retail|boutique|shop|store|commerce/i,
  "professional-services": /professional|legal|accounting|consulting|agency|services/i,
  technology: /tech|software|saas|digital|it\b/i,
  "health-wellness": /health|wellness|fitness|medical|therapy|care/i,
};

export function matchesDirectoryNicheFilter(
  listing: PublicBrandListing,
  filter: DirectoryNicheFilterId,
) {
  if (filter === "all") return true;
  const pattern = NICHE_MATCHERS[filter];
  return pattern.test(listing.niche) || pattern.test(listing.name);
}

export function filterPublicBrandListings(
  listings: PublicBrandListing[],
  options: { query: string; niche: DirectoryNicheFilterId },
) {
  const query = options.query.trim().toLowerCase();

  return listings.filter((listing) => {
    if (!matchesDirectoryNicheFilter(listing, options.niche)) {
      return false;
    }

    if (!query) return true;

    return (
      listing.name.toLowerCase().includes(query) ||
      listing.niche.toLowerCase().includes(query) ||
      listing.websiteUrl.toLowerCase().includes(query)
    );
  });
}

export function postwickBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_POSTWICK_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

export function publicFeedHref(listing: PublicBrandListing) {
  if (!listing.publicSlug) return "#";
  const postwick = postwickBaseUrl();
  if (postwick) {
    return `${postwick}/b/${listing.publicSlug}`;
  }
  return `/directory/${listing.publicSlug}`;
}

export function slugifyBrandName(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "brand";
}

export function deriveBrandNiche(brand: BrandRecord) {
  return nicheFromBrand(brand);
}
