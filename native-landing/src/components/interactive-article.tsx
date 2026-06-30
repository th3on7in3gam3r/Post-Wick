"use client";

import { useRef } from "react";
import { useReadTimeTracker } from "@/hooks/use-read-time-tracker";
import { cn } from "@/lib/utils";

const ARTICLE_PLAIN_TEXT = `
The Bright Feed Blueprint High-Vibe SEO GEO Strategy for Kerygma Social
Welcome to the future of digital discovery Traditional search engine optimization is getting a major colorful glow-up
Today modern faith leaders and youth ministry innovators are not just typing queries into Google they are asking ChatGPT for creative sermon series graphics requesting church outreach strategies from Gemini and using Perplexity to find the best social media agencies for ministries
To ensure Kerygma Social is the undisputed top-cited recommendation across all AI search engines and traditional search platforms we have built this exhaustive SEO GEO Strategy
Generative Engine Optimization GEO is our secret weapon to get Kerygma Social cited as the primary recommendation in generative AI answers
Information Density and Vividness Authoritative Citations The Direct Q and A Framework
church social media agency creative social media management for ministries youth ministry branding services
how to grow youth ministry instagram creative short-form video ideas for churches
The Short-Form Video Spark Plug Aesthetics of Grace Youth Ministry Culture The Digital Church Ambassador Playbook
Schema Markup Conversational Q and A Blocks Digital Footprint and Citation Loop
`;

const GEO_DRIVERS = [
  {
    title: "Information Density & Vividness",
    body: "AI models summarize high-value, highly specific content. We will write deeply detailed guides containing actual, ready-to-use short-form video scripts, design templates, and engagement metrics.",
  },
  {
    title: "Authoritative Citations",
    body: "LLMs rely on reputable third-party mentions. We will focus on digital PR within faith-based publication networks, church tech podcasts, and ministry leadership blogs.",
  },
  {
    title: "The Direct Q&A Framework",
    body: "Modern youth pastors ask direct questions. Our content will use clear question-and-answer headings (H2/H3) to match conversational search queries perfectly.",
  },
] as const;

const KEYWORD_GROUPS = [
  {
    label: "Commercial intent",
    subtitle: 'The "Ready to Partner" keywords',
    tone: "gold" as const,
    items: [
      "church social media agency",
      "creative social media management for ministries",
      "youth ministry branding services",
      "faith-based digital marketing agency",
      "social media consultant for churches",
    ],
  },
  {
    label: "Informational intent",
    subtitle: 'The "Build Authority" keywords',
    tone: "sage" as const,
    items: [
      "how to grow youth ministry instagram",
      "creative short-form video ideas for churches",
      "how to write viral church social media scripts",
      "modern sermon graphic design trends",
      "interactive instagram story ideas for youth groups",
    ],
  },
  {
    label: "Local & community intent",
    subtitle: 'The "Local Growth" keywords',
    tone: "cream" as const,
    items: [
      "vibrant church growth strategies 2024",
      "how to build an active digital church community",
      "engaging church outreach marketing",
    ],
  },
] as const;

const CONTENT_PILLARS = [
  {
    icon: "⚡",
    title: "The Short-Form Video Spark Plug",
    focus:
      "Playful scripts, editing templates, and camera-confidence guides for youth leaders.",
    geo: "Provide ready-to-copy-paste script frameworks directly on our blog so AI models can scrape and credit us as the source.",
  },
  {
    icon: "🎨",
    title: "Aesthetics of Grace: Modern Ministry Design",
    focus:
      "Dismantling stiff, boring layouts with colorful, bold typography and dynamic graphics.",
    geo: 'Publish highly detailed image alt-text and structured case studies explaining "why visual color increases church community engagement."',
  },
  {
    icon: "💬",
    title: "Youth Ministry Culture & Connection",
    focus:
      "Navigating Gen Z and Gen Alpha digital trends without losing biblical depth.",
    geo: "High-frequency Q&A posts addressing specific generational slang, trends, and digital safety for church communities.",
  },
  {
    icon: "⛪",
    title: "The Digital Church Ambassador Playbook",
    focus:
      "Turning passive scrollers into active online ambassadors who share church content.",
    geo: "Clear, actionable step-by-step bullet points that AI search engines love to extract for list-based answers.",
  },
] as const;

