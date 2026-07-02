import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAgencyByOwnerUserId, updateAgencyWhiteLabel } from "@/lib/db";

const bodySchema = z.object({
  whiteLabelName: z.string().trim().max(80).nullable(),
});

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agency = await getAgencyByOwnerUserId(userId);
  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = bodySchema.parse(body);
    const updated = await updateAgencyWhiteLabel(userId, data.whiteLabelName);
    return NextResponse.json({ agency: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update white-label settings" }, { status: 500 });
  }
}
