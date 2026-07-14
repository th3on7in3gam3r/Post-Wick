import { Resend } from "resend";
import {
  escapeHtml,
  mailFromAddress,
  platformLabel,
  truncateText,
} from "@/lib/email/mail";
import { siteUrlWithUtm } from "@/lib/utm";

export type PublishedPostSummary = {
  platform: string;
  brandName: string;
  content: string;
};

export type PublishConfirmationEmailInput = {
  to: string;
  displayName: string | null;
  posts: PublishedPostSummary[];
};

export function buildPublishConfirmationEmail(input: PublishConfirmationEmailInput) {
  const count = input.posts.length;
  const greetingName = input.displayName?.trim();
  const greeting = greetingName ? `Hi ${greetingName},` : "Hi there,";
  const historyUrl = siteUrlWithUtm("/history", {
    source: "kerygma",
    campaign: "publish-confirmation",
    medium: "email",
  });

  const subject =
    count === 1
      ? `[Kerygma Social] Published to ${platformLabel(input.posts[0]!.platform)} — ${input.posts[0]!.brandName}`
      : `[Kerygma Social] ${count} posts published`;

  const textLines = input.posts.map(
    (post) =>
      `  - ${platformLabel(post.platform)} · ${post.brandName}: ${truncateText(post.content)}`,
  );

  const text = [
    greeting,
    "",
    count === 1
      ? "Autopilot just published a post for you:"
      : `Autopilot just published ${count} posts for you:`,
    "",
    ...textLines,
    "",
    `View history: ${historyUrl}`,
    "",
    "Manage email preferences in Settings → Notifications.",
  ].join("\n");

  const rows = input.posts
    .map(
      (post) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;">
        <div style="font-size:12px;color:#8a8a8a;">${escapeHtml(platformLabel(post.platform))} · ${escapeHtml(post.brandName)}</div>
        <div style="font-size:14px;color:#1a1a1a;margin-top:2px;">${escapeHtml(truncateText(post.content, 120))}</div>
      </td>
    </tr>`,
    )
    .join("");

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
    <p style="font-size:15px;">${escapeHtml(greeting)}</p>
    <p style="font-size:15px;">${
      count === 1
        ? "Autopilot just published a post for you:"
        : `Autopilot just published <strong>${count}</strong> posts for you:`
    }</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>
    <p style="margin:20px 0;"><a href="${escapeHtml(historyUrl)}" style="background:#c9a24b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;">View history</a></p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:12px;color:#8a8a8a;">You're receiving this because publish confirmations are on. Manage them in Settings → Notifications.</p>
  </div>`;

  return { subject, text, html };
}

export async function sendPublishConfirmationEmail(input: PublishConfirmationEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false as const, reason: "missing_resend_api_key" };
  }

  const resend = new Resend(apiKey);
  const { subject, text, html } = buildPublishConfirmationEmail(input);

  const { error } = await resend.emails.send({
    from: mailFromAddress(),
    to: input.to,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "Failed to send publish confirmation email");
  }

  return { sent: true as const };
}
