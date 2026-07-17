export function publishErrorHint(platform: string, error: string): string | null {
  const lowered = error.toLowerCase();
  const normalized = platform.toLowerCase();

  const isMetaPlatform = normalized === "facebook" || normalized === "instagram";
  const isMetaPermissionError =
    lowered.includes("(#200)") ||
    lowered.includes("permissions error") ||
    lowered.includes("pages_manage_posts") ||
    lowered.includes("not available");

  if (isMetaPlatform && isMetaPermissionError) {
    if (
      normalized === "facebook" &&
      (lowered.includes("(#200)") || lowered.includes("permissions error"))
    ) {
      return (
        "Meta rejected this publish (#200 permissions). Reconnect Facebook under Integrations " +
        "and grant pages_manage_posts (Page content publishing). If permissions were already granted, " +
        "request Advanced Access for pages_manage_posts in Meta App Review — until approved, only app " +
        "admins, developers, and testers can publish while the app is in Development mode."
      );
    }

    return (
      "Meta has not granted publishing permissions to your app yet. In Meta Developers → App Review, " +
      "request Advanced Access for pages_manage_posts. Until approved, only app admins, developers, " +
      "and testers can publish while the app is in Development mode."
    );
  }

  if (lowered.includes("not in cloud storage")) {
    return "Open Brands for this workspace and click Fix images, then retry publish.";
  }

  return null;
}
