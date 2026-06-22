import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCalendarPostsByUserId } from "@/lib/db";
import { processDuePostsForUser } from "@/lib/publish/process-due";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await processDuePostsForUser(userId);

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const start = from ? new Date(from) : new Date();
  const end = to ? new Date(to) : new Date(start);
  if (!to) {
    end.setDate(end.getDate() + 13);
  }

  const posts = getCalendarPostsByUserId(
    userId,
    start.toISOString(),
    end.toISOString(),
  );

  return NextResponse.json(posts);
}
