import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { updatePostDraft, updatePostStatus, scheduleApprovedPost } from "@/lib/db";

const actionSchema = z.object({
  action: z.enum(["approve", "skip"]),
});

const patchSchema = z.object({
  content: z.string().trim().min(1).max(3000).optional(),
  imageUrl: z.union([z.string().url(), z.string().startsWith("/")]).nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    if (data.content === undefined && data.imageUrl === undefined) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const post = await updatePostDraft(params.postId, userId, data);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

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
    const post = await updatePostStatus(params.postId, userId, status);

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (action === "approve") {
      try {
        const scheduled = await scheduleApprovedPost(params.postId, userId);
        return NextResponse.json(scheduled ?? post);
      } catch {
        return NextResponse.json({
          ...post,
          scheduleError: "Approved, but scheduling failed. It will stay approved.",
        });
      }
    }

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
