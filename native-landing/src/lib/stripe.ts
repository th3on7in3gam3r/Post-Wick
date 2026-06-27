import Stripe from "stripe";
import type { SubscriptionTier } from "@/lib/plans";
import { plans } from "@/lib/pricing";

let stripeClient: Stripe | null = null;

export type BillingInterval = "monthly" | "yearly";
export type PaidPlan = "pro" | "max";

type PlanPriceIds = Record<BillingInterval, string | undefined>;

function planPriceIds(): Record<PaidPlan, PlanPriceIds> {
  return {
    pro: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly:
        process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? process.env.STRIPE_PRO_PRICE_ID,
    },
    max: {
      monthly: process.env.STRIPE_MAX_MONTHLY_PRICE_ID,
      yearly:
        process.env.STRIPE_MAX_YEARLY_PRICE_ID ?? process.env.STRIPE_MAX_PRICE_ID,
    },
  };
}

export function getStripePriceId(plan: PaidPlan, interval: BillingInterval) {
  return planPriceIds()[plan][interval] ?? null;
}

export function tierFromStripePriceId(priceId: string | undefined): SubscriptionTier {
  if (!priceId) return "free";

  const ids = planPriceIds();
  const maxIds = [ids.max.monthly, ids.max.yearly].filter(Boolean);
  const proIds = [ids.pro.monthly, ids.pro.yearly].filter(Boolean);

  if (maxIds.includes(priceId)) return "max";
  if (proIds.includes(priceId)) return "pro";
  return "free";
}

export function getAvailableBillingIntervals(): BillingInterval[] {
  const ids = planPriceIds();
  const intervals: BillingInterval[] = [];

  if (ids.pro.yearly && ids.max.yearly) {
    intervals.push("yearly");
  }
  if (ids.pro.monthly && ids.max.monthly) {
    intervals.push("monthly");
  }

  return intervals;
}

export function isStripeConfigured() {
  if (!process.env.STRIPE_SECRET_KEY) return false;

  const intervals = getAvailableBillingIntervals();
  return intervals.length > 0;
}

export function getStripe() {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export const STRIPE_PLANS = {
  pro: {
    name: "Pro",
    monthly: plans.pro.monthly,
    yearlyPerMonth: plans.pro.yearlyPerMonth,
  },
  max: {
    name: "Max",
    monthly: plans.max.monthly,
    yearlyPerMonth: plans.max.yearlyPerMonth,
  },
} as const;
