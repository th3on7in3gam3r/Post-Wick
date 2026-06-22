import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById, updateBrand } from "@/lib/db/queries";
import { researchBrand } from "@/lib/ai/research";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const brand = await getBrandById(id, userId);
    if (!brand) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const researchData = await researchBrand(brand.websiteUrl);
    const updated = await updateBrand(id, userId, { researchData });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to research brand" },
      { status: 500 },
    );
  }
}
