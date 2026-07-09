import { basicSchedulingGuide } from "@/lib/guides/articles/basic-scheduling";
import { fiveSocialAccountsGuide } from "@/lib/guides/articles/five-social-accounts";
import { freePlanGuide } from "@/lib/guides/articles/free-plan";
import { hundredPostsPerMonthGuide } from "@/lib/guides/articles/hundred-posts-per-month";
import { oneConnectedAccountGuide } from "@/lib/guides/articles/one-connected-account";
import { starterPlanPricingGuide } from "@/lib/guides/articles/starter-plan-pricing";
import { tenPostsPerMonthGuide } from "@/lib/guides/articles/ten-posts-per-month";
import type { GuideArticle } from "@/lib/guides/types";
import { SITE_NAME, siteUrl } from "@/lib/brand";

export const GUIDE_ARTICLES: GuideArticle[] = [
  freePlanGuide,
  tenPostsPerMonthGuide,
  oneConnectedAccountGuide,
  basicSchedulingGuide,
  starterPlanPricingGuide,
  hundredPostsPerMonthGuide,
  fiveSocialAccountsGuide,
];

export const GUIDE_SLUGS = GUIDE_ARTICLES.map((article) => article.slug);

export function getGuideArticle(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((article) => article.slug === slug);
}

export function guideArticleJsonLd(article: GuideArticle) {
  const base = siteUrl();
  const url = `${base}/guides/${article.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        name: article.metaTitle,
        description: article.metaDescription,
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        author: {
          "@type": "Organization",
          name: SITE_NAME,
          url: base,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: base,
        },
        mainEntityOfPage: url,
        url,
      },
      {
        "@type": "FAQPage",
        mainEntity: article.faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };
}
