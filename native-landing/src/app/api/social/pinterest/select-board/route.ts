import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteMetaOauthPending,
  getBrandById,
  getMetaOauthPendingById,
  getMetaOauthPendingForBrand,
  upsertConnection,
} from "@/lib/db";
import { buildPinterestConnectionFromBoard } from "@/lib/social/pinterest";
import { PINTEREST_BOARD_PICK_COOKIE } from "@/lib/social/pinterest-pending";

const selectBoardSchema = z.object({
  brandId: z.string().min(1),
  boardId: z.string().min(1),
});

function clearPendingCookie(response: NextResponse) {
  response.cookies.set(PINTEREST_BOARD_PICK_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { brandId, boardId } = selectBoardSchema.parse(body);
    const pendingId = cookies().get(PINTEREST_BOARD_PICK_COOKIE)?.value;

    const brand = await getBrandById(brandId, userId);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const pending =
      (pendingId ? await getMetaOauthPendingById(pendingId, userId) : null) ??
      (await getMetaOauthPendingForBrand(userId, brandId, "pinterest"));
    if (!pending || pending.brandId !== brandId || pending.platform !== "pinterest") {
      return clearPendingCookie(
        NextResponse.json({ error: "Board selection session expired" }, { status: 404 }),
      );
    }

    const resolvedPendingId = pending.id;

    const board = pending.pages.find((item) => item.id === boardId);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const resolved = buildPinterestConnectionFromBoard({
      board: {
        id: board.id,
        name: board.name,
        pictureUrl: board.pictureUrl,
      },
      accessToken: board.accessToken,
      refreshToken: board.refreshToken ?? undefined,
      expiresIn: board.accessTokenExpiresIn ?? undefined,
      refreshTokenExpiresIn: board.refreshTokenExpiresIn ?? undefined,
    });

    await upsertConnection({
      id: randomUUID(),
      userId,
      brandId,
      platform: "pinterest",
      accountName: resolved.accountName,
      accessToken: resolved.accessToken,
      metadata: resolved.metadata,
      isDemo: false,
    });

    await deleteMetaOauthPending(resolvedPendingId, userId);

    return clearPendingCookie(NextResponse.json({ ok: true }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[pinterest-select-board]", error);
    return NextResponse.json({ error: "Failed to connect Pinterest board" }, { status: 500 });
  }
}
