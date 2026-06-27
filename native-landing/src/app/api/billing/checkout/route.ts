import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser, updateUserSubscription } from "@/lib/db";
import {
  getAvailableBillingIntervals,
  getStripe,
  getStripePriceId,
  isStripeConfigured,
  type BillingInterval,
  type PaidPlan,
} from "@/lib/stripe";

const checkoutSchema = z.object({
  plan: z.enum(["pro", "max"]),
  interval: z.enum(["monthly", "yearly"]).optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured yet. Add STRIPE_SECRET_KEY and monthly/yearly price IDs to .env.local.",
      },
      { status: 503 },
    );
  }

  try {
    const body = await req.json();
    const data = checkoutSchema.parse(body);
    const availableIntervals = getAvailableBillingIntervals();
    const interval: BillingInterval =
      data.interval && availableIntervals.includes(data.interval)
        ? data.interval
        : (availableIntervals[0] ?? "yearly");

    const priceId = getStripePriceId(data.plan as PaidPlan, interval);
    if (!priceId) {
      return NextResponse.json(
        { error: `No Stripe price configured for ${data.plan} (${interval})` },
        { status: 400 },
      );
    }

    const user = await getOrCreateUser(userId);
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { clerkUserId: userId },
      });
      customerId = customer.id;
      await updateUserSubscription(userId, {
        subscriptionTier: user.subscriptionTier,
        stripeCustomerId: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings/billing?success=1`,
      cancel_url: `${appUrl}/settings/billing?canceled=1`,
      metadata: { clerkUserId: userId, plan: data.plan, interval },
      subscription_data: {
        metadata: { clerkUserId: userId, plan: data.plan, interval },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
