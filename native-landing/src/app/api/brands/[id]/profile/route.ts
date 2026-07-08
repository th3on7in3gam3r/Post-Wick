import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { mergeBrandProfileIntoResearch } from "@/lib/brand-voice";
import { getBrandById, updateBrand } from "@/lib/db";

const bodySchema = z.object({
  tone: z.string().trim().min(1).max(255),
  uniqueValueProposition: z.string().trim().min(1).max(2000),
  keyTopics: z.array(z.string().trim().min(1).max(120)).min(1).max(12),
});

export async function PATCH(
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
    const body = await req.json();
    const profile = bodySchema.parse(body);

    const existingResearch = brand.researchData
      ? (JSON.parse(brand.researchData) as Record<string, unknown>)
      : {};

    const research = mergeBrandProfileIntoResearch(existingResearch, profile);
    const updated = await updateBrand(brand.id, userId, { researchData: research });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        tone: research.tone,
        uniqueValueProposition: research.uniqueValueProposition,
        keyTopics: research.keyTopics,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update brand profile" },
      { status: 500 },
    );
  }
}
