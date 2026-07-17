import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getBrandById,
  shareAllPublishedPostsToPostwick,
  updateBrandPostwickConnection,
} from "@/lib/db";

const bodySchema = z.object({
  connected: z.boolean(),
  publicNiche: z.string().trim().max(120).optional(),
  shareExisting: z.boolean().optional(),
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
      { error: "Finish brand setup before connecting to Postwick." },
      { status: 400 },
    );
  }

  try {
    const body = bodySchema.parse(await req.json());
    const updated = await updateBrandPostwickConnection(params.id, userId, {
      connected: body.connected,
      publicNiche: body.publicNiche,
    });

    let sharedCount = 0;
    if (body.connected && body.shareExisting) {
      const shared = await shareAllPublishedPostsToPostwick(params.id, userId);
      if (shared.error) {
        return NextResponse.json(
          {
            brand: {
              id: updated!.id,
              isPublic: updated!.isPublic,
              publicSlug: updated!.publicSlug,
              publicNiche: updated!.publicNiche,
              postwickAutoShare: updated!.postwickAutoShare,
            },
            sharedCount: 0,
            warning: shared.error,
          },
          { status: 200 },
        );
      }
      sharedCount = shared.updated;
    }

    return NextResponse.json({
      brand: {
        id: updated!.id,
        isPublic: updated!.isPublic,
        publicSlug: updated!.publicSlug,
        publicNiche: updated!.publicNiche,
        postwickAutoShare: updated!.postwickAutoShare,
      },
      sharedCount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update Postwick connection" },
      { status: 500 },
    );
  }
}
