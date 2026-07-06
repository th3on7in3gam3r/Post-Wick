const AUTH_FAILURE_PATTERNS = [
  "access token",
  "oauth",
  "session has expired",
  "session expired",
  "error validating",
  "invalid oauth",
  "token expired",
  "expired token",
  "not authorized",
  "authorization failed",
  "permission",
  "revoked",
  "no connected account",
  "metadata is missing",
  "authenticate",
  "invalid session",
] as const;

export function isIntegrationAuthFailure(message: string) {
  const lowered = message.toLowerCase();
  if (lowered.includes("pages_read_engagement")) {
    return false;
  }

  return AUTH_FAILURE_PATTERNS.some((pattern) => lowered.includes(pattern));
}
