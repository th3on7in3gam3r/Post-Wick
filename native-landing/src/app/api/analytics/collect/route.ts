import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PULSE_COLLECT_URL =
  process.env.PULSE_COLLECT_URL?.trim() ||
  "https://pulse-5o1m.onrender.com/api/collect";

const MAX_BODY_BYTES = 64_000;

/**
 * Same-origin proxy for Pulse analytics so the browser never hits
 * pulse-5o1m.onrender.com cross-origin (avoids CORS / credentials failures).
 */
export async function POST(req: Request) {
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!raw || raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("siteId" in parsed) ||
    typeof (parsed as { siteId: unknown }).siteId !== "string" ||
    !(parsed as { siteId: string }).siteId.trim()
  ) {
    return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const pulseKey = req.headers.get("x-pulse-key");
  if (pulseKey) headers["X-Pulse-Key"] = pulseKey;

  try {
    const upstream = await fetch(PULSE_COLLECT_URL, {
      method: "POST",
      headers,
      body: raw,
      cache: "no-store",
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
  }
}
