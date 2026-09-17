import { NextResponse } from "next/server";
import {
  assistantErrorResponse,
  listBrandsForUser,
} from "@/lib/server/assistant-api";
import { requirePartnerApiUser } from "@/lib/server/partner-api-auth";

/** List brands for the API key owner. */
export async function GET(req: Request) {
  const authResult = await requirePartnerApiUser(req);
  if ("error" in authResult) return authResult.error;

  try {
    const brands = await listBrandsForUser(authResult.userId);
    return NextResponse.json({ ok: true, brands });
  } catch (error) {
    const mapped = assistantErrorResponse(error);
    return NextResponse.json(
      { error: mapped.error },
      { status: mapped.status },
    );
  }
}
