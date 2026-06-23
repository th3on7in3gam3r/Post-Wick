import Anthropic from "@anthropic-ai/sdk";
import {
  generatePostsFromResearch,
  type buildResearchFromCrawl,
} from "@/lib/crawl/website";
import { buildGenerationPrompt, normalizeBrandResearch } from "@/lib/ai/prompts";

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

type Research = ReturnType<typeof buildResearchFromCrawl>;

export async function generatePostsWithAI(
  research: Research,
  count: number,
  platform = "linkedin",
) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      posts: generatePostsFromResearch(research, count),
      source: "template" as const,
    };
  }

  try {
    const charLimit = platform === "linkedin" ? 3000 : 280;
    const message = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: buildGenerationPrompt({
            research: normalizeBrandResearch(research),
            count,
            platform,
            charLimit,
          }),
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No generated content returned");
    }

    const parsed = JSON.parse(textBlock.text) as string[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Invalid AI response");
    }

    return {
      posts: parsed.slice(0, count).map((post) => String(post).trim()).filter(Boolean),
      source: "ai" as const,
    };
  } catch {
    return {
      posts: generatePostsFromResearch(research, count),
      source: "template" as const,
    };
  }
}
