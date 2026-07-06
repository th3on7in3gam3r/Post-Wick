import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { retryAllFailedPosts } from "@/lib/publish/retry-failed";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await retryAllFailedPosts(userId);
  const published = results.filter((item) => item.status === "published").length;
  const failed = results.filter((item) => item.status === "failed").length;

  return NextResponse.json({
    ok: true,
    total: results.length,
    published,
    failed,
    results,
  });
}
