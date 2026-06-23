import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createPostsWithOptionalImages, countPostsWithImages } from "@/lib/ai/create-posts";
import { getImageGenerationProviders, imageGenerationHint, isImageGenerationConfigured } from "@/lib/ai/images";
import { generatePostsWithAI } from "@/lib/ai/generate";
import { crawlBrandWebsite } from "@/lib/crawl";
import { buildResearchFromCrawl } from "@/lib/crawl/website";
import {
  createBrand,
  getBrandByWebsite,
  getOrCreateUser,
  getUserById,
  updateBrand,
} from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { normalizeWebsiteUrl, websiteHostname } from "@/lib/website-url";

const fromUrlSchema = z.object({
  websiteUrl: z.string().min(1),
  name: z.string().min(1).max(255).optional(),
});

export const maxDuration = 300;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { websiteUrl: rawUrl, name } = fromUrlSchema.parse(body);
    const websiteUrl = normalizeWebsiteUrl(rawUrl);

    if (!websiteUrl) {
      return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
    }

    const existing = await getBrandByWebsite(userId, websiteUrl);
    if (existing) {
      return NextResponse.json({
        brand: {
          ...existing,
          researchData: existing.researchData
            ? JSON.parse(existing.researchData)
            : null,
        },
        created: false,
      });
    }

    const brandName = name ?? formatBrandName(websiteHostname(websiteUrl));
    const brand = await createBrand({
      id: randomUUID(),
      userId,
      name: brandName,
      websiteUrl,
    });

    await updateBrand(brand.id, userId, { crawlStatus: "running" });

    await getOrCreateUser(userId);
    const user = (await getUserById(userId))!;
    const limits = getPlanLimits(user.subscriptionTier);

    const { pages, engine } = await crawlBrandWebsite(websiteUrl, 12);
    const research = {
      ...buildResearchFromCrawl(websiteUrl, brandName, pages),
      source: engine === "pro" ? "web-crawler" : "website-crawl",
    };
    const linkedinCount = Math.max(1, Math.ceil(limits.initialPosts * 0.6));
    const instagramCount = Math.max(0, limits.initialPosts - linkedinCount);

    const linkedinGenerated = await generatePostsWithAI(
      research,
      linkedinCount,
      "linkedin",
    );

    const updatedBrand = await updateBrand(brand.id, userId, {
      crawlStatus: "completed",
      researchData: research,
      description: research.summary,
      name: research.companyName || brandName,
    });

    const linkedinBatch = await createPostsWithOptionalImages({
      brandId: brand.id,
      platform: "linkedin",
      contents: linkedinGenerated.posts,
      research,
    });

    let instagramBatch = { posts: [] as typeof linkedinBatch.posts, imageError: null as string | null };
    if (instagramCount >= 2) {
      const instagramGenerated = await generatePostsWithAI(
        research,
        instagramCount,
        "instagram",
      );
      instagramBatch = await createPostsWithOptionalImages({
        brandId: brand.id,
        platform: "instagram",
        contents: instagramGenerated.posts,
        research,
        withImages: true,
      });
    }

    const posts = [...linkedinBatch.posts, ...instagramBatch.posts];
    const imageError = linkedinBatch.imageError ?? instagramBatch.imageError;
    const imagesGenerated = countPostsWithImages(posts);
    const imagesConfigured = isImageGenerationConfigured();

    return NextResponse.json(
      {
        brand: {
          ...updatedBrand,
          researchData: research,
        },
        posts,
        created: true,
        crawledPages: pages.length,
        crawlEngine: engine,
        generationSource: linkedinGenerated.source,
        instagramPosts: instagramBatch.posts.length,
        imagesGenerated,
        imagesConfigured,
        imageProviders: getImageGenerationProviders(),
        imageHint: imageGenerationHint({
          configured: imagesConfigured,
          generated: imagesGenerated,
          error: imageError,
          isVercel: Boolean(process.env.VERCEL),
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to set up brand from URL" },
      { status: 500 },
    );
  }
}

function formatBrandName(hostname: string) {
  const base = hostname.replace(/^www\./i, "").split(".")[0] ?? hostname;
  return base
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
