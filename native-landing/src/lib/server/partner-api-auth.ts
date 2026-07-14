import { NextResponse } from "next/server";
import {
  extractApiKeyFromRequest,
  isKerygmaApiKeyFormat,
} from "@/lib/api-keys";
import { authenticateWithApiKey } from "@/lib/db";

export async function requirePartnerApiUser(req: Request) {
  const rawKey = extractApiKeyFromRequest(req);
  if (!rawKey || !isKerygmaApiKeyFormat(rawKey)) {
    return {
      error: NextResponse.json(
        { error: "Missing or invalid API key. Use Authorization: Bearer ks_live_…" },
        { status: 401 },
      ),
    };
  }

  const auth = await authenticateWithApiKey(rawKey);
  if (!auth) {
    return {
      error: NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 }),
    };
  }

  return { userId: auth.userId, keyId: auth.keyId };
}
