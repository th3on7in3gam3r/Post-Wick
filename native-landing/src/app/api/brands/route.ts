import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createBrand, getBrandsByUserId } from "@/lib/db";
import { normalizeWebsiteUrl } from "@/lib/website-url";

const createBrandSchema = z.object({
  name: z.string().min(1).max(255),
  websiteUrl: z.string().min(1),
  description: z.string().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brands = getBrandsByUserId(userId).map((brand) => ({
    ...brand,
    researchData: brand.researchData ? JSON.parse(brand.researchData) : null,
  }));

  return NextResponse.json(brands);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createBrandSchema.parse(body);
    const websiteUrl = normalizeWebsiteUrl(data.websiteUrl);
    if (!websiteUrl) {
      return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
    }

    const brand = createBrand({
      id: randomUUID(),
      userId,
      name: data.name,
      websiteUrl,
      description: data.description,
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
