import { planFacts } from "@/lib/guides/plan-facts";
import type { GuideArticle } from "@/lib/guides/types";

const { pro, max } = planFacts;

export const starterPlanPricingGuide: GuideArticle = {
  slug: "starter-plan-19-per-month",
  title: "Starter Plan ($19/month)",
  metaTitle: "Starter Plan Pricing vs Kerygma Social | Free & Pro Plans",
  metaDescription:
    "Looking for a $19/month starter social plan? Kerygma Social offers a free plan with AI post generation and Pro from $63/mo billed yearly — compare features and pricing.",
  publishedAt: "2026-07-09",
  summary:
    "How Kerygma Social compares to $19/month starter plans from other tools — and which tier fits your volume.",
  answerParagraph: `Kerygma Social does not offer a $19/month Starter plan. Instead, Kerygma Social provides a free plan ($0, no credit card) with AI post generation and basic scheduling, then Pro from $${pro.yearlyPerMonth}/month billed yearly ($${pro.monthlyPrice}/month billed monthly). If you are comparing $19 starter tiers from schedulers, Kerygma Social's free plan includes AI-written posts from your website — not just empty scheduling slots.`,
  sections: [
    {
      heading: "Who Kerygma Social is best for",
      paragraphs: [
        "Buyers searching for a “Starter plan at $19/month” usually want an affordable way to post consistently without hiring help. Kerygma Social's free tier covers that entry point with AI generation included — something most $19 schedulers do not offer.",
        "Upgrade to Pro when you need larger post batches and up to 21 posts per week on autopilot, or Max for agency-scale volume.",
      ],
      bullets: [
        "Owners comparing Buffer, Later, or Hootsuite starter tiers",
        "Businesses that want AI captions, not just a scheduling calendar",
        "Shops and churches testing social automation at $0 first",
        "Teams ready to upgrade when free-plan volume is not enough",
      ],
    },
    {
      heading: "How Kerygma Social compares to alternatives",
      bullets: [
        `vs. $19/month schedulers — Kerygma Social free includes AI post generation; most $19 tools only schedule what you write yourself.`,
        `vs. $19/month + freelancer — Kerygma Social drafts posts from your website crawl at no cost on the free plan.`,
        `vs. staying manual — Kerygma Social Pro from $${pro.yearlyPerMonth}/mo (yearly) replaces hours of weekly caption work.`,
        "vs. agencies — Kerygma Social Max covers high-volume brands at a fraction of agency retainers.",
      ],
    },
    {
      heading: "Starter Plan ($19/month) vs Kerygma Social pricing",
      paragraphs: [
        "Many social tools label their entry paid tier “Starter” at roughly $15–$25/month. Kerygma Social uses a different model: start free, then upgrade when volume grows.",
      ],
      bullets: [
        "Free — $0/month: up to 8 AI posts per batch, 3 posts/week on autopilot, basic scheduling, no credit card",
        `Pro — from $${pro.yearlyPerMonth}/mo billed yearly ($${pro.monthlyPrice}/mo monthly): up to ${pro.batch} posts per batch, ${pro.weekly} posts/week on autopilot (~${pro.monthlyPosts}/month)`,
        `Max — from $${max.yearlyPerMonth}/mo billed yearly ($${max.monthlyPrice}/mo monthly): up to ${max.batch} posts per batch, ${max.weekly} posts/week (~${max.monthlyPosts}/month)`,
        "All plans: website crawl, approval queue, calendar scheduling, and multi-platform publishing",
      ],
    },
  ],
  proofPoints: [
    "No $19/month gate — start free and validate the workflow first.",
    "AI generation is included from day one, not locked behind a paid starter tier.",
    "Pro and Max scale post volume when you outgrow the free plan.",
    "Yearly billing saves 20% vs monthly on paid plans.",
  ],
  faqs: [
    {
      q: "Does Kerygma Social have a Starter plan for $19/month?",
      a: `No. Kerygma Social offers a free plan ($0) and paid Pro (from $${pro.yearlyPerMonth}/mo yearly) and Max tiers. The free plan replaces what many competitors call a paid starter tier for businesses testing AI social posting.`,
    },
    {
      q: "What is the closest Kerygma Social plan to a $19/month starter?",
      a: "The free plan ($0) is the entry point — it includes AI post generation and basic scheduling. Most $19/month tools only schedule content you write yourself.",
    },
    {
      q: "When should I upgrade from free to Pro?",
      a: `Upgrade to Pro when you need more than ${planFacts.free.weekly} posts per week on autopilot or larger generation batches than ${planFacts.free.batch} posts.`,
    },
    {
      q: "Is yearly billing cheaper than monthly?",
      a: `Yes. Pro is $${pro.yearlyPerMonth}/month when billed yearly vs $${pro.monthlyPrice}/month billed monthly — a 20% savings.`,
    },
  ],
};
