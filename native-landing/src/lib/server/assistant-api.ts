import { z } from "zod";
import { createPostsWithOptionalImages, countPostsWithImages } from "@/lib/ai/create-posts";
import {
  getImageGenerationProviders,
  imageGenerationHint,
  isImageGenerationConfigured,
} from "@/lib/ai/images";
import { generatePostsWithAI } from "@/lib/ai/generate";
import {
  brandVoiceFromResearch,
  type BrandResearchRecord,
} from "@/lib/brand-voice";
import type { buildResearchFromCrawl } from "@/lib/crawl/website";
import {
  getBrandById,
  getBrandsByUserId,
  getCalendarPostsByUserId,
  getOrCreateUser,
  getPendingPostsByUserId,
  reschedulePost,
  scheduleApprovedPost,
  updatePostStatus,
  type PostRecord,
} from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { GENERATE_PLATFORMS } from "@/lib/platforms";
import { processDuePostsForUser } from "@/lib/publish/process-due";
import { WeeklyScheduleLimitError } from "@/lib/usage/schedule-limit";

type CrawlResearch = ReturnType<typeof buildResearchFromCrawl>;

export class AssistantApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AssistantApiError";
    this.status = status;
  }
}

function parseResearch(brand: {
  name: string;
  websiteUrl: string;
  researchData: string | null;
}): BrandResearchRecord & Partial<CrawlResearch> {
  if (!brand.researchData) {
    return {
      companyName: brand.name,
      websiteUrl: brand.websiteUrl,
      keyTopics: [brand.name],
    };
  }
  try {
    return JSON.parse(brand.researchData) as BrandResearchRecord &
      Partial<CrawlResearch>;
  } catch {
    return {
      companyName: brand.name,
      websiteUrl: brand.websiteUrl,
      keyTopics: [brand.name],
    };
  }
}

function researchForGeneration(
  brand: { name: string; websiteUrl: string; researchData: string | null },
): CrawlResearch {
  const research = parseResearch(brand);
  // Same shape the Clerk generate route passes after JSON.parse (any → Research).
  return research as CrawlResearch;
}

function summarizePost(post: PostRecord & { brandName?: string }) {
  const scheduled =
    post.status === "approved" && Boolean(post.scheduledAt)
      ? true
      : false;
  return {
    id: post.id,
    brandId: post.brandId,
    brandName: post.brandName,
    platform: post.platform,
    content: post.content,
    imageUrl: post.imageUrl,
    status: post.status,
    scheduledAt: post.scheduledAt,
    publishedAt: post.publishedAt,
    isScheduled: scheduled,
    publishError: post.publishError,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export async function listBrandsForUser(userId: string) {
  const brands = await getBrandsByUserId(userId);
  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    websiteUrl: brand.websiteUrl,
    crawlStatus: brand.crawlStatus,
    description: brand.description,
  }));
}

export async function getBrandForUser(userId: string, brandId: string) {
  const brand = await getBrandById(brandId, userId);
  if (!brand) {
    throw new AssistantApiError("Brand not found", 404);
  }

  const research = parseResearch(brand);
  const voice = brandVoiceFromResearch(research);

  return {
    id: brand.id,
    name: brand.name,
    websiteUrl: brand.websiteUrl,
    description: brand.description,
    crawlStatus: brand.crawlStatus,
    voice,
    research: {
      companyName: research.companyName ?? brand.name,
      industry: research.industry ?? null,
      tone: research.tone ?? null,
      voiceDescription: research.voiceDescription ?? research.summary ?? null,
      uniqueValueProposition: research.uniqueValueProposition ?? null,
      keyTopics: Array.isArray(research.keyTopics)
        ? research.keyTopics.map(String)
        : [],
      thingsToAvoid: Array.isArray(research.thingsToAvoid)
        ? research.thingsToAvoid.map(String)
        : [],
      summary: research.summary ?? null,
    },
    note:
      "Scheduled posts use status approved with scheduledAt set. There is no separate scheduled status.",
  };
}

const generateInputSchema = z.object({
  platform: z.enum(GENERATE_PLATFORMS).default("linkedin"),
  count: z.number().int().min(1).max(50).optional(),
});

