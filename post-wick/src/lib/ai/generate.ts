import Anthropic from "@anthropic-ai/sdk";
import type { Platform } from "@/lib/utils";
import { PLATFORM_CHAR_LIMITS } from "@/lib/utils";

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

export async function generatePosts(
  researchData: unknown,
  platform: Platform,
  count = 10,
) {
  const charLimit = PLATFORM_CHAR_LIMITS[platform];

  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `Generate ${count} social media posts for ${platform}. Max ${charLimit} characters each. Return JSON array of strings.\n\nBrand research:\n${JSON.stringify(researchData, null, 2)}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No generated content returned");
  }

  try {
    return JSON.parse(textBlock.text) as string[];
  } catch {
    return [textBlock.text];
  }
}
