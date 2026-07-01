import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { completeProfileOnboarding, getOrCreateUser } from "@/lib/db";
import { sendOnboardingSignupEmail } from "@/lib/email/onboarding";
import { REFERRAL_SOURCES } from "@/lib/onboarding/referral-sources";

const referralValues = REFERRAL_SOURCES.map((item) => item.value) as [
  string,
  ...string[],
];

const profileSchema = z
  .object({
    displayName: z.string().trim().max(120).optional(),
    referralSource: z.enum(referralValues),
    referralDetail: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.referralSource === "other" && !data.referralDetail?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please tell us where you heard about us.",
        path: ["referralDetail"],
      });
    }
  });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = profileSchema.parse(body);
    const clerkUser = await currentUser();
    const dbUser = await getOrCreateUser(
      userId,
      clerkUser?.emailAddresses[0]?.emailAddress ?? null,
    );

    if (dbUser.profileOnboardingCompleted) {
      return NextResponse.json({ ok: true, alreadyCompleted: true });
    }

    const displayName =
      data.displayName?.trim() ||
      clerkUser?.fullName?.trim() ||
      dbUser.displayName;

    const user = await completeProfileOnboarding(userId, {
      displayName,
      referralSource: data.referralSource,
      referralDetail: data.referralDetail,
    });

    try {
      await sendOnboardingSignupEmail({
        userId,
        email: user.email,
        displayName: user.displayName,
        referralSource: user.referralSource ?? data.referralSource,
        referralDetail: user.referralDetail,
      });
    } catch (emailError) {
      console.error("[onboarding-profile-email]", emailError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message ?? "Please check your answers and try again.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("[onboarding-profile]", error);
    return NextResponse.json(
      { error: "Could not save your profile. Please try again." },
      { status: 500 },
    );
  }
}
