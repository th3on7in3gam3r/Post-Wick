import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createPosts, findBrandByWebsiteForUser } from "@/lib/db";
import {
  defaultGeneratePlatform,
  isSupportedGeneratePlatform,
} from "@/lib/platforms";
import { requirePartnerApiUser } from "@/lib/server/partner-api-auth";
import { normalizeWebsiteUrl } from "@/lib/website-url";

const postSchema = z.object({
  channel: z.string().trim().min(1).max(40).optional(),
  platform: z.string().trim().min(1).max(40).optional(),
  body: z.string().trim().min(1).max(5000),
  content: z.string().trim().min(1).max(5000).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
});

const bodySchema = z.object({
  brandUrl: z.string().trim().min(1),
  source: z.string().trim().max(80).optional(),
  exportedAt: z.string().optional(),
  posts: z.array(postSchema).min(1).max(50),
  seoKeywords: z.array(z.string().trim().min(1).max(120)).max(40).optional(),
});

/**
 * Cadence / AI-CMO campaign bundle handoff.
 * Creates pending draft posts for approval in Kerygma.
 */
export async function POST(req: Request) {
  const authResult = await requirePartnerApiUser(req);
  if ("error" in authResult) return authResult.error;

  try {
    const json = await req.json();
    const data = bodySchema.parse(json);
    const brandUrl = normalizeWebsiteUrl(data.brandUrl);
    if (!brandUrl) {
      return NextResponse.json({ error: "Invalid brandUrl" }, { status: 400 });
    }

    const brand = await findBrandByWebsiteForUser(authResult.userId, brandUrl);
    if (!brand) {
      return NextResponse.json(
        {
          error:
            "No Kerygma brand matches that website. Add the brand in Kerygma first (same URL as Cadence).",
          brandUrl,
        },
        { status: 404 },
      );
    }

    const items = data.posts.map((post) => {
      const channelHint = (post.platform || post.channel || "linkedin").toLowerCase();
      const platform = isSupportedGeneratePlatform(channelHint)
        ? channelHint
        : defaultGeneratePlatform();
      return {
        id: randomUUID(),
        brandId: brand.id,
        platform,
        content: post.content ?? post.body,
      };
    });

    await createPosts(items);

    return NextResponse.json({
      ok: true,
      brandId: brand.id,
      brandName: brand.name,
      imported: items.length,
      status: "pending",
      message: "Posts added to your Kerygma approval queue.",
      source: data.source ?? "ai-cmo",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to import campaign bundle" }, { status: 500 });
  }
}
