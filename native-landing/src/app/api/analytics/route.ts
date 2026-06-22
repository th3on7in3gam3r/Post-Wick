import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAnalyticsSummary, getPostHistory } from "@/lib/db";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view");

  if (view === "history") {
    const filter =
      searchParams.get("filter") === "published" || searchParams.get("filter") === "failed"
        ? searchParams.get("filter")
        : "all";
    return NextResponse.json(
      getPostHistory(userId, filter as "all" | "published" | "failed"),
    );
  }

  return NextResponse.json(getAnalyticsSummary(userId));
}
