import { NextResponse } from "next/server";
import { sendQueueRemindersToAllUsers } from "@/lib/notifications/queue-reminder";

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
    const summary = await sendQueueRemindersToAllUsers();
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    console.error("[cron-queue-reminders]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Queue reminder cron failed",
      },
      { status: 500 },
    );
  }
}
