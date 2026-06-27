import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBrandById, getMetaOauthPendingById, getMetaOauthPendingForBrand } from "@/lib/db";
import { PINTEREST_BOARD_PICK_COOKIE } from "@/lib/social/pinterest-pending";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brandId = new URL(req.url).searchParams.get("brandId");
  const pendingId = cookies().get(PINTEREST_BOARD_PICK_COOKIE)?.value;

  if (!brandId || !pendingId) {
    if (!brandId) {
      return NextResponse.json({ error: "Missing board selection session" }, { status: 400 });
    }
  }

  const brand = await getBrandById(brandId, userId);
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const pending =
    (pendingId ? await getMetaOauthPendingById(pendingId, userId) : null) ??
    (await getMetaOauthPendingForBrand(userId, brandId, "pinterest"));
  if (!pending || pending.brandId !== brandId || pending.platform !== "pinterest") {
    return NextResponse.json({ error: "Board selection session expired" }, { status: 404 });
  }

  return NextResponse.json({
    brandName: brand.name,
    boards: pending.pages.map((board) => ({
      id: board.id,
      name: board.name,
      pictureUrl: board.pictureUrl,
    })),
  });
}
