import { randomUUID } from "node:crypto";
import {
  consumeLastImageGenerationError,
  generateImagesForPosts,
  isImageGenerationConfigured,
} from "@/lib/ai/images";
import type { buildResearchFromCrawl } from "@/lib/crawl/website";
import { createPosts } from "@/lib/db";

type Research = ReturnType<typeof buildResearchFromCrawl>;

export async function createPostsWithOptionalImages(input: {
  brandId: string;
  platform: string;
  contents: string[];
  research: Research;
  withImages?: boolean;
}) {
  const { brandId, platform, contents, research, withImages = true } = input;
  const forceImages = withImages || platform.toLowerCase() === "instagram";
  const imageUrls =
    forceImages && isImageGenerationConfigured()
      ? await generateImagesForPosts(
          contents.map((content) => ({ content })),
          research,
          platform,
        )
      : contents.map(() => null);

  const posts = await createPosts(
    contents.map((content, index) => ({
      id: randomUUID(),
      brandId,
      platform,
      content,
      imageUrl: imageUrls[index],
    })),
  );

  return {
    posts,
    imageError: consumeLastImageGenerationError(),
  };
}

export function countPostsWithImages(
  posts: Array<{ imageUrl: string | null }>,
) {
  return posts.filter((post) => post.imageUrl).length;
}
