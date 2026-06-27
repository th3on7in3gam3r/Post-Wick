import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getBrandById,
  saveMetaOauthPending,
  upsertConnection,
} from "@/lib/db";
import {
  buildPinterestConnectionFromBoard,
  exchangePinterestCode,
  fetchPinterestBoards,
  fetchPinterestUserAccount,
} from "@/lib/social/pinterest";
import {
  PINTEREST_BOARD_PICK_COOKIE,
  PINTEREST_OAUTH_PENDING_TTL_SECONDS,
} from "@/lib/social/pinterest-pending";

function integrationsUrl(req: Request, query: string) {
  return new URL(`/settings/integrations?${query}`, req.url);
}

function selectBoardUrl(req: Request, brandId: string) {
  return new URL(
    `/settings/integrations/pinterest/select-board?brandId=${encodeURIComponent(brandId)}`,
    req.url,
  );
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(
        new URL("/sign-in?redirect_url=/settings/integrations", req.url),
      );
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const brandId = searchParams.get("state");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      return NextResponse.redirect(
        integrationsUrl(req, `error=${encodeURIComponent(oauthError)}`),
      );
    }

    if (!code || !brandId) {
      return NextResponse.redirect(integrationsUrl(req, "error=invalid_callback"));
    }

    const brand = await getBrandById(brandId, userId);
    if (!brand) {
      return NextResponse.redirect(integrationsUrl(req, "error=brand_not_found"));
    }

    const token = await exchangePinterestCode(code);
    if (!token.access_token) {
      return NextResponse.redirect(integrationsUrl(req, "error=pinterest_exchange_failed"));
    }

    const [boards, account] = await Promise.all([
      fetchPinterestBoards(token.access_token),
      fetchPinterestUserAccount(token.access_token).catch(() => ({ username: undefined })),
    ]);

    if (boards.length === 0) {
      return NextResponse.redirect(integrationsUrl(req, "error=pinterest_no_boards"));
    }

    if (boards.length === 1) {
      const resolved = buildPinterestConnectionFromBoard({
        board: boards[0]!,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresIn: token.expires_in,
        refreshTokenExpiresIn: token.refresh_token_expires_in,
        username: account.username,
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

      return NextResponse.redirect(integrationsUrl(req, "connected=pinterest"));
    }

    const pendingId = randomUUID();
    const expiresAt = new Date(
      Date.now() + PINTEREST_OAUTH_PENDING_TTL_SECONDS * 1000,
    ).toISOString();

    await saveMetaOauthPending({
      id: pendingId,
      userId,
      brandId,
      platform: "pinterest",
      pages: boards.map((board) => ({
        id: board.id,
        name: board.name,
        pictureUrl: board.pictureUrl,
        accessToken: token.access_token,
        refreshToken: token.refresh_token ?? null,
        refreshTokenExpiresIn: token.refresh_token_expires_in ?? null,
        accessTokenExpiresIn: token.expires_in ?? null,
      })),
      expiresAt,
    });

    const response = NextResponse.redirect(selectBoardUrl(req, brandId));
    response.cookies.set(PINTEREST_BOARD_PICK_COOKIE, pendingId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: PINTEREST_OAUTH_PENDING_TTL_SECONDS,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("[pinterest-callback]", error);
    return NextResponse.redirect(integrationsUrl(req, "error=pinterest_exchange_failed"));
  }
}
