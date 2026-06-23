import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/queue", "/onboarding", "/brands", "/settings"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
