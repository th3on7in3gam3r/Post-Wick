import { NextResponse } from "next/server";
import { sendWeeklyDigestToAllUsers } from "@/lib/digest/weekly-digest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await sendWeeklyDigestToAllUsers();
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    console.error("[cron-weekly-digest]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Weekly digest cron failed",
      },
      { status: 500 },
    );
  }
}
