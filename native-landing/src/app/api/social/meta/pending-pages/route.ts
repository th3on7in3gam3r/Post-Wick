import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBrandById, getMetaOauthPendingById } from "@/lib/db";
import { META_FACEBOOK_PAGE_PICK_COOKIE } from "@/lib/social/meta-pending";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brandId = new URL(req.url).searchParams.get("brandId");
  const pendingId = cookies().get(META_FACEBOOK_PAGE_PICK_COOKIE)?.value;

  if (!brandId || !pendingId) {
    return NextResponse.json({ error: "Missing page selection session" }, { status: 400 });
  }

  const brand = await getBrandById(brandId, userId);
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const pending = await getMetaOauthPendingById(pendingId, userId);
  if (!pending || pending.brandId !== brandId || pending.platform !== "facebook") {
    return NextResponse.json({ error: "Page selection session expired" }, { status: 404 });
  }

  return NextResponse.json({
    brandName: brand.name,
    pages: pending.pages.map((page) => ({
      id: page.id,
      name: page.name,
      pictureUrl: page.pictureUrl,
    })),
  });
}
