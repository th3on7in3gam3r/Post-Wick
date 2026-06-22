import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getBrandById,
  updateBrand,
  deleteBrand,
} from "@/lib/db/queries";
import { z } from "zod";

const updateBrandSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  websiteUrl: z.string().url().optional(),
  description: z.string().optional(),
  postingFrequency: z.number().int().min(1).max(50).optional(),
});

export async function GET(
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
    return NextResponse.json(brand);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateBrandSchema.parse(body);
    const brand = await updateBrand(id, userId, data);
    if (!brand) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(brand);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const brand = await deleteBrand(id, userId);
    if (!brand) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 },
    );
  }
}
