import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/brand";
import {
  getAvailableBillingIntervals,
  getStripe,
  getStripePriceId,
  isStripeConfigured,
  type BillingInterval,
  type PaidPlan,
} from "@/lib/stripe";

async function verifyPrice(plan: PaidPlan, interval: BillingInterval) {
  const priceId = getStripePriceId(plan, interval);
  if (!priceId) {
    return { plan, interval, priceId: null, ok: false, error: "not configured" };
  }

  try {
    const price = await getStripe().prices.retrieve(priceId);
    return {
      plan,
      interval,
      priceId,
      ok: true,
      active: price.active,
      currency: price.currency,
      unitAmount: price.unit_amount,
    };
  } catch (error) {
    return {
      plan,
      interval,
      priceId,
      ok: false,
      error: error instanceof Error ? error.message : "invalid price",
    };
  }
}

export async function GET() {
  const configured = isStripeConfigured();
  const intervals = getAvailableBillingIntervals();
  const checks = configured
    ? await Promise.all(
        (["pro", "max"] as const).flatMap((plan) =>
          intervals.map((interval) => verifyPrice(plan, interval)),
        ),
      )
    : [];

  const allPricesValid = checks.length > 0 && checks.every((check) => check.ok);

  return NextResponse.json({
    ok: configured && allPricesValid,
    configured,
    secretKeySet: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    webhookSecretSet: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
    publishableKeySet: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()),
    appUrl: siteUrl(),
    intervals,
    prices: checks,
    instructions: [
      "All Stripe keys and price IDs must come from the same Stripe account (test or live).",
      "Set NEXT_PUBLIC_APP_URL to your production domain (e.g. https://kerygmasocial.com).",
      "Add all vars to Vercel and redeploy after changing environment variables.",
      "Webhook URL: {appUrl}/api/webhooks/stripe",
    ],
  });
}
