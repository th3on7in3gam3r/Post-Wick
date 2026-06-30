export const POSTING_FREQUENCY_OPTIONS = [
  { value: 3, label: "3 posts per week", description: "Light autopilot" },
  { value: 5, label: "5 posts per week", description: "Balanced cadence" },
  { value: 7, label: "7 posts per week", description: "Daily posting" },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "America/Phoenix", label: "Arizona" },
  { value: "America/Anchorage", label: "Alaska" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "UTC", label: "UTC" },
] as const;

export type UserSettingsPayload = {
  timezone: string;
  defaultPostingFrequency: number;
  notifyQueue: boolean;
  notifyPublish: boolean;
  notifyWeeklyDigest: boolean;
  demoModeEnabled: boolean;
};
