import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById, upsertConnection } from "@/lib/db";
import {
  exchangeMetaCode,
  resolveMetaConnection,
  type MetaPlatform,
} from "@/lib/social/meta";

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
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      return NextResponse.redirect(
        integrationsUrl(req, `error=${encodeURIComponent(oauthError)}`),
      );
    }

    if (!code || !state || !state.includes(":")) {
      return NextResponse.redirect(integrationsUrl(req, "error=invalid_callback"));
    }

    const [brandId, platformRaw] = state.split(":");
    if (!brandId || (platformRaw !== "instagram" && platformRaw !== "facebook")) {
      return NextResponse.redirect(integrationsUrl(req, "error=invalid_callback"));
    }

    const platform = platformRaw as MetaPlatform;
    const brand = await getBrandById(brandId, userId);
    if (!brand) {
      return NextResponse.redirect(integrationsUrl(req, "error=brand_not_found"));
    }

    const userAccessToken = await exchangeMetaCode(code);
    const resolved = await resolveMetaConnection(userAccessToken, platform);

    await upsertConnection({
      id: randomUUID(),
      userId,
      brandId,
      platform,
      accountName: resolved.accountName,
      accessToken: resolved.accessToken,
      metadata: resolved.metadata,
      isDemo: false,
    });

    return NextResponse.redirect(integrationsUrl(req, `connected=${platform}`));
  } catch (error) {
    console.error("[meta-callback]", error);
    return NextResponse.redirect(integrationsUrl(req, "error=meta_exchange_failed"));
  }
}
