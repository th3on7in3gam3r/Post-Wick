export const IMAGE_STYLE_PRESET_IDS = [
  "auto",
  "faith-community",
  "kids-playful",
  "food-hospitality",
  "technology",
  "health-wellness",
  "small-business",
] as const;

export type ImageStylePresetId = (typeof IMAGE_STYLE_PRESET_IDS)[number];

export type ImageStyle = {
  medium: string;
  aesthetic: string;
  palette: string;
  lighting: string;
};

export const IMAGE_STYLE_OPTIONS: Array<{
  id: ImageStylePresetId;
  label: string;
  description: string;
}> = [
  {
    id: "auto",
    label: "Auto-detect",
    description: "Match style to your industry and brand content.",
  },
  {
    id: "faith-community",
    label: "Faith & ministry",
    description:
      "Cosmic space adventure, glowing accents, premium kids-ministry poster art.",
  },
  {
    id: "kids-playful",
    label: "Kids & games",
    description:
      "Retro pixel accents, floating game icons, high-energy playful illustration.",
  },
  {
    id: "food-hospitality",
    label: "Food & hospitality",
    description: "Rich editorial food photography with warm, appetizing styling.",
  },
  {
    id: "technology",
    label: "Technology",
    description: "Sleek geometric illustration with futuristic gradients.",
  },
  {
    id: "health-wellness",
    label: "Health & wellness",
    description: "Calming lifestyle art with organic shapes and airy light.",
  },
  {
    id: "small-business",
    label: "Small business",
    description: "Bold editorial illustration with confident studio polish.",
  },
];

const STYLE_PRESETS: Record<Exclude<ImageStylePresetId, "auto">, ImageStyle> = {
  "faith-community": {
    medium:
      "vibrant custom digital illustration with clean rounded 3D-style icons and playful hand-drawn energy",
    aesthetic:
      "premium kids-ministry poster art, cosmic space adventure vibe, glowing accents, floating stars, planets and subtle pixel-art flourishes, joyful and wonder-filled",
    palette:
      "deep indigo and royal purple background with electric blue, warm gold, coral pink and mint highlights",
    lighting: "soft neon glow, luminous highlights, gentle depth and atmosphere",
  },
  "kids-playful": {
    medium:
      "bold custom illustration blending modern rounded 3D icons with chunky retro pixel-art stickers",
    aesthetic:
      "playful kids-brand poster art, floating game controllers, trophies, coins and stars as decorative stickers, high-energy and delightful, feels like a premium game launch",
    palette:
      "vibrant purple background with orange, gold, teal and primary-color accents",
    lighting: "bright cheerful highlights with soft glow and dimensional depth",
  },
  "food-hospitality": {
    medium: "rich editorial food photography styled like a premium magazine spread",
    aesthetic:
      "appetizing hero shot, artful plating, natural props and textures, shallow depth of field, mouth-watering and inviting",
    palette: "warm earthy tones with fresh vivid accents from the ingredients",
    lighting: "warm directional window light with soft shadows",
  },
  technology: {
    medium: "modern geometric vector illustration with subtle 3D depth and gradient shapes",
    aesthetic:
      "sleek futuristic tech-brand art, abstract data motifs, floating UI elements, confident and innovative",
    palette: "deep navy or charcoal base with vivid electric blue, violet and cyan gradients",
    lighting: "crisp studio glow with soft ambient reflections",
  },
  "health-wellness": {
    medium: "clean lifestyle illustration blended with soft natural photography textures",
    aesthetic:
      "calming aspirational wellness art, sense of movement and vitality, organic shapes, uplifting and fresh",
    palette: "soft sage green, warm cream, coral and sky-blue tones",
    lighting: "bright airy natural light, gentle glow",
  },
  "small-business": {
    medium: "bold modern editorial illustration with strong graphic shapes and depth",
    aesthetic:
      "confident branded marketing art, dynamic composition, energetic and trustworthy, feels intentionally designed by a studio",
    palette: "rich brand-forward color with one high-energy accent color",
    lighting: "clean directional light with subtle dimensional shadows",
  },
};

const INDUSTRY_TO_PRESET: Record<string, Exclude<ImageStylePresetId, "auto">> = {
  "faith & community": "faith-community",
  "food & hospitality": "food-hospitality",
  technology: "technology",
  "health & wellness": "health-wellness",
  "small business": "small-business",
};

export type ImageStyleResearch = {
  industry?: string;
  companyName?: string;
  summary?: string;
  keyTopics?: string[];
  imageStylePreset?: ImageStylePresetId | string | null;
};

export function parseImageStylePreset(
  value: unknown,
): ImageStylePresetId {
  if (
    typeof value === "string" &&
    IMAGE_STYLE_PRESET_IDS.includes(value as ImageStylePresetId)
  ) {
    return value as ImageStylePresetId;
  }
  return "auto";
}

export function resolveImageStyle(research: ImageStyleResearch): ImageStyle {
  const preset = parseImageStylePreset(research.imageStylePreset);
  if (preset !== "auto") {
    return STYLE_PRESETS[preset];
  }

  const industry = (research.industry ?? "").toLowerCase();
  const haystack =
    `${industry} ${research.companyName ?? ""} ${research.summary ?? ""} ${(research.keyTopics ?? []).join(" ")}`.toLowerCase();

  const isKidsOrGames = /\b(kid|kids|child|children|game|games|play|fun|youth|bible)\b/.test(
    haystack,
  );

  if (isKidsOrGames) {
    return STYLE_PRESETS["kids-playful"];
  }

  if (
    industry.includes("faith") ||
    industry.includes("church") ||
    industry.includes("ministry")
  ) {
    return STYLE_PRESETS["faith-community"];
  }

  const mapped = INDUSTRY_TO_PRESET[industry];
  if (mapped) {
    return STYLE_PRESETS[mapped];
  }

  return STYLE_PRESETS["small-business"];
}
