import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { upsertUser } from "@/lib/db/queries";
import { sendWelcomeEmail } from "@/lib/resend";

type ClerkUserEvent = {
  type: string;
  data: {
    id: string;
    first_name?: string | null;
    email_addresses?: Array<{ email_address: string }>;
  };
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: ClerkUserEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const email = event.data.email_addresses?.[0]?.email_address;
    if (email) {
      try {
        await upsertUser({ id: event.data.id, email });
      } catch (error) {
        console.error("Failed to sync user to database:", error);
      }

      if (event.type === "user.created" && process.env.RESEND_API_KEY) {
        try {
          await sendWelcomeEmail(email, event.data.first_name ?? undefined);
        } catch (error) {
          console.error("Failed to send welcome email:", error);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
