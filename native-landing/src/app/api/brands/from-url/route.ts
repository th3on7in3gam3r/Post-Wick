import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateInitialPostsForBrand } from "@/lib/brands/generate-initial-posts";
import { crawlBrandWebsite } from "@/lib/crawl";
import { buildResearchFromCrawl } from "@/lib/crawl/website";
import {
  createBrand,
  getBrandByWebsite,
  getOrCreateUser,
  getUserById,
  updateBrand,
} from "@/lib/db";
import { normalizeWebsiteUrl, websiteHostname } from "@/lib/website-url";

const fromUrlSchema = z.object({
  websiteUrl: z.string().min(1),
  name: z.string().min(1).max(255).optional(),
  analyzeOnly: z.boolean().optional().default(false),
});

export const maxDuration = 300;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { websiteUrl: rawUrl, name, analyzeOnly } = fromUrlSchema.parse(body);
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

    const { pages, engine } = await crawlBrandWebsite(websiteUrl, 12);
    const crawledResearch = buildResearchFromCrawl(websiteUrl, brandName, pages);
    const research = {
      ...crawledResearch,
      source: engine === "pro" ? "web-crawler" : "website-crawl",
      voiceDescription: crawledResearch.summary ?? "",
      thingsToAvoid: [] as string[],
    };

    if (analyzeOnly) {
      const updatedBrand = await updateBrand(brand.id, userId, {
        crawlStatus: "review",
        researchData: research,
        description: research.summary,
        name: research.companyName || brandName,
      });

      return NextResponse.json(
        {
          brand: {
            ...updatedBrand,
            researchData: research,
          },
          created: true,
          requiresReview: true,
          crawledPages: pages.length,
          crawlEngine: engine,
        },
        { status: 201 },
      );
    }

    await getOrCreateUser(userId);
    const user = (await getUserById(userId))!;

    const updatedBrand = await updateBrand(brand.id, userId, {
      crawlStatus: "completed",
      researchData: research,
      description: research.summary,
      name: research.companyName || brandName,
    });

    const generation = await generateInitialPostsForBrand(
      brand.id,
      research,
      user.subscriptionTier,
    );

    return NextResponse.json(
      {
        brand: {
          ...updatedBrand,
          researchData: research,
        },
        ...generation,
        created: true,
        crawledPages: pages.length,
        crawlEngine: engine,
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
