import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById, getPostById, updatePostStatus } from "@/lib/db/queries";

export async function POST(
  _req: Request,
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

    if (post.status !== "approved") {
      return NextResponse.json(
        { error: "Post must be approved before publishing" },
        { status: 400 },
      );
    }

    // TODO: Publish to connected social platform
    const updated = await updatePostStatus(postId, id, "published");
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to publish post" },
      { status: 500 },
    );
  }
}
