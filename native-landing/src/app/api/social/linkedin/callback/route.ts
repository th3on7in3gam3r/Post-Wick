import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById, upsertConnection } from "@/lib/db";
import { exchangeLinkedInCode } from "@/lib/social/linkedin";

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
    const brandId = searchParams.get("state");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      return NextResponse.redirect(
        integrationsUrl(req, `error=${encodeURIComponent(oauthError)}`),
      );
    }

    if (!code || !brandId) {
      return NextResponse.redirect(integrationsUrl(req, "error=invalid_callback"));
    }

    const brand = await getBrandById(brandId, userId);
    if (!brand) {
      return NextResponse.redirect(integrationsUrl(req, "error=brand_not_found"));
    }

    const token = await exchangeLinkedInCode(code);
    if (!token.access_token) {
      return NextResponse.redirect(
        integrationsUrl(req, "error=linkedin_exchange_failed"),
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

    return NextResponse.redirect(integrationsUrl(req, "connected=linkedin"));
  } catch (error) {
    console.error("[linkedin-callback]", error);
    return NextResponse.redirect(integrationsUrl(req, "error=linkedin_exchange_failed"));
  }
}
