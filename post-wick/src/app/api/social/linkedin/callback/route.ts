import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const brandId = searchParams.get("state");

  if (!code || !brandId) {
    return NextResponse.json({ error: "Invalid callback" }, { status: 400 });
  }

  // TODO: Exchange code for tokens and store encrypted in DB
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections?connected=linkedin`,
  );
}
