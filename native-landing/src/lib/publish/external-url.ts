const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  pinterest: "Pinterest",
  bluesky: "Bluesky",
  twitter: "X",
};

export function platformLabel(platform: string) {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform;
}

function isInternalPostId(externalPostId: string) {
  return externalPostId.startsWith("demo-") || externalPostId === "__publishing__";
}

export function resolveExternalPostUrl(
  platform: string,
  externalPostId: string | null | undefined,
): string | null {
  if (!externalPostId || isInternalPostId(externalPostId)) {
    return null;
  }

  if (externalPostId.startsWith("http://") || externalPostId.startsWith("https://")) {
    return externalPostId;
  }

  const normalized = platform.toLowerCase();

  if (normalized === "linkedin") {
    const urn = externalPostId.startsWith("urn:")
      ? externalPostId
      : `urn:li:share:${externalPostId}`;
    return `https://www.linkedin.com/feed/update/${encodeURIComponent(urn)}`;
  }

  if (normalized === "facebook") {
    return `https://www.facebook.com/${externalPostId}`;
  }

  if (normalized === "bluesky") {
    if (externalPostId.startsWith("at://")) {
      const match = externalPostId.match(
        /^at:\/\/([^/]+)\/app\.bsky\.feed\.post\/([^/]+)$/,
      );
      if (match) {
        return `https://bsky.app/profile/${encodeURIComponent(match[1]!)}/post/${match[2]}`;
      }
    }
  }

  return null;
}
