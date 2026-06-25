import type { Metadata } from "next";
import {
  OG_DEFAULT_DESCRIPTION,
  OG_DEFAULT_TITLE,
  OG_IMAGE,
  SITE_NAME,
  SITE_TAGLINE,
  siteUrl,
} from "@/lib/brand";

type PageMetadataOptions = {
  /** Short title for the browser tab (uses root template → "Pricing | Kerygma Social"). */
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  path?: string;
};

export function createPageMetadata({
  title,
  description = OG_DEFAULT_DESCRIPTION,
  ogTitle = OG_DEFAULT_TITLE,
  ogDescription = description,
  path = "",
}: PageMetadataOptions = {}): Metadata {
  const canonicalUrl = `${siteUrl()}${path}`;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: ogTitle,
      description: ogDescription,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [OG_IMAGE.url],
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: OG_DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: OG_DEFAULT_DESCRIPTION,
  keywords: [
    "social media automation",
    "AI social media posts",
    "small business marketing",
    "LinkedIn scheduling",
    "Instagram posts",
    "local business marketing",
    SITE_TAGLINE.replace(/\.$/, ""),
  ],
  ...createPageMetadata(),
};
