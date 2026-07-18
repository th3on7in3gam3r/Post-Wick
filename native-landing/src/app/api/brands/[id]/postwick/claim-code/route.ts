import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createPostwickClaimCode, getBrandById } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brand = await getBrandById(params.id, userId);
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  if (!brand.postwickAutoShare) {
    return NextResponse.json(
      { error: "Connect this brand to Postwick before generating a claim code." },
      { status: 400 },
    );
  }

  try {
    const issued = await createPostwickClaimCode(userId, params.id);
    if (!issued) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({
      code: issued.code,
      brandId: issued.brandId,
      expiresAt: issued.expiresAt,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate claim code" },
      { status: 500 },
    );
  }
}
