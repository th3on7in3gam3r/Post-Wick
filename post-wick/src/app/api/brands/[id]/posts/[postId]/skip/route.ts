import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById, updatePostStatus } from "@/lib/db/queries";

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

    const post = await updatePostStatus(postId, id, "skipped");
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch {
    return NextResponse.json(
      { error: "Failed to skip post" },
      { status: 500 },
    );
  }
}
