import { NextResponse } from "next/server";
import {
  assistantErrorResponse,
  getBrandForUser,
} from "@/lib/server/assistant-api";
import { requirePartnerApiUser } from "@/lib/server/partner-api-auth";

/** Read brand voice / research summary. */
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const authResult = await requirePartnerApiUser(req);
  if ("error" in authResult) return authResult.error;

  try {
    const brand = await getBrandForUser(authResult.userId, params.id);
    return NextResponse.json({ ok: true, brand });
  } catch (error) {
    const mapped = assistantErrorResponse(error);
    return NextResponse.json(
      { error: mapped.error },
      { status: mapped.status },
    );
  }
}
