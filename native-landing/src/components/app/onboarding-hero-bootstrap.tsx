"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HERO_ONBOARDING_KEY,
  onboardingRedirectFromHeroUrl,
  peekPendingWebsiteUrl,
} from "@/lib/pending-website-url";

export function OnboardingHeroBootstrap() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("url")) return;
    if (sessionStorage.getItem(HERO_ONBOARDING_KEY) !== "1") return;

    const stored = peekPendingWebsiteUrl();
    if (!stored) return;

    router.replace(onboardingRedirectFromHeroUrl(stored));
  }, [router, searchParams]);

  return null;
}
