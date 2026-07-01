export const REFERRAL_SOURCES = [
  { value: "google", label: "Google search" },
  { value: "social_media", label: "Social media" },
  { value: "friend", label: "Friend or colleague" },
  { value: "podcast_youtube", label: "Podcast or YouTube" },
  { value: "newsletter_blog", label: "Newsletter or blog" },
  { value: "event", label: "Conference or event" },
  { value: "other", label: "Other" },
] as const;

export type ReferralSourceValue = (typeof REFERRAL_SOURCES)[number]["value"];

export function referralSourceLabel(value: string) {
  return REFERRAL_SOURCES.find((item) => item.value === value)?.label ?? value;
}
