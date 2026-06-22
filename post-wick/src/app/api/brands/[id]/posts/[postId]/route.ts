import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById, getPostById } from "@/lib/db/queries";

export async function GET(
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

    return NextResponse.json(post);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 },
    );
  }
}
