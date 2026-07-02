import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getUserByStripeCustomerId, markAffiliateReferralConverted, updateUserSubscription } from "@/lib/db";
import { getStripe, tierFromStripePriceId } from "@/lib/stripe";

async function resolveUserIdFromSubscription(subscription: Stripe.Subscription) {
  const metadataUserId = subscription.metadata?.clerkUserId;
  if (metadataUserId) return metadataUserId;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return null;

  const user = await getUserByStripeCustomerId(customerId);
  return user?.id ?? null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.clerkUserId;
      const plan = session.metadata?.plan;
      if (userId) {
        const tier = plan === "max" ? "max" : plan === "pro" ? "pro" : "free";
        await updateUserSubscription(userId, {
          subscriptionTier: tier,
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : session.customer?.id,
        });
        await markAffiliateReferralConverted(userId, tier);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = await resolveUserIdFromSubscription(subscription);
      if (!userId) break;

      const priceId = subscription.items.data[0]?.price.id;
      const active = subscription.status === "active" || subscription.status === "trialing";
      const tier = active ? tierFromStripePriceId(priceId) : "free";
      await updateUserSubscription(userId, {
        subscriptionTier: tier,
        stripeCustomerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id,
      });
      await markAffiliateReferralConverted(userId, tier);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
