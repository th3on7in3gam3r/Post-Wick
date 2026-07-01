import { Resend } from "resend";
import { referralSourceLabel } from "@/lib/onboarding/referral-sources";

const DEFAULT_NOTIFY_TO = "jerlessm@gmail.com";

function mailFromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Kerygma Social <hello@kerygmasocial.com>"
  );
}

function notifyToAddress() {
  return process.env.ONBOARDING_NOTIFY_EMAIL?.trim() || DEFAULT_NOTIFY_TO;
}

export type OnboardingSignupEmailInput = {
  userId: string;
  email: string | null;
  displayName: string | null;
  referralSource: string;
  referralDetail: string | null;
};

export async function sendOnboardingSignupEmail(input: OnboardingSignupEmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Onboarding email is not configured (RESEND_API_KEY missing)");
  }

  const resend = new Resend(apiKey);
  const sourceLabel = referralSourceLabel(input.referralSource);
  const heardAbout =
    input.referralSource === "other" && input.referralDetail?.trim()
      ? `Other — ${input.referralDetail.trim()}`
      : sourceLabel;

  const text = [
    "New Kerygma Social signup — onboarding profile",
    "",
    `Name: ${input.displayName?.trim() || "(not provided)"}`,
    `Email: ${input.email?.trim() || "(not provided)"}`,
    `User ID: ${input.userId}`,
    `Where they heard about us: ${heardAbout}`,
    "",
    `Submitted: ${new Date().toISOString()}`,
  ].join("\n");

  const { error } = await resend.emails.send({
    from: mailFromAddress(),
    to: notifyToAddress(),
    replyTo: input.email?.trim() || undefined,
    subject: `[Kerygma Social] New signup — ${heardAbout}`,
    text,
    html: `
      <h2>New signup — onboarding profile</h2>
      <p><strong>Name:</strong> ${escapeHtml(input.displayName?.trim() || "(not provided)")}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email?.trim() || "(not provided)")}</p>
      <p><strong>User ID:</strong> ${escapeHtml(input.userId)}</p>
      <p><strong>Where they heard about us:</strong> ${escapeHtml(heardAbout)}</p>
      <p><strong>Submitted:</strong> ${escapeHtml(new Date().toISOString())}</p>
    `,
  });

  if (error) {
    throw new Error(error.message || "Failed to send onboarding notification");
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
