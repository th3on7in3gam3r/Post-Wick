import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBrandById } from "@/lib/db";
import {
  generateXCodeChallenge,
  generateXCodeVerifier,
  getXAuthUrl,
} from "@/lib/social/x";

const PKCE_COOKIE = "x_oauth_pkce";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");
  if (!brandId) {
    return NextResponse.json({ error: "brandId required" }, { status: 400 });
  }

  const brand = await getBrandById(brandId, userId);
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  try {
    const verifier = generateXCodeVerifier();
    const challenge = generateXCodeChallenge(verifier);
    const url = getXAuthUrl(brandId, challenge);
    const response = NextResponse.redirect(url);
    response.cookies.set(PKCE_COOKIE, verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "X OAuth is not configured. Use demo connect instead." },
      { status: 503 },
    );
  }
}
