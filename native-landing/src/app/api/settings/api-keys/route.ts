import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createApiKeyForUser,
  listApiKeysForUser,
  revokeApiKeyForUser,
} from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await listApiKeysForUser(userId);
  return NextResponse.json({ keys });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { name } = createSchema.parse(body);
    const existing = await listApiKeysForUser(userId);
    if (existing.length >= 5) {
      return NextResponse.json(
        { error: "You can have up to 5 active API keys. Revoke one to create another." },
        { status: 400 },
      );
    }

    const { key, rawKey } = await createApiKeyForUser(userId, name ?? "Cadence");
    return NextResponse.json({
      key,
      rawKey,
      notice:
        "Copy this key now — it won’t be shown again. Paste it into Cadence → Settings → Growth stack API keys → Kerygma Social.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}

const revokeSchema = z.object({
  keyId: z.string().trim().min(1),
});

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { keyId } = revokeSchema.parse(body);
    const revoked = await revokeApiKeyForUser(keyId, userId);
    if (!revoked) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
  }
}