export async function generatePostsForUser(
  userId: string,
  brandId: string,
  input: unknown,
) {
  const brand = await getBrandById(brandId, userId);
  if (!brand) {
    throw new AssistantApiError("Brand not found", 404);
  }

  const data = generateInputSchema.parse(input ?? {});
  const user = await getOrCreateUser(userId);
  const limits = getPlanLimits(user.subscriptionTier);
  const count = Math.min(data.count ?? limits.generateMax, limits.generateMax);
  const research = researchForGeneration(brand);

  const generated = await generatePostsWithAI(research, count, data.platform);
  const { posts, imageError } = await createPostsWithOptionalImages({
    brandId: brand.id,
    platform: data.platform,
    contents: generated.posts,
    research,
  });

  const imagesGenerated = countPostsWithImages(posts);
  const imagesConfigured = isImageGenerationConfigured();

  return {
    posts: posts.map(summarizePost),
    source: generated.source,
    count: posts.length,
    platform: data.platform,
    imagesGenerated,
    imagesConfigured,
    imageProviders: getImageGenerationProviders(),
    imageHint: imageGenerationHint({
      configured: imagesConfigured,
      generated: imagesGenerated,
      error: imageError,
      isVercel: Boolean(process.env.VERCEL),
    }),
    note: "New posts are pending. Use approve_post to approve and auto-schedule them.",
  };
}

export async function listPendingPostsForUser(userId: string) {
  const posts = await getPendingPostsByUserId(userId);
  return {
    posts: posts.map(summarizePost),
    count: posts.length,
  };
}

export async function approveOrSkipPostForUser(
  userId: string,
  postId: string,
  action: "approve" | "skip",
) {
  const status = action === "approve" ? "approved" : "skipped";
  const post = await updatePostStatus(postId, userId, status);
  if (!post) {
    throw new AssistantApiError("Post not found", 404);
  }

  if (action === "skip") {
    return {
      post: summarizePost(post),
      note: "Post skipped. It will not be scheduled or published.",
    };
  }

  try {
    const scheduled = await scheduleApprovedPost(postId, userId);
    const result = scheduled ?? post;
    return {
      post: summarizePost(result),
      note: result.scheduledAt
        ? `Approved and scheduled for ${result.scheduledAt}. Publishing requires a connected social account for this brand/platform.`
        : "Approved, but no schedule slot was assigned.",
    };
  } catch (error) {
    if (error instanceof WeeklyScheduleLimitError) {
      await updatePostStatus(postId, userId, "pending");
      throw new AssistantApiError(error.message, 429);
    }
    return {
      post: summarizePost(post),
      note: "Approved, but scheduling failed. It will stay approved without a scheduledAt.",
      scheduleError: true,
    };
  }
}

export async function reschedulePostForUser(
  userId: string,
  postId: string,
  scheduledAt: string,
) {
  try {
    const post = await reschedulePost(postId, userId, scheduledAt);
    if (!post) {
      throw new AssistantApiError("Post not found", 404);
    }
    return {
      post: summarizePost(post),
      note: `Rescheduled to ${post.scheduledAt}. Publishing still requires a connected social account.`,
    };
  } catch (error) {
    if (error instanceof AssistantApiError) throw error;
    if (error instanceof WeeklyScheduleLimitError) {
      throw new AssistantApiError(error.message, 429);
    }
    throw new AssistantApiError(
      error instanceof Error ? error.message : "Failed to reschedule post",
      400,
    );
  }
}

export async function getCalendarForUser(
  userId: string,
  from?: string | null,
  to?: string | null,
) {
  await processDuePostsForUser(userId);

  const start = from ? new Date(from) : new Date();
  if (Number.isNaN(start.getTime())) {
    throw new AssistantApiError("Invalid from date", 400);
  }
  const end = to ? new Date(to) : new Date(start);
  if (to && Number.isNaN(end.getTime())) {
    throw new AssistantApiError("Invalid to date", 400);
  }
  if (!to) {
    end.setDate(end.getDate() + 13);
  }

  const posts = await getCalendarPostsByUserId(
    userId,
    start.toISOString(),
    end.toISOString(),
  );

  return {
    from: start.toISOString(),
    to: end.toISOString(),
    posts: posts.map(summarizePost),
    count: posts.length,
    note:
      "Calendar includes posts with scheduledAt set (typically approved awaiting publish, plus published history in range).",
  };
}

export function assistantErrorResponse(error: unknown) {
  if (error instanceof AssistantApiError) {
    return { error: error.message, status: error.status };
  }
  if (error instanceof z.ZodError) {
    return { error: error.issues, status: 400 };
  }
  return { error: "Internal server error", status: 500 };
}
