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

export async function refinePost(
  content: string,
  platform: Platform,
  instruction: string,
) {
  const charLimit = PLATFORM_CHAR_LIMITS[platform];

  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Refine this ${platform} post (max ${charLimit} chars) based on: "${instruction}"\n\nOriginal:\n${content}\n\nReturn only the refined post text.`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No refined content returned");
  }

  return textBlock.text.trim();
}
