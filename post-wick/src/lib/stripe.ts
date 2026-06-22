import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export const PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: "Pro",
    postsPerWeek: 21,
  },
  max: {
    priceId: process.env.STRIPE_MAX_PRICE_ID!,
    name: "Max",
    postsPerWeek: 50,
  },
} as const;
