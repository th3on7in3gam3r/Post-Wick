import { cookies } from "next/headers";
import { applyAgencyReferral } from "@/lib/db";
import {
  AGENCY_REFERRAL_COOKIE,
  isValidAgencyReferralCode,
} from "@/lib/agency/referral";

export async function applyAgencyReferralFromCookie(userId: string) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AGENCY_REFERRAL_COOKIE)?.value?.trim();
  if (!raw || !isValidAgencyReferralCode(raw)) {
    return;
  }

  await applyAgencyReferral(userId, raw);
  cookieStore.delete(AGENCY_REFERRAL_COOKIE);
}
