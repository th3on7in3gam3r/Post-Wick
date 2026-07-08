import crypto from "crypto";

export type StudioBillingEventType =
  | "bundle.activated"
  | "bundle.updated"
  | "bundle.canceled";

export interface StudioBillingPartnerEvent {
  id: string;
  type: StudioBillingEventType;
  bundleId: string;
  supabaseUserId: string;
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  products: string[];
  entitlements: Record<string, unknown>;
  linkedIds: {
    clerkId?: string | null;
    citepilotUserId?: string | null;
    kerygmaUserId?: string | null;
    aegisGithubLogin?: string | null;
  };
  occurredAt: string;
}

export function verifyStudioBillingSignature(
  body: string,
  signature: string | null,
): boolean {
  const secret = process.env.STUDIO_BILLING_FANOUT_SECRET?.trim();
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8"),
    );
  } catch {
    return false;
  }
}

export function kerygmaTierFromEvent(
  event: StudioBillingPartnerEvent,
): "free" | "pro" | "max" {
  if (event.type === "bundle.canceled") return "free";
  const ent = event.entitlements.kerygma as { tier?: string } | undefined;
  if (ent?.tier === "max") return "max";
  if (ent?.tier === "pro") return "pro";
  return "pro";
}
