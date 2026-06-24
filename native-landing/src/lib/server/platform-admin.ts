import { currentUser } from "@clerk/nextjs/server";

function getPlatformAdminEmails() {
  const raw = process.env.POSTWICK_PLATFORM_ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function isPlatformAdmin() {
  const allowlist = getPlatformAdminEmails();
  if (allowlist.size === 0) return false;

  const user = await currentUser();
  if (!user) return false;

  const emails = user.emailAddresses
    .map((entry) => entry.emailAddress.trim().toLowerCase())
    .filter(Boolean);

  return emails.some((email) => allowlist.has(email));
}
