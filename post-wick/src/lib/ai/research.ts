import Anthropic from "@anthropic-ai/sdk";

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

export async function researchBrand(websiteUrl: string) {
  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Research this brand website and return structured JSON with: companyName, industry, targetAudience, tone, keyTopics, competitors, uniqueValueProposition.\n\nURL: ${websiteUrl}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No research content returned");
  }

  try {
    return JSON.parse(textBlock.text);
  } catch {
    return { raw: textBlock.text };
  }
}
