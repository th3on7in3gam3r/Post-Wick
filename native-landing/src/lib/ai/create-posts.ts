import { randomUUID } from "node:crypto";
import { generateImagesForPosts, isImageGenerationConfigured } from "@/lib/ai/images";
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
  const imageUrls =
    withImages && isImageGenerationConfigured()
      ? await generateImagesForPosts(
          contents.map((content) => ({ content })),
          research,
        )
      : contents.map(() => null);

  return await createPosts(
    contents.map((content, index) => ({
      id: randomUUID(),
      brandId,
      platform,
      content,
      imageUrl: imageUrls[index],
    })),
  );
}

export function countPostsWithImages(
  posts: Array<{ imageUrl: string | null }>,
) {
  return posts.filter((post) => post.imageUrl).length;
}
