import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser, updateUserSettings } from "@/lib/db";
import { TIMEZONE_OPTIONS } from "@/lib/user-settings";

const timezoneValues = TIMEZONE_OPTIONS.map((option) => option.value) as [
  string,
  ...string[],
];

const settingsSchema = z.object({
  timezone: z.enum(timezoneValues).optional(),
  defaultPostingFrequency: z
    .union([z.literal(3), z.literal(5), z.literal(7)])
    .optional(),
  notifyQueue: z.boolean().optional(),
  notifyPublish: z.boolean().optional(),
  notifyWeeklyDigest: z.boolean().optional(),
  demoModeEnabled: z.boolean().optional(),
});

function serializeSettings(user: Awaited<ReturnType<typeof getOrCreateUser>>) {
  return {
    timezone: user.timezone,
    defaultPostingFrequency: user.defaultPostingFrequency,
    notifyQueue: user.notifyQueue,
    notifyPublish: user.notifyPublish,
    notifyWeeklyDigest: user.notifyWeeklyDigest,
    demoModeEnabled: user.demoModeEnabled,
  };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getOrCreateUser(userId);
  return NextResponse.json({ settings: serializeSettings(user) });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = settingsSchema.parse(body);
    const user = await updateUserSettings(userId, data);
    return NextResponse.json({ settings: serializeSettings(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
