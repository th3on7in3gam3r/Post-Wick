import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getBrandById,
  saveMetaOauthPending,
  upsertConnection,
} from "@/lib/db";
import {
  buildFacebookConnectionFromPage,
  exchangeInstagramCode,
  exchangeMetaCode,
  fetchMetaPagesForSelection,
  resolveInstagramConnection,
  resolveMetaConnection,
  type MetaPlatform,
} from "@/lib/social/meta";
import {
  META_FACEBOOK_PAGE_PICK_COOKIE,
  META_OAUTH_PENDING_TTL_SECONDS,
} from "@/lib/social/meta-pending";

function integrationsUrl(req: Request, query: string) {
  return new URL(`/settings/integrations?${query}`, req.url);
}

function facebookSelectPageUrl(req: Request, brandId: string) {
  return new URL(
    `/settings/integrations/facebook/select-page?brandId=${encodeURIComponent(brandId)}`,
    req.url,
  );
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

    const userAccessToken =
      platform === "instagram"
        ? await exchangeInstagramCode(code)
        : await exchangeMetaCode(code);

    if (platform === "facebook") {
      const pages = await fetchMetaPagesForSelection(userAccessToken);

      if (pages.length === 0) {
        throw new Error("No Facebook Page found for this Meta account");
      }

      if (pages.length === 1) {
        const resolved = buildFacebookConnectionFromPage(pages[0]!);
        await upsertConnection({
          id: randomUUID(),
          userId,
          brandId,
          platform: "facebook",
          accountName: resolved.accountName,
          accessToken: resolved.accessToken,
          metadata: resolved.metadata,
          isDemo: false,
        });

        return NextResponse.redirect(integrationsUrl(req, "connected=facebook"));
      }

      const pendingId = randomUUID();
      const expiresAt = new Date(
        Date.now() + META_OAUTH_PENDING_TTL_SECONDS * 1000,
      ).toISOString();

      await saveMetaOauthPending({
        id: pendingId,
        userId,
        brandId,
        platform: "facebook",
        pages,
        expiresAt,
      });

      const response = NextResponse.redirect(facebookSelectPageUrl(req, brandId));
      response.cookies.set(META_FACEBOOK_PAGE_PICK_COOKIE, pendingId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: META_OAUTH_PENDING_TTL_SECONDS,
        path: "/",
      });
      return response;
    }

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
      : message.includes("no facebook page")
        ? "meta_no_pages"
        : "meta_exchange_failed";
    return NextResponse.redirect(integrationsUrl(req, `error=${code}`));
  }
}
