import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAgency, getAgencyByOwnerUserId } from "@/lib/db";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email().optional().nullable(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getAgencyByOwnerUserId(userId);
  if (existing) {
    return NextResponse.json({ error: "Agency already registered" }, { status: 409 });
  }

  try {
    const body = await req.json();
    const data = bodySchema.parse(body);
    const agency = await createAgency({
      ownerUserId: userId,
      name: data.name,
      contactEmail: data.contactEmail,
    });

    return NextResponse.json({ agency }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to register agency" }, { status: 500 });
  }
}
