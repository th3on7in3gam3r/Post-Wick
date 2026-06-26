import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBrandById, upsertConnection } from "@/lib/db";
import {
  buildXMetadata,
  exchangeXCode,
  getXUserProfile,
} from "@/lib/social/x";

const PKCE_COOKIE = "x_oauth_pkce";

function integrationsUrl(req: Request, query: string) {
  return new URL(`/settings/integrations?${query}`, req.url);
}

export async function GET(req: Request) {
  const clearPkce = (response: NextResponse) => {
    response.cookies.set(PKCE_COOKIE, "", { maxAge: 0, path: "/" });
    return response;
  };

  try {
    const { userId } = await auth();
    if (!userId) {
      return clearPkce(
        NextResponse.redirect(
          new URL("/sign-in?redirect_url=/settings/integrations", req.url),
        ),
      );
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const brandId = searchParams.get("state");
    const oauthError = searchParams.get("error");
    const codeVerifier = cookies().get(PKCE_COOKIE)?.value;

    if (oauthError) {
      return clearPkce(
        NextResponse.redirect(
          integrationsUrl(req, `error=${encodeURIComponent(oauthError)}`),
        ),
      );
    }

    if (!code || !brandId || !codeVerifier) {
      return clearPkce(
        NextResponse.redirect(integrationsUrl(req, "error=invalid_callback")),
      );
    }

    const brand = await getBrandById(brandId, userId);
    if (!brand) {
      return clearPkce(
        NextResponse.redirect(integrationsUrl(req, "error=brand_not_found")),
      );
    }

    const token = await exchangeXCode(code, codeVerifier);
    if (!token.access_token) {
      return clearPkce(
        NextResponse.redirect(integrationsUrl(req, "error=x_exchange_failed")),
      );
    }

    const profile = await getXUserProfile(token.access_token);
    const metadata = buildXMetadata(token, profile);

    await upsertConnection({
      id: randomUUID(),
      userId,
      brandId,
      platform: "twitter",
      accountName: `@${profile.username} on X`,
      accessToken: token.access_token,
      metadata,
      isDemo: false,
    });

    return clearPkce(
      NextResponse.redirect(integrationsUrl(req, "connected=twitter")),
    );
  } catch (error) {
    console.error("[x-callback]", error);
    return clearPkce(
      NextResponse.redirect(integrationsUrl(req, "error=x_exchange_failed")),
    );
  }
}
