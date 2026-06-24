export type BrandVoiceForm = {
  companyName: string;
  industry: string;
  tone: string;
  voiceDescription: string;
  keyTopics: string[];
  thingsToAvoid: string[];
};

export const INDUSTRY_OPTIONS = [
  "Food & hospitality",
  "Health & wellness",
  "Faith & community",
  "Technology",
  "Retail & boutique",
  "Beauty & personal care",
  "Home services",
  "Professional services",
  "Small business",
] as const;

export type BrandResearchRecord = Record<string, unknown> & {
  companyName?: string;
  industry?: string;
  tone?: string;
  voiceDescription?: string;
  keyTopics?: string[];
  thingsToAvoid?: string[];
  summary?: string;
  uniqueValueProposition?: string;
};

export function brandVoiceFromResearch(research: BrandResearchRecord): BrandVoiceForm {
  const keyTopics = Array.isArray(research.keyTopics)
    ? research.keyTopics.map(String).filter(Boolean)
    : [];

  const thingsToAvoid = Array.isArray(research.thingsToAvoid)
    ? research.thingsToAvoid.map(String).filter(Boolean)
    : [];

  return {
    companyName: String(research.companyName ?? "").trim(),
    industry: String(research.industry ?? "Small business").trim(),
    tone: String(research.tone ?? "Professional, approachable, and helpful").trim(),
    voiceDescription: String(
      research.voiceDescription ??
        research.summary ??
        research.uniqueValueProposition ??
        "",
    ).trim(),
    keyTopics: keyTopics.length
      ? keyTopics
      : ["Your services", "Customer success", "Behind the scenes"],
    thingsToAvoid,
  };
}

export function mergeBrandVoiceIntoResearch(
  research: BrandResearchRecord,
  voice: BrandVoiceForm,
): BrandResearchRecord {
  return {
    ...research,
    companyName: voice.companyName.trim(),
    industry: voice.industry.trim(),
    tone: voice.tone.trim(),
    voiceDescription: voice.voiceDescription.trim(),
    keyTopics: voice.keyTopics.map((topic) => topic.trim()).filter(Boolean),
    thingsToAvoid: voice.thingsToAvoid.map((item) => item.trim()).filter(Boolean),
  };
}