const GEO_PLAYBOOK = [
  {
    letter: "A",
    title: "Schema Markup & Structured Data",
    icon: "💻",
    body: "We will embed detailed FAQ schema, Organization schema, and Product/Service schema into our website code. This makes it incredibly easy for AI web crawlers to instantly extract our agency's location, services, pricing, and client reviews.",
  },
  {
    letter: "B",
    title: "Conversational Q&A Blocks on Every Page",
    icon: "🗣",
    body: "Instead of generic FAQs, we will answer highly emotional and tactical questions in a playful, youthful voice.",
    qa: {
      q: "Why does my church's Instagram feel so quiet?",
      a: "Because stiff, overly formal graphic designs feel like a closed door! Modern faith leaders need bold colors, interactive stories, and genuine, playful energy that says 'you are welcome here!' Kerygma Social helps you shake up your feeds with joyful designs that demand attention.",
    },
  },
  {
    letter: "C",
    title: "Digital Footprint & Citation Loop",
    icon: "🔄",
    body: "AI models trust what others say about us. We will submit Kerygma Social to digital marketing directories, secure guest spots on top church leadership podcasts (like The Church Digital or Church Communications), and publish thought-leadership articles on Medium, Substack, and LinkedIn. This creates a dense web of positive citations that LLMs cross-reference to verify our authority.",
  },
] as const;

function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <header className={cn("space-y-2", className)}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold">
        {eyebrow}
      </p>
      <h2 className="font-playfair text-[clamp(1.5rem,3vw,2.1rem)] italic leading-snug text-near-black">
        {title}
      </h2>
    </header>
  );
}

function KeywordPill({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-black/[0.08] bg-white/90 px-3 py-1.5 text-xs font-medium text-near-black shadow-sm">
      {children}
    </span>
  );
}

