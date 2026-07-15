import { NextResponse } from "next/server";
import { getBlueskyOAuthClient, isBlueskyConfigured } from "@/lib/social/bluesky";

export async function GET() {
  if (!isBlueskyConfigured()) {
    return NextResponse.json(
      { error: "Bluesky OAuth is not configured" },
      { status: 503 },
    );
  }

  const client = await getBlueskyOAuthClient();
  return NextResponse.json(client.clientMetadata, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
