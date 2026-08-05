import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { publishFailedPostToPostwick } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: { postId: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await publishFailedPostToPostwick(params.postId, userId);

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error, post: result.post },
        { status: 400 },
      );
    }

    return NextResponse.json(result.post);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not publish to Postwick",
      },
      { status: 500 },
    );
  }
}
