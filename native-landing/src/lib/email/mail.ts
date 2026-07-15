export function mailFromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Kerygma Social <hello@kerygmasocial.com>"
  );
}

export function platformLabel(platform: string) {
  if (platform === "twitter") return "X";
  if (platform === "bluesky") return "Bluesky";
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

export function truncateText(value: string, max = 90) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
