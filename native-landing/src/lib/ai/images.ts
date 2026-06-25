import axios from "axios";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import type { buildResearchFromCrawl } from "@/lib/crawl/website";

type Research = ReturnType<typeof buildResearchFromCrawl>;

const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

let lastImageGenerationError: string | null = null;

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
}

function getGeminiImageModel() {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_GEMINI_IMAGE_MODEL;
}

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
    if (status === 401) {
      return `${provider} API key is invalid or expired — create a new key in the provider dashboard and update Vercel env vars.`;
    }
    return `${provider} failed (${status ?? "network"}): ${detail.slice(0, 240)}`;
  }
  if (error instanceof Error) {
    return `${provider} failed: ${error.message}`;
  }
  return `${provider} failed`;
}

export function isImageGenerationConfigured() {
  return Boolean(
    process.env.OPENAI_API_KEY?.trim() ||
      getGeminiApiKey() ||
      process.env.IDEOGRAM_API_KEY?.trim(),
  );
}

export function getImageGenerationProviders() {
  return {
    openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
    gemini: Boolean(getGeminiApiKey()),
    ideogram: Boolean(process.env.IDEOGRAM_API_KEY?.trim()),
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()),
  };
}

export function consumeLastImageGenerationError() {
  const error = lastImageGenerationError;
  lastImageGenerationError = null;
  return error;
}

export function buildImagePrompt(
  content: string,
  research: Research,
  platform = "linkedin",
) {
  const topic = research.keyTopics?.[0] ?? research.companyName;
  const isInstagram = platform.toLowerCase() === "instagram";

  return [
    `Professional social media graphic for ${research.companyName}.`,
    `Industry: ${research.industry}.`,
    `Theme: ${topic}.`,
    `Inspired by this post: ${content.slice(0, 220)}.`,
    isInstagram
      ? "Square 1:1 Instagram feed image, bold visual hook, mobile-first, vibrant but on-brand."
      : "Clean composition, warm lighting, no text, no logos, no watermarks.",
    "No text, no logos, no watermarks.",
  ].join(" ");
}

function usesCloudDatabase() {
  const url = process.env.DATABASE_URL?.toLowerCase() ?? "";
  return (
    url.includes("neon.tech") ||
    url.includes("supabase.co") ||
    url.includes("vercel-storage.com") ||
    Boolean(process.env.VERCEL)
  );
}

async function persistImageBuffer(buffer: Buffer): Promise<string> {
  const filename = `${randomUUID()}.png`;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (blobToken) {
    const blob = await put(`generated/${filename}`, buffer, {
      access: "public",
      contentType: "image/png",
      token: blobToken,
    });
    return blob.url;
  }

  if (process.env.VERCEL || usesCloudDatabase()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required when using Neon or deploying to Vercel. Add the token from Vercel → Storage → Blob to .env.local and Vercel env vars so images upload to cloud storage.",
    );
  }

  const dir = join(process.cwd(), "public", "generated");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), buffer);
  return `/generated/${filename}`;
}

async function persistRemoteImageUrl(url: string) {
  if (url.startsWith("/generated/") || url.includes("blob.vercel-storage.com")) {
    return url;
  }

  const response = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
    timeout: 60_000,
  });
  return persistImageBuffer(Buffer.from(response.data));
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
  return persistRemoteImageUrl(image.url);
}

async function saveBase64Image(b64: string) {
  const buffer = Buffer.from(b64, "base64");
  return persistImageBuffer(buffer);
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
    return persistRemoteImageUrl(image.url);
  }
  if (image?.b64_json) {
    return saveBase64Image(image.b64_json);
  }
  throw new Error("OpenAI returned no image data");
}

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: { mimeType?: string; data?: string };
        inline_data?: { mime_type?: string; data?: string };
      }>;
    };
  }>;
};

async function generateWithGemini(prompt: string) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is not set");
  }

  const model = getGeminiImageModel();
  const response = await axios.post<GeminiGenerateResponse>(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    },
    {
      timeout: 120_000,
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      validateStatus: (status) => status >= 200 && status < 300,
    },
  );

  const parts = response.data.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData ?? part.inline_data;
    if (inline?.data) {
      return saveBase64Image(inline.data);
    }
  }

  throw new Error("Gemini returned no image data");
}

export async function generatePostImage(prompt: string): Promise<string | null> {
  if (process.env.OPENAI_API_KEY?.trim()) {
    try {
      const url = await generateWithOpenAI(prompt);
      lastImageGenerationError = null;
      return url;
    } catch (error) {
      setImageError(formatAxiosError("OpenAI", error));
    }
  }

  if (getGeminiApiKey()) {
    try {
      const url = await generateWithGemini(prompt);
      lastImageGenerationError = null;
      return url;
    } catch (error) {
      setImageError(formatAxiosError("Gemini", error));
    }
  }

  if (process.env.IDEOGRAM_API_KEY?.trim()) {
    try {
      const url = await generateWithIdeogram(prompt);
      lastImageGenerationError = null;
      return url;
    } catch (error) {
      setImageError(formatAxiosError("Ideogram", error));
      return null;
    }
  }

  setImageError("No image provider API keys are configured");
  return null;
}

