"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  AGENCY_REFERRAL_COOKIE,
  AGENCY_REFERRAL_MAX_AGE_SECONDS,
  isValidAgencyReferralCode,
} from "@/lib/agency/referral";

export function AgencyReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref")?.trim();
    if (!ref || !isValidAgencyReferralCode(ref)) {
      return;
    }

    document.cookie = `${AGENCY_REFERRAL_COOKIE}=${encodeURIComponent(ref)}; path=/; max-age=${AGENCY_REFERRAL_MAX_AGE_SECONDS}; SameSite=Lax`;
  }, [searchParams]);

  return null;
}
