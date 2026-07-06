import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { retryFailedPost } from "@/lib/publish/retry-failed";

export async function POST(
  _req: Request,
  { params }: { params: { postId: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await retryFailedPost(params.postId, userId);

  if (result.status === "failed" && result.error === "Post not found or is not in failed status") {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json(result);
}
