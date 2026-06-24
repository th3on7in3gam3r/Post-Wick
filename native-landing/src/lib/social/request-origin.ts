export function requestOrigin(req: Request) {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    const protocol = forwardedProto?.split(",")[0]?.trim() ?? "https";
    if (host) return `${protocol}://${host}`;
  }

  return url.origin;
}

export function sanitizeOAuthCode(code: string) {
  return code.replace(/#_$/, "").trim();
}
