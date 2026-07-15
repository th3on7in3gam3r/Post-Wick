import { Resend } from "resend";
import type { WeeklyDigestData, WeeklyDigestPost } from "@/lib/db";
import { siteUrlWithUtm } from "@/lib/utm";

function mailFromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Kerygma Social <hello@kerygmasocial.com>"
  );
}

function platformLabel(platform: string) {
  if (platform === "twitter") return "X";
  if (platform === "bluesky") return "Bluesky";
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

function truncate(value: string, max = 90) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textLine(post: WeeklyDigestPost, when: string | null) {
  const date = formatDate(when);
  const prefix = date ? `${date} · ` : "";
  return `  - ${prefix}${platformLabel(post.platform)} · ${post.brandName}: ${truncate(post.content)}`;
}

function htmlRow(post: WeeklyDigestPost, when: string | null) {
  const date = formatDate(when);
  const meta = [date, platformLabel(post.platform), post.brandName]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" · ");
  return `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;">
        <div style="font-size:12px;color:#8a8a8a;">${meta}</div>
        <div style="font-size:14px;color:#1a1a1a;margin-top:2px;">${escapeHtml(truncate(post.content, 120))}</div>
      </td>
    </tr>`;
}

export type WeeklyDigestEmailInput = {
  to: string;
  displayName: string | null;
  data: WeeklyDigestData;
};

export function buildWeeklyDigestEmail(input: WeeklyDigestEmailInput) {
  const { data } = input;
  const queueUrl = siteUrlWithUtm("/queue", {
    source: "kerygma",
    campaign: "weekly-digest",
    medium: "email",
    content: "queue-cta",
  });
  const dashboardUrl = siteUrlWithUtm("/dashboard", {
    source: "kerygma",
    campaign: "weekly-digest",
    medium: "email",
    content: "dashboard-cta",
  });
  const historyUrl = siteUrlWithUtm("/history", {
    source: "kerygma",
    campaign: "weekly-digest",
    medium: "email",
    content: "history-cta",
  });
  const greetingName = input.displayName?.trim();
  const greeting = greetingName ? `Hi ${greetingName},` : "Hi there,";

  const publishedList = data.published.slice(0, 8);
  const scheduledList = data.scheduled.slice(0, 8);

  const subject = `Your Kerygma Social weekly digest — ${data.publishedCount} published, ${data.scheduledCount} upcoming`;

  const textParts = [
    greeting,
    "",
    "Here's your week on Kerygma Social:",
    "",
    `• Published in the last 7 days: ${data.publishedCount}`,
    `• Scheduled for the next 7 days: ${data.scheduledCount}`,
    `• Drafts awaiting your approval: ${data.pendingCount}`,
  ];

  if (data.failedCount > 0) {
    textParts.push(`• Posts that failed to publish: ${data.failedCount}`);
  }

  if (publishedList.length > 0) {
    textParts.push("", "Recently published:");
    for (const post of publishedList) {
      textParts.push(textLine(post, post.publishedAt));
    }
  }

  if (scheduledList.length > 0) {
    textParts.push("", "Coming up:");
    for (const post of scheduledList) {
      textParts.push(textLine(post, post.scheduledAt));
    }
  }

  if (data.pendingCount > 0) {
    textParts.push(
      "",
      `You have ${data.pendingCount} draft${data.pendingCount === 1 ? "" : "s"} waiting for approval: ${queueUrl}`,
    );
  }

  textParts.push(
    "",
    `Open your dashboard: ${dashboardUrl}`,
    "",
    "Manage email preferences anytime in Settings → Notifications.",
    "To stop the weekly digest, turn it off there.",
  );

  const publishedHtml =
    publishedList.length > 0
      ? `<h3 style="font-size:14px;color:#1a1a1a;margin:24px 0 4px;">Recently published</h3>
         <table style="width:100%;border-collapse:collapse;">${publishedList
           .map((post) => htmlRow(post, post.publishedAt))
           .join("")}</table>`
      : "";

  const scheduledHtml =
    scheduledList.length > 0
      ? `<h3 style="font-size:14px;color:#1a1a1a;margin:24px 0 4px;">Coming up</h3>
         <table style="width:100%;border-collapse:collapse;">${scheduledList
           .map((post) => htmlRow(post, post.scheduledAt))
           .join("")}</table>`
      : "";

  const pendingHtml =
    data.pendingCount > 0
      ? `<p style="margin:20px 0;"><a href="${escapeHtml(queueUrl)}" style="background:#c9a24b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;">Review ${data.pendingCount} draft${data.pendingCount === 1 ? "" : "s"}</a></p>`
      : "";

  const failedHtml =
    data.failedCount > 0
      ? `<p style="font-size:14px;color:#b42318;">${data.failedCount} post${data.failedCount === 1 ? "" : "s"} failed to publish — <a href="${escapeHtml(historyUrl)}">retry from History</a>.</p>`
      : "";

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
    <p style="font-size:15px;">${escapeHtml(greeting)}</p>
    <p style="font-size:15px;">Here's your week on Kerygma Social:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:12px;background:#faf7f0;border-radius:8px;text-align:center;">
          <div style="font-size:24px;font-weight:600;">${data.publishedCount}</div>
          <div style="font-size:12px;color:#8a8a8a;">Published (7d)</div>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:12px;background:#faf7f0;border-radius:8px;text-align:center;">
          <div style="font-size:24px;font-weight:600;">${data.scheduledCount}</div>
          <div style="font-size:12px;color:#8a8a8a;">Upcoming (7d)</div>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:12px;background:#faf7f0;border-radius:8px;text-align:center;">
          <div style="font-size:24px;font-weight:600;">${data.pendingCount}</div>
          <div style="font-size:12px;color:#8a8a8a;">Awaiting approval</div>
        </td>
      </tr>
    </table>
    ${failedHtml}
    ${publishedHtml}
    ${scheduledHtml}
    ${pendingHtml}
    <p style="margin:24px 0;"><a href="${escapeHtml(dashboardUrl)}" style="font-size:14px;color:#c9a24b;">Open your dashboard →</a></p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:12px;color:#8a8a8a;">You're receiving this because the weekly digest is on. Manage it in Settings → Notifications.</p>
  </div>`;

  return { subject, text: textParts.join("\n"), html };
}

export async function sendWeeklyDigestEmail(input: WeeklyDigestEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false as const, reason: "missing_resend_api_key" };
  }

  const resend = new Resend(apiKey);
  const { subject, text, html } = buildWeeklyDigestEmail(input);

  const { error } = await resend.emails.send({
    from: mailFromAddress(),
    to: input.to,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "Failed to send weekly digest email");
  }

  return { sent: true as const };
}
