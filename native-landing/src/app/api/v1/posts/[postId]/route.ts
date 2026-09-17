import { NextResponse } from "next/server";
import { z } from "zod";
import {
  approveOrSkipPostForUser,
  assistantErrorResponse,
  reschedulePostForUser,
} from "@/lib/server/assistant-api";
import { requirePartnerApiUser } from "@/lib/server/partner-api-auth";

const actionSchema = z.object({
  action: z.enum(["approve", "skip"]),
});

const patchSchema = z.object({
  scheduledAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Invalid schedule date",
    }),
});

/** Approve (auto-schedule) or skip a pending post. */
export async function POST(
  req: Request,
  { params }: { params: { postId: string } },
) {
  const authResult = await requirePartnerApiUser(req);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const { action } = actionSchema.parse(body);
    const result = await approveOrSkipPostForUser(
      authResult.userId,
      params.postId,
      action,
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

/** Reschedule an approved post (set scheduledAt). */
export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } },
) {
  const authResult = await requirePartnerApiUser(req);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const { scheduledAt } = patchSchema.parse(body);
    const result = await reschedulePostForUser(
      authResult.userId,
      params.postId,
      scheduledAt,
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
