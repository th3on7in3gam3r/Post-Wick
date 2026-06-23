import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById } from "@/lib/db";
import { getLinkedInAuthUrl } from "@/lib/social/linkedin";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");
  if (!brandId) {
    return NextResponse.json({ error: "brandId required" }, { status: 400 });
  }

  const brand = await getBrandById(brandId, userId);
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  try {
    const url = getLinkedInAuthUrl(brandId);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json(
      { error: "LinkedIn OAuth is not configured. Use demo connect instead." },
      { status: 503 },
    );
  }
}
