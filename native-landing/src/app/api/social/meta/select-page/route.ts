import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteMetaOauthPending,
  getBrandById,
  getMetaOauthPendingById,
  upsertConnection,
} from "@/lib/db";
import { buildFacebookConnectionFromPage } from "@/lib/social/meta";
import {
  META_FACEBOOK_PAGE_PICK_COOKIE,
} from "@/lib/social/meta-pending";

const selectPageSchema = z.object({
  brandId: z.string().min(1),
  pageId: z.string().min(1),
});

function clearPendingCookie(response: NextResponse) {
  response.cookies.set(META_FACEBOOK_PAGE_PICK_COOKIE, "", {
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
    const { brandId, pageId } = selectPageSchema.parse(body);
    const pendingId = cookies().get(META_FACEBOOK_PAGE_PICK_COOKIE)?.value;

    if (!pendingId) {
      return NextResponse.json({ error: "Page selection session expired" }, { status: 400 });
    }

    const brand = await getBrandById(brandId, userId);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const pending = await getMetaOauthPendingById(pendingId, userId);
    if (!pending || pending.brandId !== brandId || pending.platform !== "facebook") {
      return clearPendingCookie(
        NextResponse.json({ error: "Page selection session expired" }, { status: 404 }),
      );
    }

    const page = pending.pages.find((item) => item.id === pageId);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const resolved = buildFacebookConnectionFromPage(page);
    await upsertConnection({
      id: randomUUID(),
      userId,
      brandId,
      platform: "facebook",
      accountName: resolved.accountName,
      accessToken: resolved.accessToken,
      metadata: resolved.metadata,
      isDemo: false,
    });

    await deleteMetaOauthPending(pendingId, userId);

    return clearPendingCookie(NextResponse.json({ ok: true }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[meta-select-page]", error);
    return NextResponse.json({ error: "Failed to connect Facebook Page" }, { status: 500 });
  }
}
