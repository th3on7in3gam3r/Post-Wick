import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById, upsertConnection } from "@/lib/db";
import { exchangeLinkedInCode } from "@/lib/social/linkedin";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect("/sign-in");
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const brandId = searchParams.get("state");

  if (!code || !brandId) {
    return NextResponse.redirect("/settings/connections?error=invalid_callback");
  }

  const brand = await getBrandById(brandId, userId);
  if (!brand) {
    return NextResponse.redirect("/settings/connections?error=brand_not_found");
  }

  try {
    const token = await exchangeLinkedInCode(code);
    await upsertConnection({
      id: randomUUID(),
      userId,
      brandId,
      platform: "linkedin",
      accountName: `${brand.name} on LinkedIn`,
      accessToken: token.access_token,
      isDemo: false,
    });

    return NextResponse.redirect("/settings/connections?connected=linkedin");
  } catch {
    return NextResponse.redirect("/settings/connections?error=linkedin_exchange_failed");
  }
}
