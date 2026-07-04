import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById, upsertConnection } from "@/lib/db";
import {
  integrationsOAuthRedirect,
  OAUTH_DEBUG_COOKIE,
  oauthFailureRedirect,
  type OAuthDebugInfo,
} from "@/lib/integrations/oauth-debug";
import {
  exchangeLinkedInCode,
  linkedInRedirectHint,
} from "@/lib/social/linkedin";

function debugBase(
  step: string,
  overrides: Omit<Partial<OAuthDebugInfo>, "flow" | "step" | "at"> & { message: string },
): OAuthDebugInfo {
  return {
    flow: "linkedin",
    step,
    at: new Date().toISOString(),
    ...overrides,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const brandId = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const oauthErrorDescription = searchParams.get("error_description");

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(
        new URL("/sign-in?redirect_url=/settings/integrations", req.url),
      );
    }

    if (oauthError) {
      const detail =
        oauthErrorDescription?.trim() ||
        "LinkedIn rejected the OAuth request before returning an authorization code.";
      return oauthFailureRedirect(
        req,
        debugBase("oauth_denied", {
          metaError: oauthError,
          hasCode: Boolean(code),
          hasState: Boolean(brandId),
          message: detail,
          hint: linkedInRedirectHint(detail),
        }),
        "linkedin_oauth_error",
      );
    }

    if (!code || !brandId) {
      return oauthFailureRedirect(
        req,
        debugBase("invalid_callback", {
          hasCode: Boolean(code),
          hasState: Boolean(brandId),
          message: "LinkedIn returned to Kerygma without a complete authorization callback.",
          hint: linkedInRedirectHint(),
        }),
        "invalid_callback",
      );
    }

    const brand = await getBrandById(brandId, userId);
    if (!brand) {
      return oauthFailureRedirect(
        req,
        debugBase("brand_not_found", {
          hasCode: true,
          hasState: true,
          message: "The brand for this LinkedIn connection was not found.",
        }),
        "brand_not_found",
      );
    }

    let token: { access_token: string };
    try {
      token = await exchangeLinkedInCode(code);
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to exchange LinkedIn authorization code.";
      return oauthFailureRedirect(
        req,
        debugBase("token_exchange", {
          hasCode: true,
          hasState: true,
          message: errMsg,
          hint: linkedInRedirectHint(errMsg),
        }),
        "linkedin_exchange_failed",
      );
    }

    if (!token.access_token) {
      return oauthFailureRedirect(
        req,
        debugBase("token_exchange", {
          hasCode: true,
          hasState: true,
          message: "LinkedIn token exchange succeeded but no access token was returned.",
          hint: linkedInRedirectHint(),
        }),
        "linkedin_exchange_failed",
      );
    }

    await upsertConnection({
      id: randomUUID(),
      userId,
      brandId,
      platform: "linkedin",
      accountName: `${brand.name} on LinkedIn`,
      accessToken: token.access_token,
      isDemo: false,
    });

    const response = NextResponse.redirect(
      integrationsOAuthRedirect(req, new URLSearchParams({ connected: "linkedin" })),
    );
    response.cookies.delete(OAUTH_DEBUG_COOKIE);
    return response;
  } catch (error) {
    console.error("[linkedin-callback]", error);
    const errMsg =
      error instanceof Error ? error.message : "LinkedIn authorization failed unexpectedly.";
    return oauthFailureRedirect(
      req,
      debugBase("unexpected_error", {
        hasCode: Boolean(code),
        hasState: Boolean(brandId),
        message: errMsg,
        hint: linkedInRedirectHint(errMsg),
      }),
      "linkedin_exchange_failed",
    );
  }
}
