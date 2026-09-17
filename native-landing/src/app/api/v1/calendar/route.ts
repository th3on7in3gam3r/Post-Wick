import { NextResponse } from "next/server";
import {
  assistantErrorResponse,
  getCalendarForUser,
} from "@/lib/server/assistant-api";
import { requirePartnerApiUser } from "@/lib/server/partner-api-auth";

/** Calendar of posts with scheduledAt in a date range. */
export async function GET(req: Request) {
  const authResult = await requirePartnerApiUser(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(req.url);
    const result = await getCalendarForUser(
      authResult.userId,
      searchParams.get("from"),
      searchParams.get("to"),
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const mapped = assistantErrorResponse(error);
    return NextResponse.json(
      { error: mapped.error },
      { status: mapped.status },
    );
  }
}
