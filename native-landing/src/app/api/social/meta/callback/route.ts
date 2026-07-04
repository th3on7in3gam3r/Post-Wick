import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getBrandById,
  saveMetaOauthPending,
  upsertConnection,
} from "@/lib/db";
import {
  oauthFailureRedirect,
  integrationsOAuthRedirect,
  type OAuthDebugInfo,
} from "@/lib/integrations/oauth-debug";
import {
  buildFacebookConnectionFromPage,
  exchangeInstagramCode,
  exchangeMetaCode,
  fetchMetaPagesForSelection,
  resolveInstagramConnection,
  resolveMetaConnection,
  metaRedirectUri,
  type MetaPlatform,
} from "@/lib/social/meta";
import {
  META_FACEBOOK_PAGE_PICK_COOKIE,
  META_OAUTH_PENDING_TTL_SECONDS,
} from "@/lib/social/meta-pending";

function facebookSelectPageUrl(req: Request, brandId: string) {
  return new URL(
    `/settings/integrations/facebook/select-page?brandId=${encodeURIComponent(brandId)}`,
    req.url,
  );
}

function metaExchangeHint(message: string, platform?: MetaPlatform) {
  const lowered = message.toLowerCase();

  if (lowered.includes("redirect")) {
    const label =
      platform === "facebook"
        ? "Facebook Login for Business redirect URI"
        : "Instagram Business Login redirect URI";
    return `${label} must match exactly: ${metaRedirectUri()}`;
  }

  if (
    lowered.includes("client") ||
    lowered.includes("secret") ||
    lowered.includes("invalid app")
  ) {
    return "Use the Instagram App ID and Instagram App Secret from Meta → Instagram → Business login settings — not App settings → Basic.";
  }

  if (lowered.includes("authorization code") || lowered.includes("code has expired")) {
    return "The login code expired or was already used. Click Connect Instagram again without refreshing the callback page.";
  }

  return "Check Vercel logs for [meta-callback] and verify Instagram credentials plus redirect URI in Meta.";
}

function debugBase(
  step: string,
  overrides: Omit<Partial<OAuthDebugInfo>, "flow" | "step" | "at"> & { message: string },
): OAuthDebugInfo {
  return {
    flow: "meta",
    step,
    at: new Date().toISOString(),
    ...overrides,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const statePlatform = state?.includes(":") ? (state.split(":")[1] as MetaPlatform) : undefined;

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(
        new URL("/sign-in?redirect_url=/settings/integrations", req.url),
      );
    }

    if (oauthError) {
      return oauthFailureRedirect(
        req,
        debugBase("oauth_denied", {
          metaError: oauthError,
          hasCode: Boolean(code),
          hasState: Boolean(state),
          platform: statePlatform,
          message:
            oauthError === "access_denied"
              ? "Meta authorization was cancelled or permissions were denied."
              : `Meta returned OAuth error: ${oauthError}`,
          hint: "Try Connect again and approve all requested permissions in the Meta dialog.",
        }),
        oauthError === "access_denied" ? "meta_access_denied" : "meta_oauth_error",
      );
    }

    if (!code && !state) {
      return oauthFailureRedirect(
        req,
        debugBase("validate_callback", {
          hasCode: false,
          hasState: false,
          message:
            "Meta redirect arrived without an authorization code or state. The OAuth flow may have been interrupted.",
          hint: "Click Connect again and finish the Meta login without closing the tab early.",
        }),
        "invalid_callback_missing_params",
      );
    }

    if (!code) {
      return oauthFailureRedirect(
        req,
        debugBase("validate_callback", {
          hasCode: false,
          hasState: Boolean(state),
          platform: statePlatform,
          message:
            "Meta redirect arrived without an authorization code. This usually means the login was cancelled or the redirect URI does not match Meta settings.",
          hint: `Confirm Meta has exactly this redirect URI: ${metaRedirectUri()}`,
        }),
        "invalid_callback_missing_code",
      );
    }

    if (!state || !state.includes(":")) {
      return oauthFailureRedirect(
        req,
        debugBase("validate_callback", {
          hasCode: true,
          hasState: Boolean(state),
          message:
            "Meta redirect arrived without a valid state parameter. The connection request may have expired or been tampered with.",
          hint: "Start a fresh Connect attempt from Integrations.",
        }),
        "invalid_callback_missing_state",
      );
    }

    const [brandId, platformRaw] = state.split(":");
    if (!brandId || (platformRaw !== "instagram" && platformRaw !== "facebook")) {
      return oauthFailureRedirect(
        req,
        debugBase("validate_callback", {
          hasCode: true,
          hasState: true,
          platform: platformRaw,
          message: `Unexpected OAuth state format (platform: ${platformRaw ?? "missing"}).`,
          hint: "Start a fresh Connect attempt from Integrations.",
        }),
        "invalid_callback_bad_state",
      );
    }

    const platform = platformRaw as MetaPlatform;
    const brand = await getBrandById(brandId, userId);
    if (!brand) {
      return oauthFailureRedirect(
        req,
        debugBase("load_brand", {
          hasCode: true,
          hasState: true,
          platform,
          message: "The brand for this connection request was not found in your workspace.",
          hint: "Select the correct brand on Integrations, then connect again.",
        }),
        "brand_not_found",
      );
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

        return NextResponse.redirect(
          integrationsOAuthRedirect(req, new URLSearchParams({ connected: "facebook" })),
        );
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

    return NextResponse.redirect(
      integrationsOAuthRedirect(req, new URLSearchParams({ connected: platform })),
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown Meta OAuth error";
    const lowered = errMsg.toLowerCase();
    const code = lowered.includes("instagram business")
      ? "meta_no_instagram"
      : lowered.includes("no facebook page")
        ? "meta_no_pages"
        : "meta_exchange_failed";

    return oauthFailureRedirect(
      req,
      debugBase("token_exchange_or_resolve", {
        hasCode: Boolean(code),
        hasState: Boolean(state),
        platform: statePlatform,
        message: errMsg,
        hint:
          code === "meta_exchange_failed" ? metaExchangeHint(errMsg, statePlatform) : undefined,
      }),
      code,
    );
  }
}
