import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { mergeBrandVoiceIntoResearch } from "@/lib/brand-voice";
import { generateInitialPostsForBrand } from "@/lib/brands/generate-initial-posts";
import { getBrandById, getOrCreateUser, getUserById, updateBrand } from "@/lib/db";

const confirmVoiceSchema = z.object({
  companyName: z.string().min(1).max(255),
  industry: z.string().min(1).max(255),
  tone: z.string().min(1).max(255),
  voiceDescription: z.string().max(2000).optional().default(""),
  keyTopics: z.array(z.string().min(1).max(120)).min(1).max(12),
  thingsToAvoid: z.array(z.string().min(1).max(120)).max(12).optional().default([]),
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

  if (brand.crawlStatus !== "review") {
    return NextResponse.json(
      { error: "Brand voice has already been confirmed for this brand." },
      { status: 409 },
    );
  }

  try {
    const body = await req.json();
    const voice = confirmVoiceSchema.parse(body);
    const existingResearch = brand.researchData
      ? (JSON.parse(brand.researchData) as Record<string, unknown>)
      : {};

    const research = mergeBrandVoiceIntoResearch(existingResearch, {
      ...voice,
      voiceDescription: voice.voiceDescription ?? "",
    });

    await updateBrand(brand.id, userId, {
      name: voice.companyName,
      description:
        voice.voiceDescription.trim() ||
        String(research.summary ?? brand.description ?? ""),
      researchData: research,
      crawlStatus: "running",
    });

    await getOrCreateUser(userId);
    const user = (await getUserById(userId))!;
    const generation = await generateInitialPostsForBrand(
      brand.id,
      research as Parameters<typeof generateInitialPostsForBrand>[1],
      user.subscriptionTier,
    );

    const completedBrand = await updateBrand(brand.id, userId, {
      crawlStatus: "completed",
      researchData: research,
    });

    return NextResponse.json(
      {
        brand: {
          ...completedBrand,
          researchData: research,
        },
        ...generation,
        created: true,
      },
      { status: 201 },
    );
  } catch (error) {
    await updateBrand(brand.id, userId, { crawlStatus: "review" });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to generate posts from brand voice" },
      { status: 500 },
    );
  }
}
