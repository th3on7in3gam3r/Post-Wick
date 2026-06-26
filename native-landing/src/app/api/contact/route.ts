import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactMessage } from "@/lib/email/contact";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);
    await sendContactMessage(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Please check your form and try again." }, { status: 400 });
    }

    console.error("[contact]", error);
    const message =
      error instanceof Error && error.message.includes("not configured")
        ? "Contact form is temporarily unavailable. Email hello@kerygmasocial.com directly."
        : "Could not send your message. Please try again in a moment.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
