import { Resend } from "resend";

const CONTACT_TO = "hello@kerygmasocial.com";

function contactFromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Kerygma Social <hello@kerygmasocial.com>"
  );
}

export type ContactMessageInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactMessage(input: ContactMessageInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Contact email is not configured");
  }

  const resend = new Resend(apiKey);
  const to = process.env.CONTACT_TO_EMAIL?.trim() || CONTACT_TO;

  const { error } = await resend.emails.send({
    from: contactFromAddress(),
    to,
    replyTo: input.email,
    subject: `[Contact] ${input.subject}`,
    text: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Subject: ${input.subject}`,
      "",
      input.message,
    ].join("\n"),
    html: `
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
      <hr />
      <p>${escapeHtml(input.message).replace(/\n/g, "<br />")}</p>
    `,
  });

  if (error) {
    throw new Error(error.message || "Failed to send contact email");
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
