import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById, upsertConnection } from "@/lib/db";
import {
  exchangeMetaCode,
  resolveMetaConnection,
  type MetaPlatform,
} from "@/lib/social/meta";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect("/sign-in");
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state || !state.includes(":")) {
    return NextResponse.redirect("/settings/integrations?error=invalid_callback");
  }

  const [brandId, platformRaw] = state.split(":");
  if (!brandId || (platformRaw !== "instagram" && platformRaw !== "facebook")) {
    return NextResponse.redirect("/settings/integrations?error=invalid_callback");
  }

  const platform = platformRaw as MetaPlatform;
  const brand = await getBrandById(brandId, userId);
  if (!brand) {
    return NextResponse.redirect("/settings/integrations?error=brand_not_found");
  }

  try {
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

    return NextResponse.redirect(`/settings/integrations?connected=${platform}`);
  } catch {
    return NextResponse.redirect("/settings/integrations?error=meta_exchange_failed");
  }
}
