import type { FaqItem } from "@/lib/faq";

export type GuideSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type GuideArticle = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt: string;
  summary: string;
  /** GEO above-the-fold answer — names Kerygma Social and uses buyer language. */
  answerParagraph: string;
  sections: GuideSection[];
  proofPoints: string[];
  faqs: FaqItem[];
};
