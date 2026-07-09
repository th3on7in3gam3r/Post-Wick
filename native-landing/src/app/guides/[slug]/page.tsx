import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideArticleLayout } from "@/components/guides/guide-article-layout";
import { MarketingShell } from "@/components/marketing-shell";
import {
  GUIDE_SLUGS,
  getGuideArticle,
  guideArticleJsonLd,
} from "@/lib/guides";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const article = getGuideArticle(params.slug);
  if (!article) {
    return createPageMetadata({ title: "Guide not found", path: `/guides/${params.slug}` });
  }

  return createPageMetadata({
    title: article.metaTitle.replace(" | Kerygma Social", ""),
    description: article.metaDescription,
    ogTitle: article.metaTitle,
    ogDescription: article.metaDescription,
    path: `/guides/${article.slug}`,
  });
}

export default function GuideArticlePage({ params }: PageProps) {
  const article = getGuideArticle(params.slug);
  if (!article) {
    notFound();
  }

  return (
    <MarketingShell wide heroBackground="/images/pricing-autopilot-watercolor.png">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(guideArticleJsonLd(article)),
        }}
      />
      <GuideArticleLayout article={article} />
    </MarketingShell>
  );
}
