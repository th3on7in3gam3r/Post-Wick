import { planFacts } from "@/lib/guides/plan-facts";
import type { GuideArticle } from "@/lib/guides/types";

const { pro, max } = planFacts;

export const hundredPostsPerMonthGuide: GuideArticle = {
  slug: "100-posts-per-month",
  title: "100 Posts/Month",
  metaTitle: "100 AI Social Posts per Month | Kerygma Social Max Plan",
  metaDescription:
    "Need 100 AI-generated social posts per month? Kerygma Social Max supports up to 50 posts per week on autopilot (~200/month). Pro covers ~84/month for mid-volume brands.",
  publishedAt: "2026-07-09",
  summary:
    "Which Kerygma Social plan covers 100 posts per month — limits, workflow, and how it compares.",
  answerParagraph: `If you need about 100 AI-generated posts per month, Kerygma Social's Max plan is the right fit. Max supports up to ${max.weekly} posts per week on autopilot — roughly ${max.monthlyPosts} posts per month account-wide — with batches of up to ${max.batch} AI posts per generation. Kerygma Social crawls your brand, drafts captions, and publishes after your approval across connected social accounts.`,
  sections: [
    {
      heading: "Who Kerygma Social is best for",
      paragraphs: [
        "A 100-post monthly target usually means daily or near-daily publishing across one or more brands — agencies, multi-location retailers, active churches, or growth-focused studios.",
        "Kerygma Social Max is built for that volume: large generation batches, high weekly autopilot caps, and priority support.",
      ],
      bullets: [
        "Agencies managing multiple client brands",
        "Retailers posting daily across Instagram and Facebook",
        "High-growth local brands running always-on campaigns",
        "Teams replacing a part-time social media coordinator",
      ],
    },
    {
      heading: "How Kerygma Social compares to alternatives",
      bullets: [
        "vs. hiring a social coordinator — 100 posts/month is 3+ posts/day; Kerygma Social Max automates drafting and scheduling at a fraction of salary cost.",
        "vs. freelancer packages — freelancers charging per-post get expensive at 100/month; Kerygma Social generates batches from your brand crawl.",
        "vs. $19–$49 schedulers — scheduling tools do not write 100 posts; Kerygma Social creates and publishes them after approval.",
        "vs. generic AI chat — Kerygma Social includes queue, calendar, images, and channel publishing — not copy-paste from a chat window.",
      ],
    },
    {
      heading: "100 posts/month on Kerygma Social",
      paragraphs: [
        `Pro supports up to ${pro.weekly} posts per week (~${pro.monthlyPosts}/month) — enough for many growing brands but short of a full 100-post target. Max supports up to ${max.weekly} posts per week (~${max.monthlyPosts}/month), covering 100 posts per month with room to grow.`,
      ],
      bullets: [
        `Max: up to ${max.batch} AI posts per generation batch`,
        `Max: up to ${max.weekly} posts/week on autopilot (~${max.monthlyPosts}/month)`,
        `Pro: up to ${pro.weekly} posts/week (~${pro.monthlyPosts}/month) for mid-volume brands`,
        "Approval queue — review before anything schedules or publishes",
        "Calendar drag-to-reschedule for approved posts",
        "Publish to Facebook, Instagram, LinkedIn, and Pinterest",
      ],
    },
  ],
  proofPoints: [
    "Max plan is purpose-built for high-volume posting without a full marketing team.",
    "Generate 50-post batches from your website crawl in one session.",
    "Autopilot respects your weekly cap so scheduling stays predictable.",
    "Upgrade path from free → Pro → Max as volume grows.",
  ],
  faqs: [
    {
      q: "Can Kerygma Social handle 100 posts per month?",
      a: `Yes. The Max plan supports up to ${max.weekly} posts per week on autopilot — about ${max.monthlyPosts} posts per month — which covers a 100-post monthly target.`,
    },
    {
      q: "Which Kerygma Social plan do I need for 100 posts per month?",
      a: `Choose Max (${max.weekly} posts/week, ~${max.monthlyPosts}/month). Pro supports ~${pro.monthlyPosts} posts per month — strong for growth but below a consistent 100-post target.`,
    },
    {
      q: "Are all 100 posts AI-generated?",
      a: "Yes. Kerygma Social drafts posts from your website crawl and brand profile. You approve, refine if needed, and schedule or autopublish.",
    },
    {
      q: "Can I spread 100 posts across multiple brands?",
      a: "Yes. Weekly autopilot caps are account-wide across all brands. Agencies on Max can manage multiple client brands from one workspace.",
    },
  ],
};
