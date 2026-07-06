export type ConnectionHealthFields = {
  healthStatus?: "ok" | "error";
  lastVerifiedAt?: string;
  lastHealthError?: string | null;
  lastAlertSentAt?: string;
  lastAlertError?: string;
};

export function parseConnectionMetadata<T extends Record<string, unknown>>(
  metadata: string | null,
): T {
  if (!metadata) return {} as T;
  try {
    return JSON.parse(metadata) as T;
  } catch {
    return {} as T;
  }
}

export function mergeConnectionMetadata(
  metadata: string | null,
  patch: ConnectionHealthFields & Record<string, unknown>,
) {
  return JSON.stringify({
    ...parseConnectionMetadata(metadata),
    ...patch,
  });
}
