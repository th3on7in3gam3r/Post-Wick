export function getLinkedInAuthUrl(brandId: string) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!clientId) {
    throw new Error("LinkedIn OAuth is not configured");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${appUrl}/api/social/linkedin/callback`,
    state: brandId,
    scope: "w_member_social openid profile",
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

export async function exchangeLinkedInCode(code: string) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!clientId || !clientSecret) {
    throw new Error("LinkedIn OAuth is not configured");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: `${appUrl}/api/social/linkedin/callback`,
  });

  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error("Failed to exchange LinkedIn authorization code");
  }

  return (await response.json()) as {
    access_token: string;
    expires_in?: number;
  };
}

export async function publishToLinkedIn(accessToken: string, content: string) {
  const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileResponse.ok) {
    throw new Error("Failed to load LinkedIn profile");
  }

  const profile = (await profileResponse.json()) as { sub: string };
  const author = `urn:li:person:${profile.sub}`;

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });

  if (!response.ok) {
    throw new Error("LinkedIn publish request failed");
  }

  const payload = (await response.json()) as { id?: string };
  return payload.id ?? "linkedin-post";
}
