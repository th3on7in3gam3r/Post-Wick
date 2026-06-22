import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById } from "@/lib/db/queries";
import { generatePosts } from "@/lib/ai/generate";
import { getDb } from "@/lib/db/client";
import { posts } from "@/lib/db/schema";
import type { Platform } from "@/lib/utils";
import { z } from "zod";

const generateSchema = z.object({
  platform: z.enum([
    "linkedin",
    "twitter",
    "instagram",
    "facebook",
    "tiktok",
  ]),
  count: z.number().int().min(1).max(50).default(10),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const brand = await getBrandById(id, userId);
    if (!brand) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { platform, count } = generateSchema.parse(body);

    const generated = await generatePosts(
      brand.researchData ?? { websiteUrl: brand.websiteUrl },
      platform as Platform,
      count,
    );

    const created = await getDb()
      .insert(posts)
      .values(
        generated.map((content) => ({
          brandId: id,
          platform,
          content,
          status: "pending" as const,
        })),
      )
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to generate posts" },
      { status: 500 },
    );
  }
}