export async function generateImagesForPosts(
  posts: Array<{ content: string }>,
  research: Research,
  platform = "linkedin",
) {
  if (!isImageGenerationConfigured()) {
    return posts.map(() => null);
  }

  lastImageGenerationError = null;
  const imageUrls: Array<string | null> = [];

  if (posts.length > 0) {
    const probeUrl = await generatePostImage(
      buildImagePrompt(posts[0]!.content, research, platform),
    );
    if (!probeUrl && lastImageGenerationError) {
      return posts.map(() => null);
    }
    imageUrls.push(probeUrl);
  }

  for (let index = 1; index < posts.length; index += 2) {
    const batch = posts.slice(index, index + 2);
    const batchUrls = await Promise.all(
      batch.map(async (post) => {
        const prompt = buildImagePrompt(post.content, research, platform);
        return generatePostImage(prompt);
      }),
    );
    imageUrls.push(...batchUrls);
  }

  return imageUrls;
}

export async function probeImageProviders() {
  const probePrompt = "warm abstract social media background, no text, no logos";
  const results: {
    openai: { configured: boolean; ok: boolean; status: number; message: string } | null;
    gemini: { configured: boolean; ok: boolean; status: number; message: string } | null;
    ideogram: { configured: boolean; ok: boolean; status: number; message: string } | null;
  } = { openai: null, gemini: null, ideogram: null };

  if (process.env.OPENAI_API_KEY?.trim()) {
    try {
      const response = await axios.get("https://api.openai.com/v1/models", {
        timeout: 15_000,
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY.trim()}`,
        },
        validateStatus: () => true,
      });
      results.openai = {
        configured: true,
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message:
          response.status === 401
            ? "API key invalid or expired"
            : response.status >= 200 && response.status < 300
              ? "ok"
              : JSON.stringify(response.data).slice(0, 120),
      };
    } catch (error) {
      results.openai = {
        configured: true,
        ok: false,
        status: 0,
        message: error instanceof Error ? error.message : "request failed",
      };
    }
  }

  const geminiApiKey = getGeminiApiKey();
  if (geminiApiKey) {
    const model = getGeminiImageModel();
    try {
      const response = await axios.get(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}`,
        {
          timeout: 15_000,
          headers: {
            "x-goog-api-key": geminiApiKey,
          },
          validateStatus: () => true,
        },
      );
      results.gemini = {
        configured: true,
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message:
          response.status === 401 || response.status === 403
            ? "API key invalid or expired"
            : response.status >= 200 && response.status < 300
              ? "ok"
              : JSON.stringify(response.data).slice(0, 120),
      };
    } catch (error) {
      results.gemini = {
        configured: true,
        ok: false,
        status: 0,
        message: error instanceof Error ? error.message : "request failed",
      };
    }
  }

  if (process.env.IDEOGRAM_API_KEY?.trim()) {
    try {
      const response = await axios.post(
        "https://api.ideogram.ai/v1/ideogram-v3/generate",
        {
          prompt: probePrompt,
          aspect_ratio: "1x1",
          rendering_speed: "TURBO",
          style_type: "GENERAL",
        },
        {
          timeout: 30_000,
          headers: {
            "Api-Key": process.env.IDEOGRAM_API_KEY.trim(),
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        },
      );
      results.ideogram = {
        configured: true,
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        message:
          response.status === 401
            ? "API key invalid or expired"
            : response.status >= 200 && response.status < 300
              ? "ok"
              : JSON.stringify(response.data).slice(0, 120),
      };
    } catch (error) {
      results.ideogram = {
        configured: true,
        ok: false,
        status: 0,
        message: error instanceof Error ? error.message : "request failed",
      };
    }
  }

  return results;
}

export function imageGenerationHint(options: {
  configured: boolean;
  generated: number;
  error?: string | null;
  isVercel?: boolean;
}) {
  const { configured, generated, error, isVercel } = options;
  const { blob } = getImageGenerationProviders();

  if (!configured) {
    return isVercel
      ? "Add OPENAI_API_KEY (with GEMINI_API_KEY and/or IDEOGRAM_API_KEY as fallbacks) in Vercel → Settings → Environment Variables, then redeploy."
      : "Add OPENAI_API_KEY, GEMINI_API_KEY, or IDEOGRAM_API_KEY to native-landing/.env.local and restart the dev server.";
  }

  if (!blob && (isVercel || usesCloudDatabase())) {
    return "Add BLOB_READ_WRITE_TOKEN from Vercel → Storage → Blob to .env.local and Vercel env vars so images upload to cloud storage.";
  }

  if (generated > 0) {
    return null;
  }

  if (error) {
    return `No images were created — ${error}`;
  }

  return isVercel
    ? "No images were created — check OPENAI_API_KEY on Vercel (and BLOB_READ_WRITE_TOKEN), or GEMINI_API_KEY / IDEOGRAM_API_KEY as fallbacks."
    : "No images were created — check OPENAI_API_KEY, GEMINI_API_KEY, or IDEOGRAM_API_KEY in native-landing/.env.local.";
}
