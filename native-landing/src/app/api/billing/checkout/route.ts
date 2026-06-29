import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { siteUrl } from "@/lib/brand";
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

function checkoutErrorMessage(error: unknown) {
  if (error instanceof Stripe.errors.StripeError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Failed to create checkout session";
}

function isMissingStripeCustomer(error: unknown) {
  return (
    error instanceof Stripe.errors.StripeInvalidRequestError &&
    error.code === "resource_missing" &&
    error.param === "customer"
  );
}

async function createCheckoutSession(input: {
  customerId: string;
  priceId: string;
  userId: string;
  plan: PaidPlan;
  interval: BillingInterval;
}) {
  const stripe = getStripe();
  const appUrl = siteUrl();

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: input.customerId,
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: `${appUrl}/settings/billing?success=1`,
    cancel_url: `${appUrl}/settings/billing?canceled=1`,
    metadata: {
      clerkUserId: input.userId,
      plan: input.plan,
      interval: input.interval,
    },
    subscription_data: {
      metadata: {
        clerkUserId: input.userId,
        plan: input.plan,
        interval: input.interval,
      },
    },
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured yet. Add STRIPE_SECRET_KEY and monthly/yearly price IDs to your environment.",
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

    const clerkUser = await currentUser();
    const user = await getOrCreateUser(
      userId,
      clerkUser?.emailAddresses[0]?.emailAddress ?? null,
    );
    const stripe = getStripe();

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

    try {
      const session = await createCheckoutSession({
        customerId,
        priceId,
        userId,
        plan: data.plan,
        interval,
      });
      return NextResponse.json({ url: session.url });
    } catch (error) {
      if (!isMissingStripeCustomer(error)) {
        throw error;
      }

      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { clerkUserId: userId },
      });
      await updateUserSubscription(userId, {
        subscriptionTier: user.subscriptionTier,
        stripeCustomerId: customer.id,
      });

      const session = await createCheckoutSession({
        customerId: customer.id,
        priceId,
        userId,
        plan: data.plan,
        interval,
      });
      return NextResponse.json({ url: session.url });
    }
  } catch (error) {
    console.error("[billing-checkout]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: checkoutErrorMessage(error) }, { status: 500 });
  }
}
