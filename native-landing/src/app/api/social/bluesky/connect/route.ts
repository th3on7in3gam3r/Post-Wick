import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBrandById } from "@/lib/db";
import {
  BLUESKY_OAUTH_SCOPE,
  encodeBlueskyOAuthState,
  getBlueskyOAuthClient,
  isBlueskyConfigured,
} from "@/lib/social/bluesky";

const bodySchema = z.object({
  brandId: z.string().min(1),
  handle: z.string().min(1).max(300),
});

function normalizeHandle(raw: string) {
  let handle = raw.trim().replace(/^@+/, "");
  if (!handle) return "";
  if (!handle.includes(".") && !handle.startsWith("did:")) {
    handle = `${handle}.bsky.social`;
  }
  return handle;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isBlueskyConfigured()) {
    return NextResponse.json(
      { error: "Bluesky OAuth is not configured. Use demo connect or set BLUESKY_OAUTH_PRIVATE_JWK for production." },
      { status: 503 },
    );
  }

  try {
    const data = bodySchema.parse(await req.json());
    const brand = await getBrandById(data.brandId, userId);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const handle = normalizeHandle(data.handle);
    if (!handle) {
      return NextResponse.json({ error: "Bluesky handle is required" }, { status: 400 });
    }

    const client = await getBlueskyOAuthClient();
    const authUrl = await client.authorize(handle, {
      scope: BLUESKY_OAUTH_SCOPE,
      state: encodeBlueskyOAuthState(userId, data.brandId),
    });

    return NextResponse.json({ redirectUrl: authUrl.toString() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[bluesky-connect]", error);
    const message =
      error instanceof Error ? error.message : "Could not start Bluesky authorization";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
