import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function getFromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL ?? "Post-Wick <onboarding@resend.dev>"
  );
}

export async function sendWelcomeEmail(to: string, name?: string) {
  return getResend().emails.send({
    from: getFromAddress(),
    to,
    subject: "Welcome to Post-Wick",
    html: `<p>Hi${name ? ` ${name}` : ""},</p><p>Your social content autopilot is ready. Add your first brand to get started.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/brands/new">Add your first brand →</a></p>`,
  });
}
