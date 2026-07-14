import { NextResponse } from "next/server";
import { getBrandsByUserId, getOrCreateUser, getUserById } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { requirePartnerApiUser } from "@/lib/server/partner-api-auth";

/** Verify a Kerygma API key (Cadence / growth stack). */
export async function GET(req: Request) {
  const authResult = await requirePartnerApiUser(req);
  if ("error" in authResult) return authResult.error;

  const user = (await getUserById(authResult.userId)) ?? (await getOrCreateUser(authResult.userId));
  const brands = await getBrandsByUserId(authResult.userId);
  const plan = getPlanLimits(user.subscriptionTier);

  return NextResponse.json({
    ok: true,
    product: "kerygma-social",
    user: {
      id: user.id,
      email: user.email,
      tier: user.subscriptionTier,
      planLabel: plan.label,
    },
    brands: brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      websiteUrl: brand.websiteUrl,
      crawlStatus: brand.crawlStatus,
    })),
  });
}
