import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndustryLandingTemplate } from "@/components/industries/industry-landing-template";
import { MarketingShell } from "@/components/marketing-shell";
import {
  getIndustryVertical,
  INDUSTRY_SLUGS,
  type IndustrySlug,
} from "@/lib/industries/verticals";
import { createPageMetadata } from "@/lib/metadata";
import { siteUrl } from "@/lib/brand";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return INDUSTRY_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const vertical = getIndustryVertical(params.slug);
  if (!vertical) {
    return createPageMetadata({ title: "Industry not found", path: `/industries/${params.slug}` });
  }

  return createPageMetadata({
    title: vertical.metaTitle.replace(" | Kerygma Social", ""),
    description: vertical.metaDescription,
    ogTitle: vertical.metaTitle,
    ogDescription: vertical.metaDescription,
    path: `/industries/${vertical.slug}`,
  });
}

function industryJsonLd(slug: IndustrySlug, title: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Social Media Automation for ${title}`,
    description,
    url: `${siteUrl()}/industries/${slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Kerygma Social",
      url: siteUrl(),
    },
  };
}

export default function IndustryPage({ params }: PageProps) {
  const vertical = getIndustryVertical(params.slug);
  if (!vertical) {
    notFound();
  }

  return (
    <MarketingShell wide heroBackground>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            industryJsonLd(vertical.slug, vertical.title, vertical.metaDescription),
          ),
        }}
      />
      <IndustryLandingTemplate vertical={vertical} />
    </MarketingShell>
  );
}
