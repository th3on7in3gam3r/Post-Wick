import { Resend } from "resend";
import { siteUrl } from "@/lib/brand";
import {
  escapeHtml,
  mailFromAddress,
  platformLabel,
  truncateText,
} from "@/lib/email/mail";

export type QueueReminderPost = {
  platform: string;
  brandName: string;
  content: string;
};

export type QueueReminderEmailInput = {
  to: string;
  displayName: string | null;
  pendingCount: number;
  posts: QueueReminderPost[];
};

export function buildQueueReminderEmail(input: QueueReminderEmailInput) {
  const greetingName = input.displayName?.trim();
  const greeting = greetingName ? `Hi ${greetingName},` : "Hi there,";
  const base = siteUrl();
  const count = input.pendingCount;
  const preview = input.posts.slice(0, 6);

  const subject = `[Kerygma Social] ${count} post${count === 1 ? "" : "s"} waiting for your approval`;

  const textLines = preview.map(
    (post) =>
      `  - ${platformLabel(post.platform)} · ${post.brandName}: ${truncateText(post.content)}`,
  );

  const textParts = [
    greeting,
    "",
    `You have ${count} draft${count === 1 ? "" : "s"} waiting in your approval queue.`,
    "",
  ];

  if (preview.length > 0) {
    textParts.push("Recent drafts:", ...textLines, "");
  }

  if (count > preview.length) {
    textParts.push(`…and ${count - preview.length} more.`, "");
  }

  textParts.push(
    `Review now: ${base}/queue`,
    "",
    "Manage email preferences in Settings → Notifications.",
  );

  const text = textParts.join("\n");

  const rows = preview
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

  const moreHtml =
    count > preview.length
      ? `<p style="font-size:13px;color:#8a8a8a;">…and ${count - preview.length} more draft${count - preview.length === 1 ? "" : "s"}.</p>`
      : "";

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
    <p style="font-size:15px;">${escapeHtml(greeting)}</p>
    <p style="font-size:15px;">You have <strong>${count}</strong> draft${count === 1 ? "" : "s"} waiting in your approval queue.</p>
    ${
      preview.length > 0
        ? `<table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>${moreHtml}`
        : ""
    }
    <p style="margin:20px 0;"><a href="${escapeHtml(`${base}/queue`)}" style="background:#c9a24b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;">Review queue</a></p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:12px;color:#8a8a8a;">You're receiving this because approval reminders are on. Manage them in Settings → Notifications.</p>
  </div>`;

  return { subject, text, html };
}

export async function sendQueueReminderEmail(input: QueueReminderEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false as const, reason: "missing_resend_api_key" };
  }

  const resend = new Resend(apiKey);
  const { subject, text, html } = buildQueueReminderEmail(input);

  const { error } = await resend.emails.send({
    from: mailFromAddress(),
    to: input.to,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "Failed to send queue reminder email");
  }

  return { sent: true as const };
}
