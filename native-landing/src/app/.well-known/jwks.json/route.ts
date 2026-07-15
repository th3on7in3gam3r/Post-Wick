import { NextResponse } from "next/server";
import { getBlueskyPublicJwks } from "@/lib/social/bluesky";

export async function GET() {
  const jwks = await getBlueskyPublicJwks();
  return NextResponse.json(jwks, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
