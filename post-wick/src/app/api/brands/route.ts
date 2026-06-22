import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandsByUserId, createBrand } from "@/lib/db/queries";
import { z } from "zod";

const createBrandSchema = z.object({
  name: z.string().min(1).max(255),
  websiteUrl: z.string().url(),
  description: z.string().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const brands = await getBrandsByUserId(userId);
    return NextResponse.json(brands);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createBrandSchema.parse(body);
    const brand = await createBrand({ ...data, userId });
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 },
    );
  }
}
