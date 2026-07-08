import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { IMAGE_STYLE_PRESET_IDS } from "@/lib/ai/image-style-presets";
import { getBrandById, updateBrand } from "@/lib/db";

const bodySchema = z.object({
  imageStylePreset: z.enum(IMAGE_STYLE_PRESET_IDS),
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
    const { imageStylePreset } = bodySchema.parse(body);

    const existingResearch = brand.researchData
      ? (JSON.parse(brand.researchData) as Record<string, unknown>)
      : {};

    const research = {
      ...existingResearch,
      imageStylePreset,
    };

    const updated = await updateBrand(brand.id, userId, { researchData: research });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      brand: {
        ...updated,
        researchData: research,
      },
      imageStylePreset,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update image style" },
      { status: 500 },
    );
  }
}
