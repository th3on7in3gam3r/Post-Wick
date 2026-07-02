import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/agency/dashboard",
        "/dashboard",
        "/queue",
        "/onboarding",
        "/brands",
        "/settings",
        "/*redirect_url=",
        "/*ref=",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
