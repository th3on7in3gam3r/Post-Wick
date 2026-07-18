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
  publicCity: z.string().trim().max(80).optional(),
  shareExisting: z.boolean().optional(),
});

function brandPayload(updated: {
  id: string;
  isPublic: boolean;
  publicSlug: string | null;
  publicNiche: string | null;
  publicCity: string | null;
  postwickAutoShare: boolean;
}) {
  return {
    id: updated.id,
    isPublic: updated.isPublic,
    publicSlug: updated.publicSlug,
    publicNiche: updated.publicNiche,
    publicCity: updated.publicCity,
    postwickAutoShare: updated.postwickAutoShare,
  };
}

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
      publicCity: body.publicCity,
    });

    let sharedCount = 0;
    if (body.connected && body.shareExisting) {
      const shared = await shareAllPublishedPostsToPostwick(params.id, userId);
      if (shared.error) {
        return NextResponse.json(
          {
            brand: brandPayload(updated!),
            sharedCount: 0,
            warning: shared.error,
          },
          { status: 200 },
        );
      }
      sharedCount = shared.updated;
    }

    return NextResponse.json({
      brand: brandPayload(updated!),
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
