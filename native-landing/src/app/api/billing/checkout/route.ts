import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser, updateUserSubscription } from "@/lib/db";
import { getStripe, isStripeConfigured, STRIPE_PLANS, type PaidPlan } from "@/lib/stripe";

const checkoutSchema = z.object({
  plan: z.enum(["pro", "max"]),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY and price IDs to .env.local." },
      { status: 503 },
    );
  }

  try {
    const body = await req.json();
    const { plan } = checkoutSchema.parse(body);
    const user = getOrCreateUser(userId);
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const selected = STRIPE_PLANS[plan as PaidPlan];

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { clerkUserId: userId },
      });
      customerId = customer.id;
      updateUserSubscription(userId, {
        subscriptionTier: user.subscriptionTier,
        stripeCustomerId: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: selected.priceId, quantity: 1 }],
      success_url: `${appUrl}/settings/billing?success=1`,
      cancel_url: `${appUrl}/settings/billing?canceled=1`,
      metadata: { clerkUserId: userId, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
