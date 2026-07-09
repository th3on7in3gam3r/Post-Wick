import { NextResponse } from "next/server";
import { getUserByEmail, updateUserSubscription } from "@/lib/db";
import {
  kerygmaTierFromEvent,
  verifyStudioBillingSignature,
  type StudioBillingPartnerEvent,
} from "@/lib/studio-billing";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-studio-billing-signature");

  if (!verifyStudioBillingSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: StudioBillingPartnerEvent;
  try {
    event = JSON.parse(body) as StudioBillingPartnerEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!event.products.includes("kerygma")) {
    return NextResponse.json({ ok: true, skipped: "not a Kerygma bundle" });
  }

  const clerkId = event.linkedIds.kerygmaUserId || event.linkedIds.clerkId;
  let userId = clerkId || null;
  if (!userId && event.email) {
    const user = await getUserByEmail(event.email);
    userId = user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json(
      { error: "No Kerygma user — sign up with the same email or link in Cadence Studio settings" },
      { status: 404 },
    );
  }

  const tier = kerygmaTierFromEvent(event);
  await updateUserSubscription(userId, {
    subscriptionTier: tier,
    stripeCustomerId: event.stripeCustomerId,
  });

  return NextResponse.json({ ok: true, userId, tier });
}
