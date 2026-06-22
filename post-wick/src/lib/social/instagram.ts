export async function getInstagramAuthUrl(brandId: string) {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_CLIENT_ID ?? "",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/social/instagram/callback`,
    state: brandId,
    scope: "instagram_basic,instagram_content_publish",
    response_type: "code",
  });
  return `https://api.instagram.com/oauth/authorize?${params}`;
}

export async function publishToInstagram(
  _accessToken: string,
  _content: string,
  _imageUrl?: string,
) {
  // TODO: Implement Instagram Graph API publishing
  throw new Error("Instagram publishing not yet implemented");
}
