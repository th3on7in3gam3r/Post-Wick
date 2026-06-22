import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { updatePostStatus, scheduleApprovedPost } from "@/lib/db";

const actionSchema = z.object({
  action: z.enum(["approve", "skip"]),
});

export async function POST(
  req: Request,
  { params }: { params: { postId: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = actionSchema.parse(body);
    const status = action === "approve" ? "approved" : "skipped";
    const post = updatePostStatus(params.postId, userId, status);

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (action === "approve") {
      const scheduled = scheduleApprovedPost(params.postId, userId);
      return NextResponse.json(scheduled ?? post);
    }

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
