import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildImagePrompt, generatePostImage, imageGenerationHint, isImageGenerationConfigured } from "@/lib/ai/images";
import { getBrandById, getPostsByBrandId, updatePostImageUrl } from "@/lib/db";

const bodySchema = z.object({
  limit: z.number().int().min(1).max(20).optional(),
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

  if (!isImageGenerationConfigured()) {
    return NextResponse.json(
      {
        error:
          "Image generation is not configured. Add OPENAI_API_KEY, GEMINI_API_KEY, or IDEOGRAM_API_KEY on Vercel.",
      },
      { status: 503 },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { limit = 12 } = bodySchema.parse(body);

    const research = brand.researchData
      ? JSON.parse(brand.researchData)
      : {
          companyName: brand.name,
          industry: "Small business",
          keyTopics: [brand.name],
        };

    const posts = (await getPostsByBrandId(brand.id)).filter((post) => !post.imageUrl);
    const targets = posts.slice(0, limit);

    let updated = 0;
    let lastError: string | null = null;

    for (const post of targets) {
      const prompt = buildImagePrompt(post.content, research);
      const imageUrl = await generatePostImage(prompt);
      if (!imageUrl) continue;

      const saved = await updatePostImageUrl(post.id, userId, imageUrl);
      if (saved) updated += 1;
    }

    if (updated === 0 && targets.length > 0) {
      lastError = "Image providers failed — check API keys and BLOB_READ_WRITE_TOKEN on Vercel.";
    }

    return NextResponse.json({
      updated,
      attempted: targets.length,
      remaining: Math.max(posts.length - updated, 0),
      imageHint: imageGenerationHint({
        configured: true,
        generated: updated,
        error: lastError,
        isVercel: Boolean(process.env.VERCEL),
      }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to generate images" }, { status: 500 });
  }
}
