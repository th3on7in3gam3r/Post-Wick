import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { setPostPublic } from "@/lib/db";

const bodySchema = z.object({
  isPublic: z.boolean(),
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
    const body = bodySchema.parse(await req.json());
    const result = await setPostPublic(params.postId, userId, body.isPublic);

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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update" },
      { status: 500 },
    );
  }
}
