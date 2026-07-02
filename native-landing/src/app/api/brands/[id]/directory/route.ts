import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBrandById, updateBrandDirectoryListing } from "@/lib/db";

const bodySchema = z.object({
  isPublic: z.boolean(),
  publicNiche: z.string().trim().max(120).optional(),
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
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  if (brand.crawlStatus !== "completed") {
    return NextResponse.json(
      { error: "Finish brand setup before listing in the public directory." },
      { status: 400 },
    );
  }

  try {
    const body = await req.json();
    const data = bodySchema.parse(body);
    const updated = await updateBrandDirectoryListing(params.id, userId, data);
    return NextResponse.json({
      brand: {
        id: updated!.id,
        isPublic: updated!.isPublic,
        publicSlug: updated!.publicSlug,
        publicNiche: updated!.publicNiche,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update directory listing" }, { status: 500 });
  }
}
