import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById, getPostById } from "@/lib/db/queries";
import { refinePost } from "@/lib/ai/refine";
import { getDb } from "@/lib/db/client";
import { posts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { Platform } from "@/lib/utils";
import { z } from "zod";

const refineSchema = z.object({
  instruction: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; postId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, postId } = await params;

  try {
    const brand = await getBrandById(id, userId);
    if (!brand) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const post = await getPostById(postId, id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await req.json();
    const { instruction } = refineSchema.parse(body);

    const refined = await refinePost(
      post.content,
      post.platform as Platform,
      instruction,
    );

    const [updated] = await getDb()
      .update(posts)
      .set({ content: refined, updatedAt: new Date() })
      .where(and(eq(posts.id, postId), eq(posts.brandId, id)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to refine post" },
      { status: 500 },
    );
  }
}
