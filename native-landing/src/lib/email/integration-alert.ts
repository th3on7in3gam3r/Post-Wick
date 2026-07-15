import { Resend } from "resend";
import { siteUrlWithUtm } from "@/lib/utm";

const DEFAULT_ADMIN_NOTIFY_TO = "jerlessm@gmail.com";

function mailFromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Kerygma Social <hello@kerygmasocial.com>"
  );
}

function adminNotifyAddress() {
  return (
    process.env.INTEGRATION_ALERT_EMAIL?.trim() ||
    process.env.ONBOARDING_NOTIFY_EMAIL?.trim() ||
    DEFAULT_ADMIN_NOTIFY_TO
  );
}

export type IntegrationAlertInput = {
  userEmail: string | null;
  brandName: string;
  platform: string;
  accountName: string | null;
  error: string;
  context: "publish" | "verify";
};

function platformLabel(platform: string) {
  if (platform === "twitter") return "X";
  if (platform === "bluesky") return "Bluesky";
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

function buildMessage(input: IntegrationAlertInput) {
  const channel = platformLabel(input.platform);
  const account = input.accountName?.trim() || channel;
  const action =
    input.context === "verify"
      ? "failed a connection check"
      : "could not publish because the integration failed";
  const reconnectUrl = siteUrlWithUtm("/settings/integrations", {
    source: "kerygma",
    campaign: "integration-alert",
    medium: "email",
  });

  const text = [
    `Your ${channel} connection for ${input.brandName} ${action}.`,
    "",
    `Account: ${account}`,
    `Error: ${input.error}`,
    "",
    `Reconnect in Kerygma Social: ${reconnectUrl}`,
    "",
    "If you already reconnected, you can retry failed posts from History.",
  ].join("\n");

  const html = `
    <p>Your <strong>${escapeHtml(channel)}</strong> connection for <strong>${escapeHtml(input.brandName)}</strong> ${escapeHtml(action)}.</p>
    <p><strong>Account:</strong> ${escapeHtml(account)}</p>
    <p><strong>Error:</strong> ${escapeHtml(input.error)}</p>
    <p><a href="${escapeHtml(reconnectUrl)}">Reconnect in Kerygma Social</a></p>
    <p>If you already reconnected, retry failed posts from History.</p>
  `;

  return { text, html, subject: `[Kerygma Social] ${channel} connection needs attention — ${input.brandName}` };
}

export async function sendIntegrationFailureEmails(input: IntegrationAlertInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[integration-alert] RESEND_API_KEY missing; skipping email");
    return { sent: false as const, reason: "missing_resend_api_key" };
  }

  const resend = new Resend(apiKey);
  const { text, html, subject } = buildMessage(input);
  const from = mailFromAddress();
  const adminTo = adminNotifyAddress();

  const recipients = new Set<string>();
  if (input.userEmail?.trim()) {
    recipients.add(input.userEmail.trim());
  }
  recipients.add(adminTo);

  const { error } = await resend.emails.send({
    from,
    to: Array.from(recipients),
    replyTo: input.userEmail?.trim() || undefined,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "Failed to send integration alert email");
  }

  return { sent: true as const, recipients: Array.from(recipients) };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
