import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createPostsWithOptionalImages, countPostsWithImages } from "@/lib/ai/create-posts";
import { getImageGenerationProviders, imageGenerationHint, isImageGenerationConfigured } from "@/lib/ai/images";
import { generatePostsWithAI } from "@/lib/ai/generate";
import { getBrandById, getOrCreateUser } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { GENERATE_PLATFORMS } from "@/lib/platforms";

const generateSchema = z.object({
  platform: z.enum(GENERATE_PLATFORMS).default("linkedin"),
  count: z.number().int().min(1).max(50).optional(),
});

export const maxDuration = 300;

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brand = await getBrandById(params.id, userId);
  if (!brand) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const data = generateSchema.parse(body);
    const user = await getOrCreateUser(userId);
    const limits = getPlanLimits(user.subscriptionTier);
    const count = Math.min(data.count ?? limits.generateMax, limits.generateMax);

    const research = brand.researchData
      ? JSON.parse(brand.researchData)
      : { companyName: brand.name, websiteUrl: brand.websiteUrl, keyTopics: [brand.name] };

    const generated = await generatePostsWithAI(research, count, data.platform);
    const { posts, imageError } = await createPostsWithOptionalImages({
      brandId: brand.id,
      platform: data.platform,
      contents: generated.posts,
      research,
    });

    const imagesGenerated = countPostsWithImages(posts);
    const imagesConfigured = isImageGenerationConfigured();

    return NextResponse.json(
      {
        posts,
        source: generated.source,
        count: posts.length,
        imagesGenerated,
        imagesConfigured,
        imageProviders: getImageGenerationProviders(),
        imageHint: imageGenerationHint({
          configured: imagesConfigured,
          generated: imagesGenerated,
          error: imageError,
          isVercel: Boolean(process.env.VERCEL),
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to generate posts" }, { status: 500 });
  }
}
