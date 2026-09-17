import { NextResponse } from "next/server";
import {
  assistantErrorResponse,
  generatePostsForUser,
} from "@/lib/server/assistant-api";
import { requirePartnerApiUser } from "@/lib/server/partner-api-auth";

export const maxDuration = 300;

/** Generate pending draft posts for a brand. */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const authResult = await requirePartnerApiUser(req);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json().catch(() => ({}));
    const result = await generatePostsForUser(
      authResult.userId,
      params.id,
      body,
    );
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    const mapped = assistantErrorResponse(error);
    return NextResponse.json(
      { error: mapped.error },
      { status: mapped.status },
    );
  }
}
