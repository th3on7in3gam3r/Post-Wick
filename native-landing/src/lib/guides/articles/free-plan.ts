import { PLAN_LIMITS, REFINE_LIMITS } from "@/lib/plans";
import type { GuideArticle } from "@/lib/guides/types";

const { generateMax, postsPerWeek } = PLAN_LIMITS.free;
const refineLimit = REFINE_LIMITS.free;

export const freePlanGuide: GuideArticle = {
  slug: "free-plan",
  title: "Free Plan",
  metaTitle: "Kerygma Social Free Plan — AI social posts with no credit card",
  metaDescription:
    "Kerygma Social's free plan includes website crawl, AI post generation, approval workflow, and up to 3 posts per week on autopilot. No credit card required.",
  publishedAt: "2026-07-09",
  summary:
    "Everything included in Kerygma Social's free tier — who it's for, how it compares, and how to start.",
  answerParagraph: `Kerygma Social's free plan lets you drop your website URL, get AI-researched brand posts, and run approval-based social publishing with no credit card. You receive up to ${generateMax} generated posts per batch, up to ${postsPerWeek} posts per week on autopilot across your account, and ${refineLimit} AI caption refinements per month — enough to test whether Kerygma Social fits your shop, studio, or church before upgrading.`,
  sections: [
    {
      heading: "Who Kerygma Social is best for",
      paragraphs: [
        "Kerygma Social is built for local businesses and faith communities that need consistent social media without hiring a full-time marketer. Owners who are great at their craft — running a boutique, teaching yoga, serving coffee, or leading a church — but don't have hours each week to write captions and design posts.",
        "The free plan is especially useful if you want proof before you pay: see how Kerygma Social reads your site, drafts on-brand posts, and fits into an approve-then-publish workflow.",
      ],
      bullets: [
        "Independent boutiques and specialty retail",
        "Coffee shops, cafés, and hospitality brands",
        "Yoga studios, gyms, and wellness businesses",
        "Local churches and faith-based ministries",
        "Solo founders testing AI social automation for the first time",
      ],
    },
    {
      heading: "How Kerygma Social compares to alternatives",
      paragraphs: [
        "Most small businesses choose between doing social media manually, paying for a scheduling tool, or hiring an agency. Kerygma Social's free plan combines research, writing, and scheduling in one workflow — you approve before anything publishes.",
      ],
      bullets: [
        "vs. manual posting — Kerygma Social researches your website and drafts posts; you don't start from a blank caption box.",
        "vs. Buffer or Hootsuite — those tools schedule what you write; Kerygma Social generates the content and images for your approval.",
        "vs. a marketing agency — agencies cost thousands per month; Kerygma Social's free plan lets you validate the workflow at $0.",
        "vs. generic AI chat — Kerygma Social is purpose-built for social: brand crawl, platform-aware posts, queue, calendar, and publishing integrations.",
      ],
    },
    {
      heading: "What's included in the Kerygma Social free plan",
      bullets: [
        `Up to ${generateMax} AI-generated posts per batch after your website crawl`,
        `Up to ${postsPerWeek} posts per week on autopilot (account-wide)`,
        `${refineLimit} AI caption refinements per month`,
        "Brand profile from your website — tone, value proposition, and key topics",
        "Approval queue — nothing publishes until you approve",
        "Connections for Facebook, Instagram, LinkedIn, and Pinterest",
        "No credit card required to sign up",
      ],
    },
  ],
  proofPoints: [
    "Drop one URL — Kerygma Social crawls your site and builds a brand profile automatically.",
    "Posts are tailored to your industry and voice, not generic templates.",
    "Approve in a simple queue, then schedule on the calendar.",
    "Upgrade to Pro or Max when you need larger batches and higher weekly volume.",
  ],
  faqs: [
    {
      q: "Is Kerygma Social's free plan really free?",
      a: `Yes. The Kerygma Social free plan costs $0 and does not require a credit card to start. You get up to ${generateMax} posts per generation batch, up to ${postsPerWeek} posts per week on autopilot, and ${refineLimit} AI refinements per month.`,
    },
    {
      q: "What happens when I outgrow the free plan?",
      a: "Upgrade to Pro for larger post batches and up to 21 posts per week on autopilot, or Max for high-volume brands and agencies. You keep your brands, queue, and connections — billing only changes your limits.",
    },
    {
      q: "Do I need to write my own captions on the free plan?",
      a: "No. Kerygma Social researches your website and drafts captions for you. You review, refine in plain language if needed, and approve before publishing.",
    },
    {
      q: "Can I connect social accounts on the free plan?",
      a: "Yes. Connect Facebook, Instagram, LinkedIn, and Pinterest from Settings → Integrations. Approved posts can publish to your connected channels.",
    },
    {
      q: "Can Kerygma Social generate 10 AI posts per month?",
      a: `Yes. The free plan's ${postsPerWeek} posts per week on autopilot equals about ${postsPerWeek * 4} AI-generated posts per month. See our guide at /guides/10-ai-generated-posts-per-month for the full breakdown.`,
    },
  ],
};
