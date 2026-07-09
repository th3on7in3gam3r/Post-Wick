import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";
import { getPublicDirectoryBrands } from "@/lib/db";
import { GUIDE_SLUGS } from "@/lib/guides";
import { INDUSTRY_SLUGS } from "@/lib/industries/verticals";

const PUBLIC_PAGES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/get-started", changeFrequency: "monthly", priority: 0.8 },
  { path: "/guides", changeFrequency: "weekly", priority: 0.85 },
  { path: "/tools/grading", changeFrequency: "weekly", priority: 0.8 },
  { path: "/directory", changeFrequency: "weekly", priority: 0.8 },
  { path: "/agency", changeFrequency: "monthly", priority: 0.7 },
  { path: "/agency/register", changeFrequency: "monthly", priority: 0.7 },
  { path: "/sign-up", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
];

async function directoryListingEntries(
  base: string,
): Promise<MetadataRoute.Sitemap> {
  try {
    const brands = await getPublicDirectoryBrands();

    return brands
      .filter((brand) => brand.publicSlug)
      .map((brand) => ({
        url: `${base}/directory/${brand.publicSlug}`,
        lastModified: new Date(brand.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.65,
      }));
  } catch {
    // DB unavailable at build or request time — skip dynamic directory listings.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_PAGES.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${base}${path}`,
      lastModified,
      changeFrequency,
      priority,
    }),
  );

  const industryEntries: MetadataRoute.Sitemap = INDUSTRY_SLUGS.map((slug) => ({
    url: `${base}/industries/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const guideEntries: MetadataRoute.Sitemap = GUIDE_SLUGS.map((slug) => ({
    url: `${base}/guides/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const directoryEntries = await directoryListingEntries(base);

  return [...staticEntries, ...industryEntries, ...guideEntries, ...directoryEntries];
}
