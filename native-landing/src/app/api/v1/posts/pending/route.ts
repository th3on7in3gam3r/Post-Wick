import { NextResponse } from "next/server";
import {
  assistantErrorResponse,
  listPendingPostsForUser,
} from "@/lib/server/assistant-api";
import { requirePartnerApiUser } from "@/lib/server/partner-api-auth";

/** List pending posts awaiting approval. */
export async function GET(req: Request) {
  const authResult = await requirePartnerApiUser(req);
  if ("error" in authResult) return authResult.error;

  try {
    const result = await listPendingPostsForUser(authResult.userId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const mapped = assistantErrorResponse(error);
    return NextResponse.json(
      { error: mapped.error },
      { status: mapped.status },
    );
  }
}
