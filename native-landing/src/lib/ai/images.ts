import axios from "axios";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import type { buildResearchFromCrawl } from "@/lib/crawl/website";

type Research = ReturnType<typeof buildResearchFromCrawl>;

let lastImageGenerationError: string | null = null;

function setImageError(message: string) {
  lastImageGenerationError = message;
  console.error("[image-generation]", message);
}

function formatAxiosError(provider: string, error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail =
      typeof error.response?.data === "string"
        ? error.response.data
        : JSON.stringify(error.response?.data ?? error.message);
    return `${provider} failed (${status ?? "network"}): ${detail.slice(0, 240)}`;
  }
  if (error instanceof Error) {
    return `${provider} failed: ${error.message}`;
  }
  return `${provider} failed`;
}

export function isImageGenerationConfigured() {
  return Boolean(process.env.IDEOGRAM_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim());
}

export function getImageGenerationProviders() {
  return {
    ideogram: Boolean(process.env.IDEOGRAM_API_KEY?.trim()),
    openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()),
  };
}

export function consumeLastImageGenerationError() {
  const error = lastImageGenerationError;
  lastImageGenerationError = null;
  return error;
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
        "Api-Key": process.env.IDEOGRAM_API_KEY!.trim(),
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

  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    const blob = await put(`generated/${filename}`, buffer, {
      access: "public",
      contentType: "image/png",
      token: process.env.BLOB_READ_WRITE_TOKEN.trim(),
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "OpenAI returned base64 image data but BLOB_READ_WRITE_TOKEN is not set on Vercel",
    );
  }

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
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!.trim()}`,
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
  if (process.env.IDEOGRAM_API_KEY?.trim()) {
    try {
      return await generateWithIdeogram(prompt);
    } catch (error) {
      setImageError(formatAxiosError("Ideogram", error));
    }
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    try {
      return await generateWithOpenAI(prompt);
    } catch (error) {
      setImageError(formatAxiosError("OpenAI", error));
      return null;
    }
  }

  setImageError("No image provider API keys are configured");
  return null;
}

export async function generateImagesForPosts(
  posts: Array<{ content: string }>,
  research: Research,
) {
  if (!isImageGenerationConfigured()) {
    return posts.map(() => null);
  }

  lastImageGenerationError = null;
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

export function imageGenerationHint(options: {
  configured: boolean;
  generated: number;
  error?: string | null;
  isVercel?: boolean;
}) {
  const { configured, generated, error, isVercel } = options;

  if (!configured) {
    return isVercel
      ? "Add IDEOGRAM_API_KEY (and optionally OPENAI_API_KEY) in Vercel → Settings → Environment Variables, then redeploy."
      : "Add IDEOGRAM_API_KEY or OPENAI_API_KEY to native-landing/.env.local and restart the dev server.";
  }

  if (generated > 0) {
    return null;
  }

  if (error) {
    return `No images were created — ${error}`;
  }

  return isVercel
    ? "No images were created — verify IDEOGRAM_API_KEY in Vercel env vars and check deployment logs."
    : "No images were created — check IDEOGRAM_API_KEY or OPENAI_API_KEY in native-landing/.env.local.";
}
