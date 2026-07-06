import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getConnectionById } from "@/lib/db";
import { verifyConnection } from "@/lib/integrations/connection-health";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connection = await getConnectionById(params.id, userId);
  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  const result = await verifyConnection(connection);
  return NextResponse.json(result);
}
