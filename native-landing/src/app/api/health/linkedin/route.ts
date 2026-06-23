import { NextResponse } from "next/server";
import { linkedInRedirectUri } from "@/lib/social/linkedin";

export async function GET() {
  const redirectUri = linkedInRedirectUri();
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim() ?? null;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");

  return NextResponse.json({
    ok: Boolean(clientId),
    clientIdConfigured: Boolean(clientId),
    secretConfigured: Boolean(process.env.LINKEDIN_CLIENT_SECRET?.trim()),
    appUrl: appUrl || null,
    redirectUri,
    instructions: [
      `In LinkedIn Developers → your app → Auth → OAuth 2.0 redirect URLs, add EXACTLY:`,
      redirectUri,
      "No trailing slash. Must match character-for-character.",
      "Then connect from Settings → Integrations → Connect LinkedIn.",
    ],
  });
}
