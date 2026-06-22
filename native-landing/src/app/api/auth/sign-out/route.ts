import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { sessionId } = await auth();

  if (sessionId) {
    await clerkClient.sessions.revokeSession(sessionId);
  }

  return NextResponse.json({ ok: true });
}
