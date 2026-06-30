import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteConnection, getBrandById, getConnectionsByUserId, getOrCreateUser, upsertConnection } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await getConnectionsByUserId(userId);
  return NextResponse.json(
    connections.map(({ accessToken, ...connection }) => {
      void accessToken;
      return connection;
    }),
  );
}

const demoSchema = z.object({
  brandId: z.string().min(1),
  platform: z.string().min(1),
  accountName: z.string().optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = demoSchema.parse(body);
    const brand = await getBrandById(data.brandId, userId);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const user = await getOrCreateUser(userId);
    if (!user.demoModeEnabled) {
      return NextResponse.json(
        { error: "Demo mode is off. Turn it on in Settings → Integrations to use demo connections." },
        { status: 403 },
      );
    }

    const platform = data.platform.toLowerCase();
    const connection = await upsertConnection({
      id: randomUUID(),
      userId,
      brandId: data.brandId,
      platform,
      accountName: data.accountName ?? `Demo ${platform} account`,
      isDemo: true,
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to connect account" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const connectionId = searchParams.get("id");
  if (!connectionId) {
    return NextResponse.json({ error: "Connection id required" }, { status: 400 });
  }

  const removed = await deleteConnection(connectionId, userId);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
