"use client";

import Link from "next/link";
import { useState } from "react";
import { TextureButton } from "@/components/ui/texture-button";
import { plans } from "@/lib/pricing";

const channels = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "X",
  "TikTok",
  "Pinterest",
  "Reddit",
  "Bluesky",
];

type BillingCycle = "monthly" | "yearly";

export function Pricing() {
  const [billing, setBilling] = useState<BillingCycle>("yearly");

  const proPrice =
    billing === "yearly" ? plans.pro.yearlyPerMonth : plans.pro.monthly;
  const maxPrice =
    billing === "yearly" ? plans.max.yearlyPerMonth : plans.max.monthly;
  const billingNote =
    billing === "yearly"
      ? "per month, billed yearly · excl. tax"
      : "per month, billed monthly · excl. tax";

  return (
    <section id="pricing" className="scroll-mt-32 bg-cream-dark px-10 py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative overflow-hidden rounded-3xl">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/pricing-landscape.svg')" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-cream/40 to-cream-dark/85" />

          <div className="relative z-10 px-6 py-12 md:px-12 md:py-16">
            <p className="step-label">Pricing</p>
            <h2 className="mt-3 font-playfair text-[clamp(2rem,4vw,3rem)] italic text-near-black">
              One plan for autopilot.
            </h2>
            <p className="body-copy mt-3">
              Pick the AI allowance that matches your growth ambitions.
            </p>

            <div className="mt-6 inline-flex gap-1 rounded-full bg-white/90 p-1 text-sm shadow-card backdrop-blur-sm">
              <TextureButton
                type="button"
                variant={billing === "monthly" ? "primary" : "minimal"}
                size="sm"
                onClick={() => setBilling("monthly")}
              >
                Monthly
              </TextureButton>
              <TextureButton
                type="button"
                variant={billing === "yearly" ? "primary" : "minimal"}
                size="sm"
                onClick={() => setBilling("yearly")}
              >
                Yearly <span className="text-gold">−20%</span>
              </TextureButton>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border-2 border-gold bg-white/95 p-8 shadow-card backdrop-blur-sm">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-gold">
                  Best for growth
                </p>
                <h3 className="mt-2 font-playfair text-2xl italic">Pro</h3>
                <p className="mt-2 text-sm text-gray-body">
                  A whole month of content, ready for your approval.
                </p>
                <p className="mt-6 font-playfair text-5xl italic text-near-black">
                  ${proPrice}
                </p>
                <p className="text-sm text-gray-label">{billingNote}</p>
                <ul className="mt-6 space-y-2 text-sm text-gray-body">
                  <li>50+ posts a month, ready for approval</li>
                  <li>Tailored to your tone and industry</li>
                  <li>All your channels: Facebook, Instagram, LinkedIn and 5 more</li>
                  <li>Auto-publishing once you approve</li>
                  <li>Analytics on what&apos;s working</li>
                </ul>
                <TextureButton asChild variant="primary" size="lg" className="mt-8 flex w-full">
                  <Link href="/sign-up" className="w-full">
                    See your own posts
                  </Link>
                </TextureButton>
              </div>

              <div className="rounded-2xl border border-black/[0.06] bg-white/95 p-8 shadow-card backdrop-blur-sm">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-gray-label">
                  For teams scaling
                </p>
                <h3 className="mt-2 font-playfair text-2xl italic">Max</h3>
                <p className="mt-2 text-sm text-gray-body">
                  Higher AI allowance and priority support for teams running multiple
                  brands.
                </p>
                <p className="mt-6 font-playfair text-5xl italic text-near-black">
                  ${maxPrice}
                </p>
                <p className="text-sm text-gray-label">{billingNote}</p>
                <ul className="mt-6 space-y-2 text-sm text-gray-body">
                  <li>Everything in Pro, plus</li>
                  <li>5× AI usage</li>
                  <li>Priority support</li>
                  <li>Early access to new features</li>
                </ul>
                <TextureButton asChild variant="secondary" size="lg" className="mt-8 flex w-full">
                  <Link href="/sign-up" className="w-full">
                    Get started with Max
                  </Link>
                </TextureButton>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-black/[0.08] bg-white/80 p-8 shadow-card">
          <p className="text-center text-sm text-gray-body">
            All these channels can be connected to every brand
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {channels.map((ch) => (
              <TextureButton
                key={ch}
                type="button"
                variant="secondary"
                size="sm"
                className="pointer-events-none"
              >
                {ch}
              </TextureButton>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
