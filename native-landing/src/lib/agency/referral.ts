export const AGENCY_REFERRAL_COOKIE = "postwick_agency_ref";
export const AGENCY_REFERRAL_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function isValidAgencyReferralCode(code: string) {
  return /^agency_[a-z0-9][a-z0-9_]{2,48}$/.test(code);
}

export function agencyReferralSignupPath(code: string) {
  return `/get-started?ref=${encodeURIComponent(code)}`;
}
