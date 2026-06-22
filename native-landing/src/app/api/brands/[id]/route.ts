import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deleteBrand, getBrandById, getPostsByBrandId } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brand = getBrandById(params.id, userId);
  if (!brand) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const posts = getPostsByBrandId(brand.id);

  return NextResponse.json({
    brand: {
      ...brand,
      researchData: brand.researchData ? JSON.parse(brand.researchData) : null,
    },
    posts,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const removed = deleteBrand(params.id, userId);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
