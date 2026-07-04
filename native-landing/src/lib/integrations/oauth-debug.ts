import { NextResponse } from "next/server";

export const OAUTH_DEBUG_COOKIE = "kerygma_oauth_debug";

export type OAuthDebugInfo = {
  flow: "meta" | "linkedin" | "x" | "pinterest";
  step: string;
  at: string;
  hasCode?: boolean;
  hasState?: boolean;
  platform?: string;
  metaError?: string;
  message: string;
  hint?: string;
};

export function integrationsOAuthRedirect(req: Request, params: URLSearchParams) {
  return new URL(`/settings/integrations?${params.toString()}`, req.url);
}

export function oauthFailureRedirect(
  req: Request,
  debug: OAuthDebugInfo,
  errorCode: string,
) {
  console.error(`[${debug.flow}-callback]`, JSON.stringify(debug));

  const params = new URLSearchParams({ error: errorCode });
  if (debug.message) {
    params.set("detail", debug.message.slice(0, 240));
  }

  const response = NextResponse.redirect(integrationsOAuthRedirect(req, params));
  response.cookies.set(OAUTH_DEBUG_COOKIE, JSON.stringify(debug), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  return response;
}

export function parseOAuthDebugCookie(value: string | undefined): OAuthDebugInfo | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as OAuthDebugInfo;
    if (parsed.flow && parsed.step && parsed.message) {
      return parsed;
    }
  } catch {
    // ignore malformed cookie
  }

  return null;
}
