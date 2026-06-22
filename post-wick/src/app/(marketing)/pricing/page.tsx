import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Try Post-Wick with one brand",
    features: ["1 brand", "10 posts/week", "LinkedIn only"],
  },
  {
    name: "Pro",
    price: "$49",
    description: "For growing teams",
    features: ["3 brands", "21 posts/week", "All platforms"],
    highlighted: true,
  },
  {
    name: "Max",
    price: "$149",
    description: "For agencies",
    features: ["Unlimited brands", "50 posts/week", "Priority support"],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl italic">Simple pricing</h1>
        <p className="mt-4 text-brand-muted">
          Start free. Upgrade when you&apos;re ready to scale.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.highlighted ? "border-brand-accent" : undefined
            }
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <p className="font-serif text-4xl italic">{plan.price}</p>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 space-y-2 text-sm text-brand-muted">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <Link href="/sign-up">
                <Button
                  variant={plan.highlighted ? "primary" : "outline"}
                  className="w-full"
                >
                  Get started
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
