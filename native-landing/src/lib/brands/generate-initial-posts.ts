import { createPostsWithOptionalImages, countPostsWithImages } from "@/lib/ai/create-posts";
import { generatePostsWithAI } from "@/lib/ai/generate";
import {
  getImageGenerationProviders,
  imageGenerationHint,
  isImageGenerationConfigured,
} from "@/lib/ai/images";
import type { buildResearchFromCrawl } from "@/lib/crawl/website";
import { getPlanLimits } from "@/lib/plans";

type Research = ReturnType<typeof buildResearchFromCrawl> & Record<string, unknown>;

export async function generateInitialPostsForBrand(
  brandId: string,
  research: Research,
  subscriptionTier: "free" | "pro" | "max",
) {
  const limits = getPlanLimits(subscriptionTier);
  const linkedinCount = Math.max(1, Math.ceil(limits.initialPosts * 0.6));
  const instagramCount = Math.max(0, limits.initialPosts - linkedinCount);

  const linkedinGenerated = await generatePostsWithAI(research, linkedinCount, "linkedin");
  const linkedinBatch = await createPostsWithOptionalImages({
    brandId,
    platform: "linkedin",
    contents: linkedinGenerated.posts,
    research,
  });

  let instagramBatch = {
    posts: [] as typeof linkedinBatch.posts,
    imageError: null as string | null,
  };

  if (instagramCount >= 2) {
    const instagramGenerated = await generatePostsWithAI(
      research,
      instagramCount,
      "instagram",
    );
    instagramBatch = await createPostsWithOptionalImages({
      brandId,
      platform: "instagram",
      contents: instagramGenerated.posts,
      research,
      withImages: true,
    });
  }

  const posts = [...linkedinBatch.posts, ...instagramBatch.posts];
  const imageError = linkedinBatch.imageError ?? instagramBatch.imageError;
  const imagesGenerated = countPostsWithImages(posts);
  const imagesConfigured = isImageGenerationConfigured();

  return {
    posts,
    generationSource: linkedinGenerated.source,
    instagramPosts: instagramBatch.posts.length,
    imagesGenerated,
    imagesConfigured,
    imageProviders: getImageGenerationProviders(),
    imageHint: imageGenerationHint({
      configured: imagesConfigured,
      generated: imagesGenerated,
      error: imageError,
      isVercel: Boolean(process.env.VERCEL),
    }),
  };
}
