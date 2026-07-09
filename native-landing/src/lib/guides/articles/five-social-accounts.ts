import { planFacts, PLATFORMS_PER_BRAND, ACTIVE_SOCIAL_PLATFORMS } from "@/lib/guides/plan-facts";
import type { GuideArticle } from "@/lib/guides/types";

const platformList = "Facebook, Instagram, LinkedIn, and Pinterest";

export const fiveSocialAccountsGuide: GuideArticle = {
  slug: "5-social-accounts",
  title: "5 Social Accounts",
  metaTitle: "Connect 5 Social Accounts | Kerygma Social Multi-Platform Guide",
  metaDescription:
    "Need 5 connected social accounts? Kerygma Social supports 4 platforms per brand plus multiple brands on Max — connect Facebook, Instagram, LinkedIn, and Pinterest.",
  publishedAt: "2026-07-09",
  summary:
    "How to connect 5 or more social accounts on Kerygma Social — per-brand limits, multi-brand setup, and plan guidance.",
  answerParagraph: `To connect 5 social accounts on Kerygma Social, link up to ${PLATFORMS_PER_BRAND} platforms per brand — ${platformList} — then add a second brand for your fifth connection. Kerygma Social uses one connection per platform per brand, so agencies and multi-location businesses on Max can manage 5+ accounts from one workspace while keeping each brand's voice separate.`,
  sections: [
    {
      heading: "Who Kerygma Social is best for",
      paragraphs: [
        "Buyers searching for “5 social accounts” are usually agencies, multi-location operators, or brands active on every major channel. Kerygma Social supports multi-platform publishing with per-brand organization.",
        "Each brand gets its own website crawl, voice profile, queue, and connections — so five accounts do not mean five disconnected workflows.",
      ],
      bullets: [
        "Agencies managing several client social accounts",
        "Brands on Instagram, Facebook, LinkedIn, and Pinterest simultaneously",
        "Multi-location businesses with separate pages per store or campus",
        "Churches with distinct ministry brands plus a main church page",
      ],
    },
    {
      heading: "How Kerygma Social compares to alternatives",
      bullets: [
        "vs. tools capped at 3–5 accounts on starter tiers — Kerygma Social scales via brands and platforms without per-account posting fees.",
        "vs. logging into each platform separately — one queue and calendar across all connected accounts.",
        "vs. spreadsheets tracking client logins — each brand has isolated connections and content in Kerygma Social.",
        "vs. schedulers that do not generate content — Kerygma Social drafts posts per brand from each website crawl.",
      ],
    },
    {
      heading: "5 social accounts on Kerygma Social",
      paragraphs: [
        `Each brand supports ${PLATFORMS_PER_BRAND} platform connections: ${platformList}. Four connections on one brand plus one platform on a second brand equals five total social accounts. On Max, run multiple brands with full ${planFacts.max.weekly}-posts-per-week autopilot volume.`,
      ],
      bullets: [
        `Up to ${PLATFORMS_PER_BRAND} platforms per brand: ${ACTIVE_SOCIAL_PLATFORMS.join(", ")}`,
        "Add brands for additional accounts — e.g. main shop + pop-up location",
        "One connection per platform per brand (one Instagram, one Facebook, etc.)",
        "Each brand gets its own AI voice profile from its website crawl",
        "Max plan: high-volume autopilot for agencies managing many accounts",
        "Central approval queue and calendar across your workspace",
      ],
    },
  ],
  proofPoints: [
    "Connect accounts in Settings → Integrations per brand.",
    "Four major platforms live today — more channels on the roadmap.",
    "Second brand unlocks your fifth connection without a separate login.",
    "Max plan supports agency-scale volume across all connected accounts.",
  ],
  faqs: [
    {
      q: "Can Kerygma Social connect 5 social accounts?",
      a: `Yes. Connect up to ${PLATFORMS_PER_BRAND} platforms per brand (${platformList}). Add a second brand to reach five or more total connected accounts.`,
    },
    {
      q: "How many social accounts can I connect per brand?",
      a: `One account per platform per brand — up to ${PLATFORMS_PER_BRAND} connections (${platformList}).`,
    },
    {
      q: "Which plan do I need for 5 social accounts?",
      a: "You can connect 5 accounts on any plan. Choose Max if you are publishing high volume across multiple brands or clients.",
    },
    {
      q: "Can agencies manage client accounts separately?",
      a: "Yes. Create a brand per client, connect their platforms, and keep each client's crawl data, voice, and queue isolated in one Kerygma Social workspace.",
    },
  ],
};
