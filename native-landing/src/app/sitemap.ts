import type { MetadataRoute } from "next";
import { INDUSTRY_SLUGS } from "@/lib/industries/verticals";
import { siteUrl } from "@/lib/brand";

const PUBLIC_PAGES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/tools/grading", changeFrequency: "weekly", priority: 0.8 },
  { path: "/directory", changeFrequency: "weekly", priority: 0.8 },
  { path: "/agency/register", changeFrequency: "monthly", priority: 0.7 },
  { path: "/sign-up", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date();

  return PUBLIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  })).concat(
    INDUSTRY_SLUGS.map((slug) => ({
      url: `${base}/industries/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  );
}
