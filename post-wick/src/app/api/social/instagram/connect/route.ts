import { NextResponse } from "next/server";
import { getInstagramAuthUrl } from "@/lib/social/instagram";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");

  if (!brandId) {
    return NextResponse.json({ error: "brandId required" }, { status: 400 });
  }

  const url = await getInstagramAuthUrl(brandId);
  return NextResponse.redirect(url);
}
