export function publishErrorHint(platform: string, error: string): string | null {
  const lowered = error.toLowerCase();
  const normalized = platform.toLowerCase();

  if (
    (normalized === "facebook" || normalized === "instagram") &&
    (lowered.includes("pages_manage_posts") || lowered.includes("not available"))
  ) {
    return "Meta has not granted publishing permissions to your app yet. In Meta Developers → App Review, request Advanced Access for pages_manage_posts. Until approved, only app admins, developers, and testers can publish while the app is in Development mode.";
  }

  if (lowered.includes("not in cloud storage")) {
    return "Open Brands for this workspace and click Fix images, then retry publish.";
  }

  return null;
}
