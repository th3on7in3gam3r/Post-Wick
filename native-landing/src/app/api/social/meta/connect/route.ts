import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById } from "@/lib/db";
import { getMetaAuthUrl, type MetaPlatform } from "@/lib/social/meta";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");
  const platform = searchParams.get("platform");

  if (!brandId || (platform !== "instagram" && platform !== "facebook")) {
    return NextResponse.json(
      { error: "brandId and platform (instagram|facebook) required" },
      { status: 400 },
    );
  }

  const brand = await getBrandById(brandId, userId);
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  try {
    const url = getMetaAuthUrl(brandId, platform as MetaPlatform);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json(
      { error: "Meta OAuth is not configured. Use demo connect instead." },
      { status: 503 },
    );
  }
}
