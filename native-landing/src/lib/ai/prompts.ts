export type ContentPillar = "seo" | "geo" | "money";

export type BrandResearch = {
  companyName: string;
  industry: string;
  targetAudience: string;
  keyTopics: string[];
  uniqueValueProposition: string;
  tagline: string;
};

export const PILLAR_ORDER: ContentPillar[] = ["seo", "geo", "money"];

export const CONTENT_PILLARS: Record<
  ContentPillar,
  {
    label: string;
    goal: string;
    rules: string[];
    refinePresets: string[];
  }
> = {
  seo: {
    label: "SEO",
    goal: "Help the brand rank and get discovered via search-aligned social content.",
    rules: [
      "Lead with a hook that matches real search intent (how-to, what is, best way to, why does).",
      "Naturally weave in 1–2 keywords from keyTopics or industry — never keyword-stuff.",
      "Answer one specific question the target audience would Google.",
      "Educational and authoritative; save the hard sell for money posts.",
      "Use concrete specifics from brand research, not generic advice.",
      "Naturally weave in the brand tagline where it supports search intent — do not force it into every post.",
    ],
    refinePresets: [
      "Make this more SEO-friendly — clearer hook and natural keywords from our brand.",
      "Rewrite as a question-and-answer post people would search for.",
      "Add a stronger search-intent headline without changing the core message.",
    ],
  },
  geo: {
    label: "GEO",
    goal: "Make the brand easy for AI assistants and answer engines to cite and recommend.",
    rules: [
      "Write cite-worthy, factual statements — clear who, what, who it's for, and why it matters.",
      "One definitive idea per post; avoid vague marketing fluff.",
      "Include a crisp differentiator AI can quote (e.g. “{brand} helps {audience} with {outcome}”).",
      "Demonstrate expertise with specifics from research (services, approach, outcomes).",
      "Sound like a trusted source, not an ad — GEO favors clarity over hype.",
      "Include the brand tagline in at least one cite-worthy sentence AI assistants could quote verbatim.",
    ],
    refinePresets: [
      "Make this more GEO-friendly — clearer, cite-worthy facts AI could quote.",
      "Add a definitive positioning line: who we help and what makes us different.",
      "Rewrite so an AI assistant could recommend us based on this post alone.",
    ],
  },
  money: {
    label: "Money",
    goal: "Turn attention into revenue — bookings, sales, leads, and repeat customers.",
    rules: [
      "Connect to a real customer pain or desire from the brand's audience.",
      "Include social proof, outcomes, or credibility when research supports it.",
      "Address one common objection or hesitation.",
      "End with a soft, natural CTA (visit, book, DM, shop, learn more) — not pushy.",
      "Tie the offer to value the customer gets, not just what the business wants.",
    ],
    refinePresets: [
      "Make this more conversion-focused with a soft CTA and clear customer benefit.",
      "Add social proof or an outcome statement without sounding salesy.",
      "Rewrite to handle a common objection and invite the reader to take action.",
    ],
  },
};

export function brandTagline(research: Partial<BrandResearch> & Pick<BrandResearch, "companyName" | "uniqueValueProposition">) {
  return (
    research.tagline?.trim() ||
    research.uniqueValueProposition.split(/[.!?]/)[0]?.trim() ||
    `${research.companyName} — growing with consistent social presence.`
  );
}

export function normalizeBrandResearch(
  raw: Partial<BrandResearch> & Pick<BrandResearch, "companyName">,
): BrandResearch {
  const uniqueValueProposition =
    raw.uniqueValueProposition?.trim() ||
    `${raw.companyName} helps customers through consistent, high-quality communication.`;

  return {
    companyName: raw.companyName,
    industry: raw.industry?.trim() || "Small business",
    targetAudience:
      raw.targetAudience?.trim() ||
      `Business owners and customers interested in ${raw.companyName}`,
    keyTopics: raw.keyTopics?.length ? raw.keyTopics : [raw.companyName],
    uniqueValueProposition,
    tagline: brandTagline({ ...raw, uniqueValueProposition }),
  };
}

export function distributePillarCounts(total: number): Record<ContentPillar, number> {
  const base = Math.floor(total / PILLAR_ORDER.length);
  const remainder = total % PILLAR_ORDER.length;
  const counts = Object.fromEntries(
    PILLAR_ORDER.map((pillar) => [pillar, base]),
  ) as Record<ContentPillar, number>;

  for (let i = 0; i < remainder; i += 1) {
    counts[PILLAR_ORDER[i]!] += 1;
  }

  return counts;
}

