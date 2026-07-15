import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById, upsertConnection } from "@/lib/db";
import {
  getBlueskyOAuthClient,
  parseBlueskyOAuthState,
  verifyBlueskySession,
} from "@/lib/social/bluesky";

function integrationsUrl(req: Request, query: string) {
  return new URL(`/settings/integrations?${query}`, req.url);
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(
        new URL("/sign-in?redirect_url=/settings/integrations", req.url),
      );
    }

    const { searchParams } = new URL(req.url);
    const oauthError = searchParams.get("error");
    if (oauthError) {
      return NextResponse.redirect(
        integrationsUrl(
          req,
          `error=bluesky_oauth_error&detail=${encodeURIComponent(oauthError)}`,
        ),
      );
    }

    const client = await getBlueskyOAuthClient();
    const { session, state } = await client.callback(searchParams);
    const parsed = parseBlueskyOAuthState(state);

    if (!parsed || parsed.userId !== userId) {
      return NextResponse.redirect(integrationsUrl(req, "error=invalid_callback"));
    }

    const brand = await getBrandById(parsed.brandId, userId);
    if (!brand) {
      return NextResponse.redirect(integrationsUrl(req, "error=brand_not_found"));
    }

    let handle: string = session.did;
    try {
      const profile = await verifyBlueskySession(session.did);
      handle = profile.handle || session.did;
    } catch (error) {
      console.warn("[bluesky-callback] profile lookup failed", error);
    }

    const accountName = handle.startsWith("@") ? handle : `@${handle}`;
    await upsertConnection({
      id: randomUUID(),
      userId,
      brandId: parsed.brandId,
      platform: "bluesky",
      accountName,
      accessToken: session.did,
      metadata: {
        did: session.did,
        handle: handle.replace(/^@/, ""),
      },
      isDemo: false,
    });

    return NextResponse.redirect(integrationsUrl(req, "connected=bluesky"));
  } catch (error) {
    console.error("[bluesky-callback]", error);
    return NextResponse.redirect(
      integrationsUrl(req, "error=bluesky_exchange_failed"),
    );
  }
}
