import { planFacts, PLATFORMS_PER_BRAND } from "@/lib/guides/plan-facts";
import type { GuideArticle } from "@/lib/guides/types";

const platforms = "Facebook, Instagram, LinkedIn, or Pinterest";

export const oneConnectedAccountGuide: GuideArticle = {
  slug: "1-connected-social-account",
  title: "1 Connected Social Account",
  metaTitle: "1 Connected Social Account | Kerygma Social Setup Guide",
  metaDescription:
    "Start Kerygma Social with one connected social account on the free plan. Connect Instagram, Facebook, LinkedIn, or Pinterest per brand and publish after approval.",
  publishedAt: "2026-07-09",
  summary:
    "How to start with a single connected social account on Kerygma Social — setup, limits, and when to add more.",
  answerParagraph: `Kerygma Social lets you start with 1 connected social account on the free plan — pick ${platforms}, link it to your brand, and publish AI-generated posts after you approve them. Connect from Settings → Integrations, generate posts from your website crawl, and schedule up to ${planFacts.free.weekly} approved posts per week on autopilot. No credit card required to connect your first account.`,
  sections: [
    {
      heading: "Who Kerygma Social is best for",
      paragraphs: [
        "Kerygma Social is ideal for owners who want to automate one primary channel first — usually Instagram or Facebook for local businesses, or LinkedIn for professional services — before expanding.",
        "If you are comparing tools that advertise “1 connected social account” on a starter tier, Kerygma Social’s free plan covers that workflow with AI post generation included, not just scheduling.",
      ],
      bullets: [
        "Solo owners launching one main social channel",
        "Shops and studios focused on Instagram or Facebook first",
        "Churches publishing primarily to Facebook or Instagram",
        "Teams testing Kerygma Social before connecting more platforms",
      ],
    },
    {
      heading: "How Kerygma Social compares to alternatives",
      bullets: [
        "vs. schedulers with 1-account limits — Kerygma Social also writes the posts from your website crawl, not only queues what you draft.",
        "vs. manual posting — one connected account still benefits from AI generation, approval queue, and autopilot scheduling.",
        "vs. hiring a freelancer — connect one account and publish consistently without per-post fees.",
        "vs. juggling multiple tools — research, captions, images, queue, and publishing live in one product.",
      ],
    },
    {
      heading: "1 connected social account on Kerygma Social",
      bullets: [
        "One account per platform per brand — e.g. one Instagram Page for your coffee shop brand",
        `Supported platforms today: ${platforms}`,
        "Free plan: connect your first account and publish up to 3 approved posts per week",
        "Add more platform connections to the same brand as you grow",
        "Add additional brands on paid plans for clients or multiple locations",
        "Nothing publishes until you approve it in the queue",
      ],
    },
  ],
  proofPoints: [
    "Connect in minutes from Settings → Integrations.",
    "AI drafts posts from your website — you are not starting from blank captions.",
    "Start with one account; expand platforms when you are ready.",
    "Free plan includes the full approve-then-publish workflow.",
  ],
  faqs: [
    {
      q: "Can I start Kerygma Social with 1 connected social account?",
      a: `Yes. Connect one account on ${platforms} for your brand on the free plan. Generate posts from your website, approve them, and publish up to ${planFacts.free.weekly} posts per week on autopilot.`,
    },
    {
      q: "Which social account should I connect first?",
      a: "Most local businesses start with Instagram or Facebook. B2B brands often start with LinkedIn. Pick the channel where your customers already find you.",
    },
    {
      q: "Can I add more connected accounts later?",
      a: `Yes. Each brand supports one connection per platform — up to ${PLATFORMS_PER_BRAND} platforms per brand. Add more brands or platforms as you upgrade.`,
    },
    {
      q: "Does the free plan include publishing to my connected account?",
      a: "Yes. After you approve a post, Kerygma Social can publish to your connected Facebook, Instagram, LinkedIn, or Pinterest account.",
    },
  ],
};