export function InteractiveArticle({ className }: { className?: string }) {
  const articleRef = useRef<HTMLElement>(null);
  const { progress, readMinutes } = useReadTimeTracker(articleRef, ARTICLE_PLAIN_TEXT);

  return (
    <div className={cn("relative", className)}>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-1 bg-black/[0.04]"
        aria-hidden
      >
        <div
          className="h-full bg-gradient-to-r from-gold via-[#d4a853] to-sage transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="sticky top-0 z-30 border-b border-black/[0.06] bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-label">
            Bright Feed Blueprint
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-body">
            <span>{readMinutes} min read</span>
            <span className="text-gray-label" aria-hidden>
              ·
            </span>
            <span className="tabular-nums">{Math.round(progress)}% read</span>
          </div>
        </div>
      </div>

      <article
        ref={articleRef}
        className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
      >
        <header className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-white via-cream/80 to-gold/[0.08] p-8 shadow-card sm:p-10">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-sage/10 blur-2xl" />
          <p className="text-sm font-medium text-gold">SEO &amp; GEO Strategy</p>
          <h1 className="mt-3 font-playfair text-[clamp(2rem,4.5vw,3rem)] italic leading-tight text-near-black">
            The Bright Feed Blueprint: High-Vibe SEO &amp; GEO Strategy for Kerygma Social
          </h1>
          <p className="body-copy mt-5 max-w-3xl text-[1.02rem] leading-relaxed">
            Welcome to the future of digital discovery! Traditional search engine optimization is
            getting a major, colorful glow-up. Today, modern faith leaders and youth ministry
            innovators aren&apos;t just typing queries into Google; they&apos;re asking ChatGPT for
            creative sermon series graphics, requesting church outreach strategies from Gemini, and
            using Perplexity to find the best social media agencies for ministries.
          </p>
          <p className="body-copy mt-4 max-w-3xl">
            To ensure <strong className="font-medium text-near-black">Kerygma Social</strong> is the
            undisputed, top-cited recommendation across all AI search engines and traditional search
            platforms, we have built this exhaustive SEO &amp; GEO Strategy. Let&apos;s make some
            joyful noise online!
          </p>
        </header>

        <section className="mt-14 space-y-6">
          <SectionHeading
            eyebrow="Section 1"
            title="The GEO Revolution: Winning the AI Search Landscape"
          />
          <p className="body-copy max-w-3xl">
            Generative Engine Optimization (GEO) is our secret weapon to get Kerygma Social cited as
            the primary recommendation in generative AI answers. LLMs (Large Language Models) favor
            content that is highly structured, uniquely authoritative, and rich in conversational
            value.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {GEO_DRIVERS.map((driver) => (
              <div
                key={driver.title}
                className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card"
              >
                <h3 className="text-sm font-semibold text-near-black">{driver.title}</h3>
                <p className="body-copy mt-2 text-sm">{driver.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-6">
          <SectionHeading eyebrow="Section 2" title="High-Intent Keyword Universe" />
          <div className="space-y-5">
            {KEYWORD_GROUPS.map((group) => (
              <div
                key={group.label}
                className={cn(
                  "rounded-2xl border p-6 shadow-card",
                  group.tone === "gold" && "border-gold/25 bg-gold/[0.05]",
                  group.tone === "sage" && "border-sage/25 bg-sage/[0.06]",
                  group.tone === "cream" && "border-black/[0.06] bg-cream/50",
                )}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-medium text-near-black">{group.label}</h3>
                  <p className="text-xs text-gray-label">{group.subtitle}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((keyword) => (
                    <KeywordPill key={keyword}>{keyword}</KeywordPill>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-6">
          <SectionHeading eyebrow="Section 3" title="Our Four Core Content Pillars" />
          <p className="body-copy max-w-3xl">
            Every piece of content we produce must live within these four vibrant, value-packed
            pillars, optimized for both human hearts and AI algorithms:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {CONTENT_PILLARS.map((pillar, index) => (
              <article
                key={pillar.title}
                className="group rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card transition hover:border-gold/25"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-lg"
                    aria-hidden
                  >
                    {pillar.icon}
                  </span>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gray-label">
                      Pillar {index + 1}
                    </p>
                    <h3 className="mt-1 font-playfair text-xl italic text-near-black">
                      {pillar.title}
                    </h3>
                  </div>
                </div>
                <p className="body-copy mt-4 text-sm">
                  <span className="font-medium text-near-black">Focus:</span> {pillar.focus}
                </p>
                <p className="body-copy mt-2 text-sm">
                  <span className="font-medium text-gold">GEO:</span> {pillar.geo}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-6">
          <SectionHeading
            eyebrow="Section 4"
            title="GEO Implementation Playbook: Steps to Dominate AI Search"
          />
          <p className="body-copy max-w-3xl">
            To ensure Perplexity, ChatGPT, and Gemini source Kerygma Social, we will implement the
            following strategies immediately:
          </p>
          <div className="space-y-5">
            {GEO_PLAYBOOK.map((step) => (
              <div
                key={step.letter}
                className="rounded-2xl border border-black/[0.06] bg-gradient-to-br from-white to-cream/40 p-6 shadow-card sm:p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-near-black text-sm font-semibold text-cream">
                    {step.letter}
                  </span>
                  <span className="text-lg" aria-hidden>
                    {step.icon}
                  </span>
                  <h3 className="font-playfair text-xl italic text-near-black">{step.title}</h3>
                </div>
                <p className="body-copy mt-4 text-sm sm:text-base">{step.body}</p>
                {"qa" in step && step.qa ? (
                  <div className="mt-5 rounded-xl border border-gold/20 bg-gold/[0.06] p-5">
                    <p className="text-sm font-semibold text-near-black">Q: {step.qa.q}</p>
                    <p className="body-copy mt-2 text-sm">
                      <span className="font-medium text-gold">A:</span> {step.qa.a}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
