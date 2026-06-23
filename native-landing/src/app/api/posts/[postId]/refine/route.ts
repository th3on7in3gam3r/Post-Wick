import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  instructionWantsNewImage,
  refinePostWithAI,
} from "@/lib/ai/refine";
import {
  buildImagePrompt,
  generatePostImage,
  isImageGenerationConfigured,
} from "@/lib/ai/images";
import type { buildResearchFromCrawl } from "@/lib/crawl/website";
import { getPendingPostForUser } from "@/lib/db";

const refineSchema = z.object({
  instruction: z.string().trim().min(3).max(500),
  regenerateImage: z.boolean().optional(),
});

type Research = ReturnType<typeof buildResearchFromCrawl>;

function parseResearch(raw: string | null): Research | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Research;
  } catch {
    return null;
  }
}

export async function POST(
  req: Request,
  { params }: { params: { postId: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { instruction, regenerateImage } = refineSchema.parse(body);
    const owned = await getPendingPostForUser(params.postId, userId);

    if (!owned) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { post, brand } = owned;
    const research = parseResearch(brand.researchData);
    const refined = await refinePostWithAI({
      content: post.content,
      platform: post.platform,
      instruction,
      brandName: brand.name,
      research,
    });

    const shouldRegenerateImage =
      Boolean(regenerateImage) || instructionWantsNewImage(instruction);

    const images: Array<{ id: "current" | "new"; url: string | null; label: string }> =
      [
        {
          id: "current",
          url: post.imageUrl,
          label: "Current image",
        },
      ];

    let imageWarning: string | null = null;

    if (shouldRegenerateImage && isImageGenerationConfigured()) {
      const prompt = [
        buildImagePrompt(refined.captions[0]!, research ?? {
          companyName: brand.name,
          websiteUrl: brand.websiteUrl,
          logoUrl: null,
          siteImageUrl: null,
          industry: "Small business",
          targetAudience: brand.name,
          tone: "Professional, approachable, and helpful",
          keyTopics: [brand.name],
          uniqueValueProposition: brand.description ?? brand.name,
          pageCount: 0,
          crawledPages: [],
          summary: brand.description ?? "",
          source: "brand",
        }),
        `Refinement note: ${instruction}`,
      ].join(" ");

      const newImageUrl = await generatePostImage(prompt);
      if (newImageUrl) {
        images.push({
          id: "new",
          url: newImageUrl,
          label: "New variation",
        });
      } else {
        imageWarning = "Caption options are ready, but image generation failed.";
      }
    } else if (shouldRegenerateImage) {
      imageWarning = "Add an image API key to generate new variations.";
    }

    return NextResponse.json({
      captions: refined.captions,
      images,
      source: refined.source,
      imageWarning,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to refine post" }, { status: 500 });
  }
}
