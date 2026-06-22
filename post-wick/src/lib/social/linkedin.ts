export async function getLinkedInAuthUrl(brandId: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID ?? "",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/social/linkedin/callback`,
    state: brandId,
    scope: "w_member_social openid profile",
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

export async function publishToLinkedIn(
  _accessToken: string,
  _content: string,
  _imageUrl?: string,
) {
  // TODO: Implement LinkedIn API publishing
  throw new Error("LinkedIn publishing not yet implemented");
}
