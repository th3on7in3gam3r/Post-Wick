import { normalizeBaseUrl } from "@/lib/brand";

function appBaseUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
}

export function linkedInRedirectUri() {
  return `${appBaseUrl()}/api/social/linkedin/callback`;
}

export function linkedInRedirectHint(message?: string) {
  const uri = linkedInRedirectUri();
  if (message?.toLowerCase().includes("redirect")) {
    return `LinkedIn OAuth redirect URI must match exactly: ${uri}`;
  }
  return `In LinkedIn Developers → Auth → OAuth 2.0 redirect URLs, add EXACTLY: ${uri}`;
}

export function getLinkedInAuthUrl(brandId: string) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;

  if (!clientId) {
    throw new Error("LinkedIn OAuth is not configured");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: linkedInRedirectUri(),
    state: brandId,
    scope: "w_member_social openid profile",
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

export async function exchangeLinkedInCode(code: string) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("LinkedIn OAuth is not configured");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: linkedInRedirectUri(),
  });

  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[linkedin-token]", response.status, detail.slice(0, 240));
    throw new Error(
      `Failed to exchange LinkedIn authorization code (${response.status}): ${detail.slice(0, 240)}`,
    );
  }

  return (await response.json()) as {
    access_token: string;
    expires_in?: number;
  };
}

async function readLinkedInError(response: Response) {
  try {
    const detail = await response.text();
    return detail.slice(0, 240) || response.statusText;
  } catch {
    return response.statusText;
  }
}

async function getLinkedInAuthor(accessToken: string) {
  const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileResponse.ok) {
    throw new Error("Failed to load LinkedIn profile");
  }

  const profile = (await profileResponse.json()) as { sub: string };
  return `urn:li:person:${profile.sub}`;
}

async function fetchImageBinary(imageUrl: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch post image (${response.status})`);
  }

  const contentType = response.headers.get("content-type") ?? "image/png";
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength === 0) {
    throw new Error("Post image file is empty");
  }

  return { buffer, contentType };
}

async function registerLinkedInImageUpload(accessToken: string, owner: string) {
  const response = await fetch(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `LinkedIn image registration failed: ${await readLinkedInError(response)}`,
    );
  }

  const payload = (await response.json()) as {
    value?: {
      asset?: string;
      uploadMechanism?: {
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"?: {
          uploadUrl?: string;
        };
      };
    };
  };

  const asset = payload.value?.asset;
  const uploadUrl =
    payload.value?.uploadMechanism?.[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ]?.uploadUrl;

  if (!asset || !uploadUrl) {
    throw new Error("LinkedIn image registration response was incomplete");
  }

  return { asset, uploadUrl };
}

async function uploadLinkedInImageBinary(
  accessToken: string,
  uploadUrl: string,
  buffer: ArrayBuffer,
  contentType: string,
) {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": contentType,
    },
    body: buffer,
  });

  if (!response.ok) {
    throw new Error(`LinkedIn image upload failed: ${await readLinkedInError(response)}`);
  }
}

export async function publishToLinkedIn(
  accessToken: string,
  content: string,
  imageUrl?: string | null,
) {
  const author = await getLinkedInAuthor(accessToken);

  let shareContent: {
    shareCommentary: { text: string };
    shareMediaCategory: "NONE" | "IMAGE";
    media?: Array<{
      status: "READY";
      media: string;
      title: { text: string };
    }>;
  };

  if (imageUrl) {
    const { buffer, contentType } = await fetchImageBinary(imageUrl);
    const { asset, uploadUrl } = await registerLinkedInImageUpload(accessToken, author);
    await uploadLinkedInImageBinary(accessToken, uploadUrl, buffer, contentType);

    shareContent = {
      shareCommentary: { text: content },
      shareMediaCategory: "IMAGE",
      media: [
        {
          status: "READY",
          media: asset,
          title: { text: content.slice(0, 200) || "Post image" },
        },
      ],
    };
  } else {
    shareContent = {
      shareCommentary: { text: content },
      shareMediaCategory: "NONE",
    };
  }

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
        "com.linkedin.ugc.ShareContent": shareContent,
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`LinkedIn publish request failed: ${await readLinkedInError(response)}`);
  }

  const postId = response.headers.get("x-restli-id");
  if (postId) return postId;

  const payload = (await response.json()) as { id?: string };
  return payload.id ?? "linkedin-post";
}
