import axios from "axios";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { buildResearchFromCrawl } from "@/lib/crawl/website";

type Research = ReturnType<typeof buildResearchFromCrawl>;

export function isImageGenerationConfigured() {
  return Boolean(process.env.IDEOGRAM_API_KEY || process.env.OPENAI_API_KEY);
}

export function buildImagePrompt(content: string, research: Research) {
  const topic = research.keyTopics?.[0] ?? research.companyName;
  return [
    `Professional social media graphic for ${research.companyName}.`,
    `Industry: ${research.industry}.`,
    `Theme: ${topic}.`,
    `Inspired by this post: ${content.slice(0, 220)}.`,
    "Clean composition, warm lighting, no text, no logos, no watermarks.",
  ].join(" ");
}

async function generateWithIdeogram(prompt: string) {
  const response = await axios.post<{
    data?: Array<{ url?: string; is_image_safe?: boolean }>;
  }>(
    "https://api.ideogram.ai/v1/ideogram-v3/generate",
    {
      prompt,
      aspect_ratio: "1x1",
      rendering_speed: "TURBO",
      style_type: "GENERAL",
    },
    {
      timeout: 90_000,
      headers: {
        "Api-Key": process.env.IDEOGRAM_API_KEY!,
        "Content-Type": "application/json",
      },
      validateStatus: (status) => status >= 200 && status < 300,
    },
  );

  const image = response.data.data?.find((item) => item.url);
  if (!image?.url) {
    throw new Error("Ideogram returned no image URL");
  }
  return image.url;
}

async function saveBase64Image(b64: string) {
  const buffer = Buffer.from(b64, "base64");
  const filename = `${randomUUID()}.png`;
  const dir = join(process.cwd(), "public", "generated");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), buffer);
  return `/generated/${filename}`;
}

async function generateWithOpenAI(prompt: string) {
  const response = await axios.post<{
    data?: Array<{ url?: string; b64_json?: string }>;
  }>(
    "https://api.openai.com/v1/images/generations",
    {
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
    },
    {
      timeout: 120_000,
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      validateStatus: (status) => status >= 200 && status < 300,
    },
  );

  const image = response.data.data?.[0];
  if (image?.url) {
    return image.url;
  }
  if (image?.b64_json) {
    return saveBase64Image(image.b64_json);
  }
  throw new Error("OpenAI returned no image data");
}

export async function generatePostImage(prompt: string): Promise<string | null> {
  if (process.env.IDEOGRAM_API_KEY) {
    try {
      return await generateWithIdeogram(prompt);
    } catch {
      // fall through to OpenAI
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateWithOpenAI(prompt);
    } catch {
      return null;
    }
  }

  return null;
}

export async function generateImagesForPosts(
  posts: Array<{ content: string }>,
  research: Research,
) {
  if (!isImageGenerationConfigured()) {
    return posts.map(() => null);
  }

  const imageUrls: Array<string | null> = [];

  for (let index = 0; index < posts.length; index += 2) {
    const batch = posts.slice(index, index + 2);
    const batchUrls = await Promise.all(
      batch.map(async (post) => {
        const prompt = buildImagePrompt(post.content, research);
        return generatePostImage(prompt);
      }),
    );
    imageUrls.push(...batchUrls);
  }

  return imageUrls;
}