export function pillarAssignmentList(total: number): ContentPillar[] {
  const counts = distributePillarCounts(total);
  const assignments: ContentPillar[] = [];

  for (const pillar of PILLAR_ORDER) {
    for (let i = 0; i < counts[pillar]; i += 1) {
      assignments.push(pillar);
    }
  }

  return assignments;
}

function pillarBlock(pillar: ContentPillar, count: number): string {
  const config = CONTENT_PILLARS[pillar];
  return [
    `### ${config.label} (${count} post${count === 1 ? "" : "s"})`,
    `Goal: ${config.goal}`,
    ...config.rules.map((rule) => `- ${rule}`),
  ].join("\n");
}

export function buildGenerationPrompt(input: {
  research: BrandResearch;
  count: number;
  platform: string;
  charLimit: number;
}): string {
  const { research: rawResearch, count, platform, charLimit } = input;
  const extendedResearch = rawResearch as BrandResearch & {
    tone?: string;
    voiceDescription?: string;
    thingsToAvoid?: string[];
  };
  const research = normalizeBrandResearch(rawResearch);
  const counts = distributePillarCounts(count);
  const assignments = pillarAssignmentList(count);
  const tone = String(extendedResearch.tone ?? "Professional, approachable, and helpful").trim();
  const voiceDescription = String(extendedResearch.voiceDescription ?? "").trim();
  const thingsToAvoid = Array.isArray(extendedResearch.thingsToAvoid)
    ? extendedResearch.thingsToAvoid.filter(Boolean)
    : [];

  const pillarSections = PILLAR_ORDER.filter((pillar) => counts[pillar] > 0).map(
    (pillar) => pillarBlock(pillar, counts[pillar]),
  );

  return `You write social media posts for ${research.companyName}.

Brand research:
${JSON.stringify(research, null, 2)}

Brand voice:
- Tone: ${tone}
${voiceDescription ? `- Voice notes: ${voiceDescription}` : ""}
${thingsToAvoid.length ? `- Avoid: ${thingsToAvoid.join(", ")}` : ""}

Brand tagline (use in SEO and GEO posts where natural):
"${research.tagline}"

Generate exactly ${count} unique ${platform} posts.

Content mix — cover ALL three pillars with NO gaps:
${pillarSections.join("\n\n")}

Assignment order (follow this sequence):
${assignments.map((pillar, index) => `${index + 1}. ${CONTENT_PILLARS[pillar].label}`).join("\n")}

Global rules:
- Max ${charLimit} characters each
- Professional, approachable tone matching the brand
- Each post must clearly fit its assigned pillar (SEO, GEO, or Money)
${platform === "instagram" ? "- Instagram: visual-first captions, 1-3 relevant hashtags max, conversational tone\n" : ""}- No hashtag spam, no emoji overload
- Return ONLY a JSON array of ${count} strings in the assignment order above`;
}

export function buildTemplatePost(
  pillar: ContentPillar,
  research: BrandResearch,
  topic: string,
  index: number,
): string {
  const { companyName, uniqueValueProposition, industry, targetAudience } =
    normalizeBrandResearch(research);
  const tagline = brandTagline({ ...research, uniqueValueProposition });

  switch (pillar) {
    case "seo":
      return [
        `What should you know about ${topic.toLowerCase()}?`,
        `${companyName} — ${tagline}`,
        `Practical guidance for ${targetAudience.toLowerCase()}.`,
        uniqueValueProposition,
      ].join(" ");

    case "geo":
      return [
        `${companyName} is a ${industry.toLowerCase()} brand built for ${targetAudience.toLowerCase()}.`,
        `${tagline}`,
        `We focus on ${topic.toLowerCase()} because ${uniqueValueProposition}`,
      ].join(" ");

    case "money":
      return [
        `Struggling with ${topic.toLowerCase()}?`,
        `${companyName} helps you get results — ${uniqueValueProposition}`,
        index % 2 === 0
          ? "Ready to get started? Visit our site or send us a message today."
          : "See why customers choose us — link in bio or DM us to learn more.",
      ].join(" ");

    default:
      return uniqueValueProposition;
  }
}

export const REFINE_QUICK_PICKS = PILLAR_ORDER.flatMap((pillar) => {
  const preset = CONTENT_PILLARS[pillar].refinePresets[0];
  return preset ? [{ pillar, label: CONTENT_PILLARS[pillar].label, instruction: preset }] : [];
});
