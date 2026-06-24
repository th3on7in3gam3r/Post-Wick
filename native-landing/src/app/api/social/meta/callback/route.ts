import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById, upsertConnection } from "@/lib/db";
import {
  exchangeInstagramCode,
  exchangeMetaCode,
  resolveInstagramConnection,
  resolveMetaConnection,
  type MetaPlatform,
} from "@/lib/social/meta";
import { requestOrigin, sanitizeOAuthCode } from "@/lib/social/request-origin";

function integrationsUrl(req: Request, query: string) {
  return new URL(`/settings/integrations?${query}`, req.url);
}

function signInUrl(req: Request) {
  const returnTo = new URL("/settings/integrations", req.url).toString();
  const url = new URL("/sign-in", req.url);
  url.searchParams.set("redirect_url", returnTo);
  return url;
}

export async function GET(req: Request) {
  try {
    const origin = requestOrigin(req);
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(signInUrl(req));
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");
    const oauthErrorDescription = searchParams.get("error_description");

    if (oauthError) {
      const detail = oauthErrorDescription
        ? `${oauthError}:${oauthErrorDescription}`
        : oauthError;
      return NextResponse.redirect(
        integrationsUrl(req, `error=${encodeURIComponent(detail)}`),
      );
    }

    if (!code || !state || !state.includes(":")) {
      return NextResponse.redirect(integrationsUrl(req, "error=invalid_callback"));
    }

    const sanitizedCode = sanitizeOAuthCode(code);
    const [brandId, platformRaw] = state.split(":");
    if (!brandId || (platformRaw !== "instagram" && platformRaw !== "facebook")) {
      return NextResponse.redirect(integrationsUrl(req, "error=invalid_callback"));
    }

    const platform = platformRaw as MetaPlatform;
    const brand = await getBrandById(brandId, userId);
    if (!brand) {
      return NextResponse.redirect(integrationsUrl(req, "error=brand_not_found"));
    }

    const userAccessToken =
      platform === "instagram"
        ? await exchangeInstagramCode(sanitizedCode, origin)
        : await exchangeMetaCode(sanitizedCode, origin);
    const resolved =
      platform === "instagram"
        ? await resolveInstagramConnection(userAccessToken)
        : await resolveMetaConnection(userAccessToken, platform);

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
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    const code = message.includes("instagram business")
      ? "meta_no_instagram"
      : "meta_exchange_failed";
    return NextResponse.redirect(integrationsUrl(req, `error=${code}`));
  }
}
