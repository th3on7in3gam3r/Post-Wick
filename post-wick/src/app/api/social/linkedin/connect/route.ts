import { NextResponse } from "next/server";
import { getLinkedInAuthUrl } from "@/lib/social/linkedin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");

  if (!brandId) {
    return NextResponse.json({ error: "brandId required" }, { status: 400 });
  }

  const url = await getLinkedInAuthUrl(brandId);
  return NextResponse.redirect(url);
}
