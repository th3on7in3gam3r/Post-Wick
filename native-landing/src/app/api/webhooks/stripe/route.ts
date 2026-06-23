import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { updateUserSubscription } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

function tierFromPriceId(priceId: string | undefined) {
  if (!priceId) return "free" as const;
  if (priceId === process.env.STRIPE_MAX_PRICE_ID) return "max" as const;
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro" as const;
  return "free" as const;
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
        await updateUserSubscription(userId, {
          subscriptionTier: plan === "max" ? "max" : plan === "pro" ? "pro" : "free",
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : session.customer?.id,
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.clerkUserId;
      if (!userId) break;

      const priceId = subscription.items.data[0]?.price.id;
      const active = subscription.status === "active" || subscription.status === "trialing";
      await updateUserSubscription(userId, {
        subscriptionTier: active ? tierFromPriceId(priceId) : "free",
        stripeCustomerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id,
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
