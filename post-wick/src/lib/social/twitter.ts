export async function getTwitterAuthUrl(brandId: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TWITTER_CLIENT_ID ?? "",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/social/twitter/callback`,
    state: brandId,
    scope: "tweet.read tweet.write users.read offline.access",
    code_challenge: "challenge",
    code_challenge_method: "plain",
  });
  return `https://twitter.com/i/oauth2/authorize?${params}`;
}

export async function publishToTwitter(
  _accessToken: string,
  _content: string,
  _imageUrl?: string,
) {
  // TODO: Implement Twitter/X API publishing
  throw new Error("Twitter publishing not yet implemented");
}
