import Anthropic from "@anthropic-ai/sdk";
import type { buildResearchFromCrawl } from "@/lib/crawl/website";

type Research = ReturnType<typeof buildResearchFromCrawl>;

let client: Anthropic | null = null;

function getAnthropic() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

function charLimitForPlatform(platform: string) {
  return platform === "linkedin" ? 3000 : 280;
}

function templateRefine(
  content: string,
  instruction: string,
  platform: string,
  brandName: string,
) {
  const limit = charLimitForPlatform(platform);
  const lower = instruction.toLowerCase();
  let primary = content;

  if (lower.includes("shorter") || lower.includes("brief")) {
    primary = content.split(/[.!?]/).filter(Boolean).slice(0, 2).join(". ").trim();
    if (primary && !primary.endsWith(".")) primary += ".";
  } else if (lower.includes("friendlier") || lower.includes("warmer")) {
    primary = `At ${brandName}, we love sharing this with you: ${content}`;
  } else if (lower.includes("professional")) {
    primary = content.replace(/!/g, ".").replace(/\s+/g, " ").trim();
  } else {
    primary = `${content}\n\n(${instruction.trim()})`;
  }

  const alternate =
    lower.includes("question") || lower.includes("ask")
      ? `What would it mean for your week if ${brandName} helped with this? ${content}`
      : `${brandName}: ${content}`;

  const trim = (value: string) =>
    value.length > limit ? `${value.slice(0, limit - 1).trim()}…` : value;

  return {
    captions: [trim(primary), trim(alternate)].filter(
      (value, index, array) => array.indexOf(value) === index,
    ),
    source: "template" as const,
  };
}

export async function refinePostWithAI(input: {
  content: string;
  platform: string;
  instruction: string;
  brandName: string;
  research?: Research | null;
}) {
  const { content, platform, instruction, brandName, research } = input;
  const limit = charLimitForPlatform(platform);

  if (!process.env.ANTHROPIC_API_KEY) {
    return templateRefine(content, instruction, platform, brandName);
  }

  try {
    const message = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You refine social media post captions for ${brandName}.

Platform: ${platform}
Character limit per caption: ${limit}
Brand context:
${research ? JSON.stringify(research, null, 2) : "No extra brand research available."}

Current caption:
"""
${content}
"""

User instruction (plain language):
"""
${instruction}
"""

Return exactly 2 distinct revised captions that follow the instruction while staying on-brand.
Rules:
- Each caption must be under ${limit} characters
- Keep the same language as the original unless the user asks to translate
- No hashtags spam, no emoji overload
- Return ONLY a JSON array of 2 strings`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No refined content returned");
    }

    const parsed = JSON.parse(textBlock.text) as string[];
    const captions = parsed
      .map((caption) => String(caption).trim())
      .filter(Boolean)
      .slice(0, 2);

    if (captions.length === 0) {
      throw new Error("Invalid refine response");
    }

    if (captions.length === 1) {
      captions.push(captions[0]!);
    }

    return { captions, source: "ai" as const };
  } catch {
    return templateRefine(content, instruction, platform, brandName);
  }
}

export function instructionWantsNewImage(instruction: string) {
  return /\b(image|photo|visual|picture|graphic|background|illustration)\b/i.test(
    instruction,
  );
}
