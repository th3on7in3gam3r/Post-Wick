import { randomBytes, randomUUID } from "node:crypto";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  lt,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { getNextScheduleSlotWithWeeklyCap, getUtcWeekRange } from "@/lib/scheduling/slots";
import { getPlanLimits } from "@/lib/plans";
import { decryptOptional, encryptOptional } from "@/lib/crypto";
import { WeeklyScheduleLimitError } from "@/lib/usage/schedule-limit";
import { getDb } from "./client";
import {
  brands,
  connections,
  metaOauthPending,
  posts,
  users,
  agencies,
  affiliateReferrals,
  apiKeys,
  blueskyOauthSession,
  blueskyOauthState,
  postwickClaimCodes,
} from "./schema";
import { emitStudioOpsEvent } from "@/lib/studio-ops";
import { generateApiKey, hashApiKey } from "@/lib/api-keys";
import { websiteHostname } from "@/lib/website-url";

export type BrandRecord = {
  id: string;
  userId: string;
  name: string;
  websiteUrl: string;
  description: string | null;
  crawlStatus: "pending" | "running" | "review" | "completed" | "failed";
  researchData: string | null;
  postingFrequency: number;
  isPublic: boolean;
  publicSlug: string | null;
  publicNiche: string | null;
  publicCity: string | null;
  postwickAutoShare: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PostRecord = {
  id: string;
  brandId: string;
  platform: string;
  content: string;
  imageUrl: string | null;
  status: "pending" | "approved" | "skipped" | "published" | "failed";
  scheduledAt: string | null;
  publishedAt: string | null;
  externalPostId: string | null;
  publishError: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ConnectionRecord = {
  id: string;
  userId: string;
  brandId: string;
  platform: string;
  accountName: string | null;
  accessToken: string | null;
  metadata: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserRecord = {
  id: string;
  email: string | null;
  subscriptionTier: "free" | "pro" | "max";
  stripeCustomerId: string | null;
  timezone: string;
  defaultPostingFrequency: number;
  notifyQueue: boolean;
  notifyPublish: boolean;
  notifyWeeklyDigest: boolean;
  demoModeEnabled: boolean;
  profileOnboardingCompleted: boolean;
  displayName: string | null;
  referralSource: string | null;
  referralDetail: string | null;
  agencyId: string | null;
  referredByAgencyId: string | null;
  refineUsageCount: number;
  refineUsagePeriod: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CalendarPost = PostRecord & {
  brandName: string;
};

export type AnalyticsSummary = {
  totalPosts: number;
  pending: number;
  scheduled: number;
  published: number;
  failed: number;
  skipped: number;
  approvalRate: number;
  publishedThisWeek: number;
  publishedThisMonth: number;
  byPlatform: Array<{ platform: string; total: number; published: number }>;
  weeklyPublished: Array<{ label: string; count: number }>;
};

export type ActivityItem = CalendarPost & {
  action: "published" | "scheduled" | "skipped" | "failed" | "generated";
};

export type AgencyRecord = {
  id: string;
  ownerUserId: string;
  name: string;
  contactEmail: string | null;
  referralCode: string;
  status: "pending" | "active" | "suspended";
  whiteLabelName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AgencyReferralRow = {
  id: string;
  email: string | null;
  subscriptionTier: UserRecord["subscriptionTier"];
  signupAt: string;
  convertedAt: string | null;
};

function parseBrand(row: typeof brands.$inferSelect): BrandRecord {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    websiteUrl: row.websiteUrl,
    description: row.description,
    crawlStatus: row.crawlStatus as BrandRecord["crawlStatus"],
    researchData: row.researchData,
    postingFrequency: row.postingFrequency,
    isPublic: row.isPublic ?? false,
    publicSlug: row.publicSlug ?? null,
    publicNiche: row.publicNiche ?? null,
    publicCity: row.publicCity ?? null,
    postwickAutoShare: row.postwickAutoShare ?? false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function parsePost(row: typeof posts.$inferSelect): PostRecord {
  return {
    id: row.id,
    brandId: row.brandId,
    platform: row.platform,
    content: row.content,
    imageUrl: row.imageUrl,
    status: row.status as PostRecord["status"],
    scheduledAt: row.scheduledAt,
    publishedAt: row.publishedAt,
    externalPostId: row.externalPostId,
    publishError: row.publishError,
    isPublic: row.isPublic ?? false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function parseConnection(row: typeof connections.$inferSelect): ConnectionRecord {
  return {
    id: row.id,
    userId: row.userId,
    brandId: row.brandId,
    platform: row.platform,
    accountName: row.accountName,
    accessToken: decryptOptional(row.accessToken),
    metadata: row.metadata,
    isDemo: row.isDemo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function parseUser(row: typeof users.$inferSelect): UserRecord {
  const tier = row.subscriptionTier;
  const frequency = row.defaultPostingFrequency;
  return {
    id: row.id,
    email: row.email,
    subscriptionTier: tier === "pro" || tier === "max" ? tier : "free",
    stripeCustomerId: row.stripeCustomerId,
    timezone: row.timezone ?? "America/New_York",
    defaultPostingFrequency:
      frequency === 5 || frequency === 7 ? frequency : 3,
    notifyQueue: row.notifyQueue ?? true,
    notifyPublish: row.notifyPublish ?? true,
    notifyWeeklyDigest: row.notifyWeeklyDigest ?? false,
    demoModeEnabled: row.demoModeEnabled ?? false,
    profileOnboardingCompleted: row.profileOnboardingCompleted ?? false,
    displayName: row.displayName ?? null,
    referralSource: row.referralSource ?? null,
    referralDetail: row.referralDetail ?? null,
    agencyId: row.agencyId ?? null,
    referredByAgencyId: row.referredByAgencyId ?? null,
    refineUsageCount: row.refineUsageCount ?? 0,
    refineUsagePeriod: row.refineUsagePeriod ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function isTimestampExpired(expiresAt: string) {
  const expiresMs = new Date(expiresAt).getTime();
  return Number.isNaN(expiresMs) || expiresMs <= Date.now();
}

export async function getBrandsByUserId(userId: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(brands)
    .where(eq(brands.userId, userId))
    .orderBy(desc(brands.createdAt));
  return rows.map(parseBrand);
}

export async function getPublicDirectoryBrands() {
  const db = await getDb();
  const rows = await db
    .select()
    .from(brands)
    .where(eq(brands.isPublic, true))
    .orderBy(desc(brands.updatedAt));
  return rows.map(parseBrand);
}

export async function updateBrandDirectoryListing(
  id: string,
  userId: string,
  data: {
    isPublic: boolean;
    publicNiche?: string | null;
    publicCity?: string | null;
  },
) {
  const existing = await getBrandById(id, userId);
  if (!existing) return null;

  const db = await getDb();
  const now = nowIso();
  let publicSlug = existing.publicSlug;
  let publicNiche = data.publicNiche ?? existing.publicNiche;
  const publicCity =
    data.publicCity !== undefined
      ? data.publicCity?.trim().slice(0, 80) || null
      : existing.publicCity;

  if (data.isPublic) {
    if (!publicSlug) {
      const base =
        existing.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "brand";
      publicSlug = `${base}-${id.slice(0, 8)}`;
    }

    if (!publicNiche && existing.researchData) {
      try {
        const research = JSON.parse(existing.researchData) as { industry?: string };
        publicNiche = research.industry?.trim() || "Small business";
      } catch {
        publicNiche = "Small business";
      }
    }
  }

  await db
    .update(brands)
    .set({
      isPublic: data.isPublic,
      publicSlug: data.isPublic ? publicSlug : existing.publicSlug,
      publicNiche: data.isPublic ? publicNiche : existing.publicNiche,
      publicCity: data.isPublic ? publicCity : existing.publicCity,
      // Turning off directory listing also disconnects Postwick auto-share.
      postwickAutoShare: data.isPublic ? existing.postwickAutoShare : false,
      updatedAt: now,
    })
    .where(and(eq(brands.id, id), eq(brands.userId, userId)));

  return (await getBrandById(id, userId))!;
}

export async function updateBrandPostwickConnection(
  id: string,
  userId: string,
  data: {
    connected: boolean;
    publicNiche?: string | null;
    publicCity?: string | null;
  },
) {
  const existing = await getBrandById(id, userId);
  if (!existing) return null;

  if (data.connected) {
    // Connecting requires a public directory listing + slug.
    await updateBrandDirectoryListing(id, userId, {
      isPublic: true,
      publicNiche: data.publicNiche ?? existing.publicNiche,
      publicCity: data.publicCity ?? existing.publicCity,
    });
  } else if (data.publicCity !== undefined || data.publicNiche !== undefined) {
    // Allow updating listing fields while connected.
    await updateBrandDirectoryListing(id, userId, {
      isPublic: existing.isPublic,
      publicNiche: data.publicNiche ?? existing.publicNiche,
      publicCity: data.publicCity ?? existing.publicCity,
    });
  }

  const db = await getDb();
  await db
    .update(brands)
    .set({
      postwickAutoShare: data.connected,
      updatedAt: nowIso(),
    })
    .where(and(eq(brands.id, id), eq(brands.userId, userId)));

  return (await getBrandById(id, userId))!;
}

/** Share all currently published posts for a brand onto Postwick. */
export async function shareAllPublishedPostsToPostwick(
  brandId: string,
  userId: string,
) {
  const brand = await getBrandById(brandId, userId);
  if (!brand) return { updated: 0, error: "Brand not found" as string | undefined };
  if (!brand.isPublic || !brand.publicSlug) {
    return {
      updated: 0,
      error: "Connect / list this brand publicly before sharing posts on Postwick",
    };
  }

  const db = await getDb();
  const now = nowIso();
  const rows = await db
    .update(posts)
    .set({ isPublic: true, updatedAt: now })
    .where(
      and(
        eq(posts.brandId, brandId),
        eq(posts.status, "published"),
        eq(posts.isPublic, false),
      ),
    )
    .returning({ id: posts.id });

  return { updated: rows.length, error: undefined as string | undefined };
}

const CLAIM_CODE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const CLAIM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateClaimCodeValue(length = 8) {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += CLAIM_CODE_ALPHABET[bytes[i]! % CLAIM_CODE_ALPHABET.length];
  }
  return out;
}

/**
 * Issue a single-use Postwick claim code for a brand owner.
 * Regenerating invalidates unused prior codes for the same user + brand scope.
 */
export async function createPostwickClaimCode(
  userId: string,
  brandId: string,
) {
  const brand = await getBrandById(brandId, userId);
  if (!brand) return null;

  const db = await getDb();
  const now = nowIso();

  // Invalidate unused codes for this user + brand (brand-scoped codes only).
  await db
    .update(postwickClaimCodes)
    .set({ usedAt: now })
    .where(
      and(
        eq(postwickClaimCodes.userId, userId),
        eq(postwickClaimCodes.brandId, brandId),
        sql`${postwickClaimCodes.usedAt} IS NULL`,
      ),
    );

  const code = generateClaimCodeValue(8);
  const expiresAt = new Date(Date.now() + CLAIM_CODE_TTL_MS).toISOString();
  const id = `pwc_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

  await db.insert(postwickClaimCodes).values({
    id,
    code,
    userId,
    brandId,
    expiresAt,
    usedAt: null,
    createdAt: now,
  });

  return { id, code, brandId, expiresAt };
}

/** If the brand has Postwick auto-share on, mark this published post public. */
export async function maybeAutoSharePostToPostwick(postId: string) {
  const db = await getDb();
  const rows = await db
    .select({ post: posts, brand: brands })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(eq(posts.id, postId))
    .limit(1);

  const row = rows[0];
  if (!row) return;

  if (
    !row.brand.postwickAutoShare ||
    !row.brand.isPublic ||
    !row.brand.publicSlug ||
    row.post.status !== "published"
  ) {
    return;
  }

  if (row.post.isPublic) return;

  await db
    .update(posts)
    .set({ isPublic: true, updatedAt: nowIso() })
    .where(eq(posts.id, postId));
}

export async function getPublicBrandBySlug(slug: string) {
  const db = await getDb();
  const row = await db.query.brands.findFirst({
    where: and(eq(brands.publicSlug, slug), eq(brands.isPublic, true)),
  });
  return row ? parseBrand(row) : null;
}

export async function getBrandById(id: string, userId: string) {
  const db = await getDb();
  const row = await db.query.brands.findFirst({
    where: and(eq(brands.id, id), eq(brands.userId, userId)),
  });
  return row ? parseBrand(row) : null;
}

export async function getBrandByWebsite(userId: string, websiteUrl: string) {
  const db = await getDb();
  const row = await db.query.brands.findFirst({
    where: and(eq(brands.userId, userId), eq(brands.websiteUrl, websiteUrl)),
  });
  return row ? parseBrand(row) : null;
}

export async function createBrand(input: {
  id: string;
  userId: string;
  name: string;
  websiteUrl: string;
  description?: string;
}) {
  const db = await getDb();
  const user = await getOrCreateUser(input.userId);
  const now = nowIso();
  await db.insert(brands).values({
    id: input.id,
    userId: input.userId,
    name: input.name,
    websiteUrl: input.websiteUrl,
    description: input.description ?? null,
    crawlStatus: "pending",
    postingFrequency: user.defaultPostingFrequency,
    createdAt: now,
    updatedAt: now,
  });
  const brand = (await getBrandById(input.id, input.userId))!;
  emitStudioOpsEvent({
    product: "kerygma",
    event: "brand.created",
    email: user.email,
    externalUserId: input.userId,
    metadata: {
      brandId: input.id,
      websiteUrl: input.websiteUrl,
      name: input.name,
    },
  });
  return brand;
}

export async function updateBrand(
  id: string,
  userId: string,
  data: Partial<{
    name: string;
    description: string;
    crawlStatus: BrandRecord["crawlStatus"];
    researchData: unknown;
  }>,
) {
  const existing = await getBrandById(id, userId);
  if (!existing) return null;

  const db = await getDb();
  await db
    .update(brands)
    .set({
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      crawlStatus: data.crawlStatus ?? existing.crawlStatus,
      researchData:
        data.researchData !== undefined
          ? JSON.stringify(data.researchData)
          : existing.researchData,
      updatedAt: nowIso(),
    })
    .where(and(eq(brands.id, id), eq(brands.userId, userId)));

  return getBrandById(id, userId);
}

export async function deleteBrand(id: string, userId: string) {
  const db = await getDb();
  const result = await db
    .delete(brands)
    .where(and(eq(brands.id, id), eq(brands.userId, userId)))
    .returning({ id: brands.id });
  return result.length > 0;
}

export async function getPostsByBrandId(brandId: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(posts)
    .where(eq(posts.brandId, brandId))
    .orderBy(desc(posts.createdAt));
  return rows.map(parsePost);
}

export async function getPendingPostsByUserId(userId: string) {
  const db = await getDb();
  const rows = await db
    .select({ post: posts, brandName: brands.name })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(brands.userId, userId), eq(posts.status, "pending")))
    .orderBy(desc(posts.createdAt));
  return rows.map((row) => ({
    ...parsePost(row.post),
    brandName: row.brandName,
  }));
}

export async function getScheduledPostsByUserId(userId: string, limit = 8) {
  const db = await getDb();
  const rows = await db
    .select({ post: posts, brandName: brands.name })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        eq(brands.userId, userId),
        inArray(posts.status, ["approved", "published"]),
        isNotNull(posts.scheduledAt),
      ),
    )
    .orderBy(asc(posts.scheduledAt))
    .limit(limit);

  return rows.map((row) => ({
    ...parsePost(row.post),
    brandName: row.brandName,
  })) as CalendarPost[];
}

export async function getCalendarPostsByUserId(userId: string, from: string, to: string) {
  const db = await getDb();
  const rows = await db
    .select({ post: posts, brandName: brands.name })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        eq(brands.userId, userId),
        isNotNull(posts.scheduledAt),
        gte(posts.scheduledAt, from),
        lte(posts.scheduledAt, to),
      ),
    )
    .orderBy(asc(posts.scheduledAt));

  return rows.map((row) => ({
    ...parsePost(row.post),
    brandName: row.brandName,
  })) as CalendarPost[];
}

export async function getScheduledTimesForBrand(brandId: string) {
  const db = await getDb();
  const rows = await db
    .select({ scheduledAt: posts.scheduledAt })
    .from(posts)
    .where(
      and(
        eq(posts.brandId, brandId),
        isNotNull(posts.scheduledAt),
        inArray(posts.status, ["approved", "published"]),
      ),
    );
  return rows
    .map((row) => row.scheduledAt)
    .filter((value): value is string => Boolean(value));
}

export async function countBrandAutopilotPostsInWeek(
  brandId: string,
  weekStartIso: string,
  weekEndIso: string,
  excludePostId?: string,
) {
  const db = await getDb();
  const weekConditions = or(
    and(
      eq(posts.status, "approved"),
      isNotNull(posts.scheduledAt),
      gte(posts.scheduledAt, weekStartIso),
      lt(posts.scheduledAt, weekEndIso),
    ),
    and(
      eq(posts.status, "published"),
      isNotNull(posts.publishedAt),
      gte(posts.publishedAt, weekStartIso),
      lt(posts.publishedAt, weekEndIso),
    ),
  );

  const where = excludePostId
    ? and(eq(posts.brandId, brandId), weekConditions, ne(posts.id, excludePostId))
    : and(eq(posts.brandId, brandId), weekConditions);

  const [row] = await db.select({ total: count() }).from(posts).where(where);
  return row?.total ?? 0;
}

/** Counts scheduled/published autopilot posts for a user across all brands in a UTC week. */
export async function countUserAutopilotPostsInWeek(
  userId: string,
  weekStartIso: string,
  weekEndIso: string,
  excludePostId?: string,
) {
  const db = await getDb();
  const weekConditions = or(
    and(
      eq(posts.status, "approved"),
      isNotNull(posts.scheduledAt),
      gte(posts.scheduledAt, weekStartIso),
      lt(posts.scheduledAt, weekEndIso),
    ),
    and(
      eq(posts.status, "published"),
      isNotNull(posts.publishedAt),
      gte(posts.publishedAt, weekStartIso),
      lt(posts.publishedAt, weekEndIso),
    ),
  );

  const where = excludePostId
    ? and(eq(brands.userId, userId), weekConditions, ne(posts.id, excludePostId))
    : and(eq(brands.userId, userId), weekConditions);

  const [row] = await db
    .select({ total: count() })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(where);
  return row?.total ?? 0;
}

export async function createPosts(
  items: Array<{
    id: string;
    brandId: string;
    platform: string;
    content: string;
    imageUrl?: string | null;
  }>,
) {
  if (items.length === 0) return [];

  const db = await getDb();
  const now = nowIso();
  await db.insert(posts).values(
    items.map((item) => ({
      id: item.id,
      brandId: item.brandId,
      platform: item.platform,
      content: item.content,
      imageUrl: item.imageUrl ?? null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    })),
  );

  return getPostsByBrandId(items[0]!.brandId);
}

export async function updatePostStatus(
  postId: string,
  userId: string,
  status: PostRecord["status"],
) {
  const db = await getDb();
  const owned = await db
    .select({ id: posts.id })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(posts.id, postId), eq(brands.userId, userId)))
    .limit(1);

  if (owned.length === 0) return null;

  const now = nowIso();
  await db
    .update(posts)
    .set({ status, updatedAt: now })
    .where(eq(posts.id, postId));

  const row = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  return row ? parsePost(row) : null;
}

export async function setPostPublic(
  postId: string,
  userId: string,
  isPublic: boolean,
): Promise<{ post: PostRecord; error?: string } | null> {
  const db = await getDb();
  const rows = await db
    .select({ post: posts, brand: brands })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(posts.id, postId), eq(brands.userId, userId)))
    .limit(1);

  if (rows.length === 0) return null;

  const { post, brand } = rows[0]!;

  if (isPublic) {
    if (post.status !== "published") {
      return {
        post: parsePost(post),
        error: "Only published posts can be shared on Postwick",
      };
    }
    if (!brand.isPublic || !brand.publicSlug) {
      return {
        post: parsePost(post),
        error:
          "Connect this brand to Postwick (or list it in the public directory) first, then share posts",
      };
    }
  }

  const now = nowIso();
  await db
    .update(posts)
    .set({ isPublic, updatedAt: now })
    .where(eq(posts.id, postId));

  const updated = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  return updated ? { post: parsePost(updated) } : null;
}

export async function getPendingPostForUser(postId: string, userId: string) {
  const db = await getDb();
  const rows = await db
    .select({ post: posts, brand: brands })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        eq(posts.id, postId),
        eq(brands.userId, userId),
        eq(posts.status, "pending"),
      ),
    )
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0]!;
  return {
    post: parsePost(row.post),
    brand: parseBrand(row.brand),
  };
}

export async function updatePostDraft(
  postId: string,
  userId: string,
  data: { content?: string; imageUrl?: string | null },
) {
  const owned = await getPendingPostForUser(postId, userId);
  if (!owned) return null;

  const db = await getDb();
  const now = nowIso();
  await db
    .update(posts)
    .set({
      content: data.content ?? owned.post.content,
      imageUrl:
        data.imageUrl !== undefined ? data.imageUrl : owned.post.imageUrl,
      updatedAt: now,
    })
    .where(eq(posts.id, postId));

  const row = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  return row ? parsePost(row) : null;
}

export async function updatePostImageUrl(
  postId: string,
  userId: string,
  imageUrl: string | null,
) {
  const db = await getDb();
  const owned = await db
    .select({ id: posts.id })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(posts.id, postId), eq(brands.userId, userId)))
    .limit(1);

  if (owned.length === 0) return null;

  const now = nowIso();
  await db
    .update(posts)
    .set({ imageUrl, updatedAt: now })
    .where(eq(posts.id, postId));

  const row = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  return row ? parsePost(row) : null;
}

export async function scheduleApprovedPost(postId: string, userId: string) {
  const db = await getDb();
  const row = await db
    .select({ post: posts })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(posts.id, postId), eq(brands.userId, userId)))
    .limit(1);

  if (row.length === 0) return null;

  const post = parsePost(row[0]!.post);
  const user = await getOrCreateUser(userId);
  const { postsPerWeek } = getPlanLimits(user.subscriptionTier);
  const existing = await getScheduledTimesForBrand(post.brandId);

  const scheduledAt = await getNextScheduleSlotWithWeeklyCap(
    existing,
    async (weekStart, weekEnd) => {
      const used = await countUserAutopilotPostsInWeek(
        userId,
        weekStart.toISOString(),
        weekEnd.toISOString(),
        postId,
      );
      return used < postsPerWeek;
    },
  );

  if (!scheduledAt) {
    throw new WeeklyScheduleLimitError();
  }

  const now = nowIso();

  await db
    .update(posts)
    .set({ scheduledAt, updatedAt: now })
    .where(eq(posts.id, postId));

  const updated = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  return updated ? parsePost(updated) : null;
}

export async function reschedulePost(
  postId: string,
  userId: string,
  scheduledAt: string,
) {
  const db = await getDb();
  const row = await db
    .select({ post: posts })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(posts.id, postId), eq(brands.userId, userId)))
    .limit(1);

  if (row.length === 0) return null;

  const post = parsePost(row[0]!.post);
  if (post.status !== "approved") {
    throw new Error("Only approved posts waiting to publish can be rescheduled");
  }

  const slot = new Date(scheduledAt);
  if (Number.isNaN(slot.getTime())) {
    throw new Error("Invalid schedule date");
  }
  if (slot.getTime() <= Date.now()) {
    throw new Error("Choose a future date and time");
  }

  const user = await getOrCreateUser(userId);
  const { postsPerWeek } = getPlanLimits(user.subscriptionTier);
  const { start, end } = getUtcWeekRange(slot);
  const used = await countUserAutopilotPostsInWeek(
    userId,
    start.toISOString(),
    end.toISOString(),
    postId,
  );
  if (used >= postsPerWeek) {
    throw new WeeklyScheduleLimitError(
      "That week is full on your current plan across all brands. Pick another date or upgrade for more posts per week.",
    );
  }

  const now = nowIso();
  await db
    .update(posts)
    .set({ scheduledAt, updatedAt: now })
    .where(eq(posts.id, postId));

  const updated = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  return updated ? parsePost(updated) : null;
}

export const PUBLISHING_LOCK = "__publishing__";

export async function getDuePosts(userId: string) {
  const db = await getDb();
  const now = nowIso();
  const rows = await db
    .select({ post: posts })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        eq(brands.userId, userId),
        eq(posts.status, "approved"),
        isNotNull(posts.scheduledAt),
        lte(posts.scheduledAt, now),
      ),
    );
  return rows.map((row) => parsePost(row.post));
}

export async function getUserIdsWithDuePosts() {
  const db = await getDb();
  const now = nowIso();
  const rows = await db
    .selectDistinct({ userId: brands.userId })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        eq(posts.status, "approved"),
        isNotNull(posts.scheduledAt),
        lte(posts.scheduledAt, now),
      ),
    );

  return rows.map((row) => row.userId);
}

export async function claimDuePostForPublishing(
  postId: string,
  userId: string,
): Promise<PostRecord | null> {
  const db = await getDb();
  const now = nowIso();
  const rows = await db
    .update(posts)
    .set({
      status: "published",
      publishedAt: now,
      externalPostId: PUBLISHING_LOCK,
      publishError: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(posts.id, postId),
        eq(posts.status, "approved"),
        isNotNull(posts.scheduledAt),
        lte(posts.scheduledAt, now),
        sql`${posts.brandId} IN (
          SELECT id FROM brands WHERE user_id = ${userId}
        )`,
      ),
    )
    .returning();

  const row = rows[0];
  return row ? parsePost(row) : null;
}

export async function claimFailedPostForRetry(
  postId: string,
  userId: string,
): Promise<PostRecord | null> {
  const db = await getDb();
  const now = nowIso();
  const rows = await db
    .update(posts)
    .set({
      status: "published",
      publishedAt: now,
      externalPostId: PUBLISHING_LOCK,
      publishError: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(posts.id, postId),
        eq(posts.status, "failed"),
        sql`${posts.brandId} IN (
          SELECT id FROM brands WHERE user_id = ${userId}
        )`,
      ),
    )
    .returning();

  const row = rows[0];
  return row ? parsePost(row) : null;
}

export async function finalizePublishedPost(
  postId: string,
  userId: string,
  externalPostId: string,
) {
  const db = await getDb();
  const now = nowIso();
  await db
    .update(posts)
    .set({
      externalPostId,
      updatedAt: now,
    })
    .where(
      and(
        eq(posts.id, postId),
        eq(posts.status, "published"),
        eq(posts.externalPostId, PUBLISHING_LOCK),
        sql`${posts.brandId} IN (
          SELECT id FROM brands WHERE user_id = ${userId}
        )`,
      ),
    );

  await maybeAutoSharePostToPostwick(postId);
}

/** @deprecated Use claimDuePostForPublishing + finalizePublishedPost for cron idempotency. */
export async function markPostPublished(
  postId: string,
  userId: string,
  externalPostId: string,
) {
  const db = await getDb();
  const now = nowIso();
  await db
    .update(posts)
    .set({
      status: "published",
      publishedAt: now,
      externalPostId,
      publishError: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(posts.id, postId),
        sql`${posts.brandId} IN (
          SELECT id FROM brands WHERE user_id = ${userId}
        )`,
      ),
    );

  await maybeAutoSharePostToPostwick(postId);
}

export async function markPostFailed(postId: string, userId: string, message: string) {
  const db = await getDb();
  const now = nowIso();
  await db
    .update(posts)
    .set({
      status: "failed",
      publishedAt: null,
      externalPostId: null,
      publishError: message,
      updatedAt: now,
    })
    .where(
      sql`${posts.id} = ${postId} AND ${posts.brandId} IN (
        SELECT id FROM brands WHERE user_id = ${userId}
      )`,
    );
}

export async function getConnectionsByUserId(userId: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(connections)
    .where(eq(connections.userId, userId))
    .orderBy(desc(connections.createdAt));
  return rows.map(parseConnection);
}

export async function getConnectionForBrand(brandId: string, platform: string) {
  const db = await getDb();
  const row = await db.query.connections.findFirst({
    where: and(
      eq(connections.brandId, brandId),
      eq(connections.platform, platform.toLowerCase()),
    ),
  });
  return row ? parseConnection(row) : null;
}

export async function getConnectionById(connectionId: string, userId: string) {
  const db = await getDb();
  const row = await db.query.connections.findFirst({
    where: and(eq(connections.id, connectionId), eq(connections.userId, userId)),
  });
  return row ? parseConnection(row) : null;
}

export async function upsertConnection(input: {
  id: string;
  userId: string;
  brandId: string;
  platform: string;
  accountName?: string;
  accessToken?: string;
  metadata?: string | Record<string, unknown> | null;
  isDemo?: boolean;
}) {
  const db = await getDb();
  const now = nowIso();
  const platform = input.platform.toLowerCase();
  const metadata =
    typeof input.metadata === "string"
      ? input.metadata
      : input.metadata
        ? JSON.stringify(input.metadata)
        : null;
  const accessToken =
    input.accessToken !== undefined ? encryptOptional(input.accessToken) : null;

  const updateSet: {
    accountName: string | null;
    metadata: string | null;
    isDemo: boolean;
    updatedAt: string;
    accessToken?: string | null;
  } = {
    accountName: input.accountName ?? null,
    metadata,
    isDemo: input.isDemo ?? false,
    updatedAt: now,
  };
  if (input.accessToken !== undefined) {
    updateSet.accessToken = encryptOptional(input.accessToken);
  }

  await db
    .insert(connections)
    .values({
      id: input.id,
      userId: input.userId,
      brandId: input.brandId,
      platform,
      accountName: input.accountName ?? null,
      accessToken,
      metadata,
      isDemo: input.isDemo ?? false,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [connections.brandId, connections.platform],
      set: updateSet,
    });

  return getConnectionForBrand(input.brandId, platform);
}

export async function deleteConnection(connectionId: string, userId: string) {
  const db = await getDb();
  const result = await db
    .delete(connections)
    .where(and(eq(connections.id, connectionId), eq(connections.userId, userId)))
    .returning({ id: connections.id });
  return result.length > 0;
}

export type MetaOauthPendingPage = {
  id: string;
  name: string;
  accessToken: string;
  pictureUrl: string | null;
  refreshToken?: string | null;
  refreshTokenExpiresIn?: number | null;
  accessTokenExpiresIn?: number | null;
};

export type MetaOauthPendingRecord = {
  id: string;
  userId: string;
  brandId: string;
  platform: string;
  pages: MetaOauthPendingPage[];
  expiresAt: string;
  createdAt: string;
};

function parseMetaOauthPending(row: typeof metaOauthPending.$inferSelect): MetaOauthPendingRecord {
  let pages: MetaOauthPendingPage[] = [];
  try {
    const raw = JSON.parse(row.pagesData) as MetaOauthPendingPage[];
    pages = raw.map((page) => ({
      ...page,
      accessToken: decryptOptional(page.accessToken) ?? "",
    }));
  } catch {
    pages = [];
  }
  return {
    id: row.id,
    userId: row.userId,
    brandId: row.brandId,
    platform: row.platform,
    pages,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}

export async function saveMetaOauthPending(input: {
  id: string;
  userId: string;
  brandId: string;
  platform: string;
  pages: MetaOauthPendingPage[];
  expiresAt: string;
}) {
  const db = await getDb();
  const now = nowIso();
  const encryptedPages = input.pages.map((page) => ({
    ...page,
    accessToken: encryptOptional(page.accessToken) ?? "",
  }));

  await db.delete(metaOauthPending).where(lt(metaOauthPending.expiresAt, now));

  await db
    .delete(metaOauthPending)
    .where(
      and(
        eq(metaOauthPending.userId, input.userId),
        eq(metaOauthPending.brandId, input.brandId),
        eq(metaOauthPending.platform, input.platform),
      ),
    );

  await db.insert(metaOauthPending).values({
    id: input.id,
    userId: input.userId,
    brandId: input.brandId,
    platform: input.platform,
    pagesData: JSON.stringify(encryptedPages),
    expiresAt: input.expiresAt,
    createdAt: now,
  });

  return input.id;
}

export async function getMetaOauthPendingById(id: string, userId: string) {
  const db = await getDb();
  const row = await db.query.metaOauthPending.findFirst({
    where: and(eq(metaOauthPending.id, id), eq(metaOauthPending.userId, userId)),
  });
  if (!row) return null;

  const pending = parseMetaOauthPending(row);
  if (isTimestampExpired(pending.expiresAt)) {
    await db.delete(metaOauthPending).where(eq(metaOauthPending.id, id));
    return null;
  }

  return pending;
}

export async function getMetaOauthPendingForBrand(
  userId: string,
  brandId: string,
  platform: string,
) {
  const db = await getDb();
  const row = await db.query.metaOauthPending.findFirst({
    where: and(
      eq(metaOauthPending.userId, userId),
      eq(metaOauthPending.brandId, brandId),
      eq(metaOauthPending.platform, platform),
    ),
  });
  if (!row) return null;

  const pending = parseMetaOauthPending(row);
  if (isTimestampExpired(pending.expiresAt)) {
    await db.delete(metaOauthPending).where(eq(metaOauthPending.id, row.id));
    return null;
  }

  return pending;
}

export async function deleteMetaOauthPending(id: string, userId: string) {
  const db = await getDb();
  const result = await db
    .delete(metaOauthPending)
    .where(and(eq(metaOauthPending.id, id), eq(metaOauthPending.userId, userId)))
    .returning({ id: metaOauthPending.id });
  return result.length > 0;
}

export async function userHasConnections(userId: string) {
  const db = await getDb();
  const [row] = await db
    .select({ count: count() })
    .from(connections)
    .where(eq(connections.userId, userId));
  return (row?.count ?? 0) > 0;
}

export async function getUserById(userId: string) {
  const db = await getDb();
  const row = await db.query.users.findFirst({ where: eq(users.id, userId) });
  return row ? parseUser(row) : null;
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const db = await getDb();
  const row = await db.query.users.findFirst({
    where: eq(users.stripeCustomerId, stripeCustomerId),
  });
  return row ? parseUser(row) : null;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  const row = await db.query.users.findFirst({
    where: eq(users.email, email.trim().toLowerCase()),
  });
  return row ? parseUser(row) : null;
}

export async function getOrCreateUser(userId: string, email?: string | null) {
  const existing = await getUserById(userId);
  if (existing) {
    if (email && email !== existing.email) {
      const db = await getDb();
      await db
        .update(users)
        .set({ email, updatedAt: nowIso() })
        .where(eq(users.id, userId));
      return (await getUserById(userId))!;
    }
    return existing;
  }

  const db = await getDb();
  const now = nowIso();
  await db.insert(users).values({
    id: userId,
    email: email ?? null,
    subscriptionTier: "free",
    createdAt: now,
    updatedAt: now,
  });

  emitStudioOpsEvent({
    product: "kerygma",
    event: "user.signup",
    email: email ?? null,
    externalUserId: userId,
    metadata: { source: "clerk" },
  });

  return (await getUserById(userId))!;
}

export async function completeProfileOnboarding(
  userId: string,
  data: {
    displayName?: string | null;
    referralSource: string;
    referralDetail?: string | null;
  },
) {
  const db = await getDb();
  const now = nowIso();

  await db
    .update(users)
    .set({
      profileOnboardingCompleted: true,
      displayName: data.displayName?.trim() || null,
      referralSource: data.referralSource,
      referralDetail: data.referralDetail?.trim() || null,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  return (await getUserById(userId))!;
}

export async function updateUserSubscription(
  userId: string,
  data: {
    subscriptionTier: UserRecord["subscriptionTier"];
    stripeCustomerId?: string | null;
  },
) {
  const db = await getDb();
  const now = nowIso();
  const existing = await getUserById(userId);
  const priorTier = existing?.subscriptionTier ?? "free";

  await db
    .insert(users)
    .values({
      id: userId,
      email: existing?.email ?? null,
      subscriptionTier: data.subscriptionTier,
      stripeCustomerId: data.stripeCustomerId ?? existing?.stripeCustomerId ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        subscriptionTier: data.subscriptionTier,
        stripeCustomerId: data.stripeCustomerId ?? existing?.stripeCustomerId ?? null,
        updatedAt: now,
      },
    });

  const updated = (await getUserById(userId))!;
  if (
    updated &&
    priorTier === "free" &&
    (data.subscriptionTier === "pro" || data.subscriptionTier === "max")
  ) {
    emitStudioOpsEvent({
      product: "kerygma",
      event: "subscription.upgraded",
      email: updated.email,
      externalUserId: userId,
      metadata: { from: priorTier, to: data.subscriptionTier },
    });
  }

  return updated;
}

export async function updateUserSettings(
  userId: string,
  data: Partial<{
    timezone: string;
    defaultPostingFrequency: number;
    notifyQueue: boolean;
    notifyPublish: boolean;
    notifyWeeklyDigest: boolean;
    demoModeEnabled: boolean;
  }>,
) {
  const existing = await getOrCreateUser(userId);
  const db = await getDb();
  const now = nowIso();

  await db
    .update(users)
    .set({
      timezone: data.timezone ?? existing.timezone,
      defaultPostingFrequency:
        data.defaultPostingFrequency ?? existing.defaultPostingFrequency,
      notifyQueue: data.notifyQueue ?? existing.notifyQueue,
      notifyPublish: data.notifyPublish ?? existing.notifyPublish,
      notifyWeeklyDigest:
        data.notifyWeeklyDigest ?? existing.notifyWeeklyDigest,
      demoModeEnabled: data.demoModeEnabled ?? existing.demoModeEnabled,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  return (await getUserById(userId))!;
}

export async function syncUserRefineUsagePeriod(userId: string, period: string) {
  const db = await getDb();
  const now = nowIso();
  await db
    .update(users)
    .set({
      refineUsageCount: 0,
      refineUsagePeriod: period,
      updatedAt: now,
    })
    .where(eq(users.id, userId));
  return (await getUserById(userId))!;
}

export async function incrementUserRefineUsage(userId: string, period: string) {
  const db = await getDb();
  const now = nowIso();
  const user = await getOrCreateUser(userId);

  if (user.refineUsagePeriod !== period) {
    await db
      .update(users)
      .set({
        refineUsageCount: 1,
        refineUsagePeriod: period,
        updatedAt: now,
      })
      .where(eq(users.id, userId));
  } else {
    await db
      .update(users)
      .set({
        refineUsageCount: user.refineUsageCount + 1,
        updatedAt: now,
      })
      .where(eq(users.id, userId));
  }

  return (await getUserById(userId))!;
}

export async function countConnectionsByUserId(userId: string) {
  const db = await getDb();
  const [row] = await db
    .select({ count: count() })
    .from(connections)
    .where(eq(connections.userId, userId));
  return row?.count ?? 0;
}

export async function getDashboardStats(userId: string) {
  const db = await getDb();

  const [scheduledRow] = await db
    .select({ count: count() })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        eq(brands.userId, userId),
        eq(posts.status, "approved"),
        isNotNull(posts.scheduledAt),
      ),
    );

  const [pendingRow] = await db
    .select({ count: count() })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(brands.userId, userId), eq(posts.status, "pending")));

  const [brandsRow] = await db
    .select({ count: count() })
    .from(brands)
    .where(eq(brands.userId, userId));

  const [publishedRow] = await db
    .select({ count: count() })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(brands.userId, userId), eq(posts.status, "published")));

  return {
    scheduled: scheduledRow?.count ?? 0,
    pending: pendingRow?.count ?? 0,
    brands: brandsRow?.count ?? 0,
    published: publishedRow?.count ?? 0,
  };
}

export type PublishedBrandStats = {
  total: number;
  thisWeek: number;
};

export async function getPublishedStatsByBrand(userId: string) {
  const db = await getDb();

  const totalRows = await db
    .select({
      brandId: posts.brandId,
      count: count(),
    })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(brands.userId, userId), eq(posts.status, "published")))
    .groupBy(posts.brandId);

  const weekRows = await db
    .select({
      brandId: posts.brandId,
      count: count(),
    })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        eq(brands.userId, userId),
        eq(posts.status, "published"),
        gte(posts.publishedAt, sql`NOW() - INTERVAL '7 days'`),
      ),
    )
    .groupBy(posts.brandId);

  const byBrandId: Record<string, PublishedBrandStats> = {};

  for (const row of totalRows) {
    byBrandId[row.brandId] = {
      total: row.count,
      thisWeek: 0,
    };
  }

  for (const row of weekRows) {
    const current = byBrandId[row.brandId] ?? { total: 0, thisWeek: 0 };
    current.thisWeek = row.count;
    byBrandId[row.brandId] = current;
  }

  return byBrandId;
}

export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  const db = await getDb();

  const counts = await db
    .select({ status: posts.status, count: count() })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(eq(brands.userId, userId))
    .groupBy(posts.status);

  const countByStatus = Object.fromEntries(
    counts.map((row) => [row.status, row.count]),
  ) as Record<string, number>;

  const pending = countByStatus.pending ?? 0;
  const scheduled = countByStatus.approved ?? 0;
  const published = countByStatus.published ?? 0;
  const failed = countByStatus.failed ?? 0;
  const skipped = countByStatus.skipped ?? 0;
  const reviewed = scheduled + published + failed + skipped;
  const approvalRate =
    reviewed > 0 ? Math.round(((scheduled + published + failed) / reviewed) * 100) : 0;

  const [weekRow] = await db
    .select({ count: count() })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        eq(brands.userId, userId),
        eq(posts.status, "published"),
        gte(posts.publishedAt, sql`NOW() - INTERVAL '7 days'`),
      ),
    );

  const [monthRow] = await db
    .select({ count: count() })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        eq(brands.userId, userId),
        eq(posts.status, "published"),
        gte(posts.publishedAt, sql`NOW() - INTERVAL '30 days'`),
      ),
    );

  const platformRows = await db
    .select({
      platform: posts.platform,
      status: posts.status,
      count: count(),
    })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(eq(brands.userId, userId))
    .groupBy(posts.platform, posts.status);

  const platformMap = new Map<string, { total: number; published: number }>();
  for (const row of platformRows) {
    const current = platformMap.get(row.platform) ?? { total: 0, published: 0 };
    current.total += row.count;
    if (row.status === "published") {
      current.published += row.count;
    }
    platformMap.set(row.platform, current);
  }

  const weeklyResult = await db.execute(sql`
    SELECT
      TO_CHAR(MIN(p.published_at), 'Mon DD') AS week_start,
      COUNT(*)::int AS count
    FROM posts p
    INNER JOIN brands b ON b.id = p.brand_id
    WHERE b.user_id = ${userId}
      AND p.status = 'published'
      AND p.published_at IS NOT NULL
      AND p.published_at >= NOW() - INTERVAL '56 days'
    GROUP BY DATE_TRUNC('week', p.published_at)
    ORDER BY DATE_TRUNC('week', p.published_at) ASC
  `);

  const weeklyRowList = (
    Array.isArray(weeklyResult)
      ? weeklyResult
      : (weeklyResult as { rows?: Record<string, unknown>[] }).rows ?? []
  ) as Array<{ week_start: string; count: number }>;

  const weeklyPublished = weeklyRowList.map((row) => ({
    label: row.week_start,
    count: Number(row.count),
  }));

  return {
    totalPosts: pending + scheduled + published + failed + skipped,
    pending,
    scheduled,
    published,
    failed,
    skipped,
    approvalRate,
    publishedThisWeek: weekRow?.count ?? 0,
    publishedThisMonth: monthRow?.count ?? 0,
    byPlatform: Array.from(platformMap.entries()).map(([platform, stats]) => ({
      platform,
      total: stats.total,
      published: stats.published,
    })),
    weeklyPublished,
  };
}

export type WeeklyDigestPost = {
  platform: string;
  brandName: string;
  content: string;
  scheduledAt: string | null;
  publishedAt: string | null;
};

export type WeeklyDigestData = {
  publishedCount: number;
  scheduledCount: number;
  pendingCount: number;
  failedCount: number;
  published: WeeklyDigestPost[];
  scheduled: WeeklyDigestPost[];
};

export async function getUsersForWeeklyDigest() {
  const db = await getDb();
  const rows = await db.query.users.findMany({
    where: eq(users.notifyWeeklyDigest, true),
  });
  return rows.map(parseUser);
}

export async function getUsersForQueueReminders() {
  const db = await getDb();
  const rows = await db.query.users.findMany({
    where: eq(users.notifyQueue, true),
  });
  return rows.map(parseUser);
}

export async function getWeeklyDigestForUser(
  userId: string,
): Promise<WeeklyDigestData> {
  const db = await getDb();
  const now = nowIso();

  const publishedRows = await db
    .select({ post: posts, brandName: brands.name })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        eq(brands.userId, userId),
        eq(posts.status, "published"),
        isNotNull(posts.publishedAt),
        gte(posts.publishedAt, sql`NOW() - INTERVAL '7 days'`),
      ),
    )
    .orderBy(desc(posts.publishedAt));

  const scheduledRows = await db
    .select({ post: posts, brandName: brands.name })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        eq(brands.userId, userId),
        eq(posts.status, "approved"),
        isNotNull(posts.scheduledAt),
        gte(posts.scheduledAt, now),
        lte(posts.scheduledAt, sql`NOW() + INTERVAL '7 days'`),
      ),
    )
    .orderBy(asc(posts.scheduledAt));

  const [pendingRow] = await db
    .select({ count: count() })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(brands.userId, userId), eq(posts.status, "pending")));

  const [failedRow] = await db
    .select({ count: count() })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(brands.userId, userId), eq(posts.status, "failed")));

  const toDigestPost = (row: {
    post: typeof posts.$inferSelect;
    brandName: string;
  }): WeeklyDigestPost => {
    const parsed = parsePost(row.post);
    return {
      platform: parsed.platform,
      brandName: row.brandName,
      content: parsed.content,
      scheduledAt: parsed.scheduledAt,
      publishedAt: parsed.publishedAt,
    };
  };

  return {
    publishedCount: publishedRows.length,
    scheduledCount: scheduledRows.length,
    pendingCount: pendingRow?.count ?? 0,
    failedCount: failedRow?.count ?? 0,
    published: publishedRows.map(toDigestPost),
    scheduled: scheduledRows.map(toDigestPost),
  };
}

export async function getPostHistory(
  userId: string,
  filter: "all" | "published" | "failed" = "all",
  limit = 50,
) {
  const db = await getDb();
  const statusFilter =
    filter === "all"
      ? inArray(posts.status, ["published", "failed"])
      : eq(posts.status, filter);

  const rows = await db
    .select({ post: posts, brandName: brands.name })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(brands.userId, userId), statusFilter))
    .orderBy(
      desc(sql`COALESCE(${posts.publishedAt}, ${posts.scheduledAt}, ${posts.updatedAt})`),
    )
    .limit(limit);

  return rows.map((row) => ({
    ...parsePost(row.post),
    brandName: row.brandName,
  })) as CalendarPost[];
}

export async function getRecentActivity(userId: string, limit = 12): Promise<ActivityItem[]> {
  const db = await getDb();
  const rows = await db
    .select({ post: posts, brandName: brands.name })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(brands.userId, userId), ne(posts.status, "pending")))
    .orderBy(desc(posts.updatedAt))
    .limit(limit);

  return rows.map((row) => {
    const post = parsePost(row.post);
    let action: ActivityItem["action"] = "generated";

    if (post.status === "published") action = "published";
    else if (post.status === "approved") action = "scheduled";
    else if (post.status === "skipped") action = "skipped";
    else if (post.status === "failed") action = "failed";

    return {
      ...post,
      brandName: row.brandName,
      action,
    };
  });
}

function parseAgency(row: typeof agencies.$inferSelect): AgencyRecord {
  const status = row.status;
  return {
    id: row.id,
    ownerUserId: row.ownerUserId,
    name: row.name,
    contactEmail: row.contactEmail ?? null,
    referralCode: row.referralCode,
    status:
      status === "pending" || status === "suspended" ? status : "active",
    whiteLabelName: row.whiteLabelName ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function generateAgencyReferralCode(agencyName: string) {
  const slug =
    agencyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 24) || "partner";
  return `agency_${slug}_${randomBytes(3).toString("hex")}`;
}

export async function getAgencyByOwnerUserId(ownerUserId: string) {
  const db = await getDb();
  const row = await db.query.agencies.findFirst({
    where: eq(agencies.ownerUserId, ownerUserId),
  });
  return row ? parseAgency(row) : null;
}

export async function getAgencyByReferralCode(referralCode: string) {
  const db = await getDb();
  const row = await db.query.agencies.findFirst({
    where: eq(agencies.referralCode, referralCode),
  });
  return row ? parseAgency(row) : null;
}

export async function createAgency(input: {
  ownerUserId: string;
  name: string;
  contactEmail?: string | null;
}) {
  const existing = await getAgencyByOwnerUserId(input.ownerUserId);
  if (existing) {
    throw new Error("Agency already exists for this user");
  }

  const db = await getDb();
  const now = nowIso();
  const id = randomUUID();
  let referralCode = generateAgencyReferralCode(input.name);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await db.insert(agencies).values({
        id,
        ownerUserId: input.ownerUserId,
        name: input.name.trim(),
        contactEmail: input.contactEmail?.trim() || null,
        referralCode,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      break;
    } catch {
      if (attempt === 4) {
        throw new Error("Could not generate a unique referral code");
      }
      referralCode = generateAgencyReferralCode(input.name);
    }
  }

  await db
    .update(users)
    .set({ agencyId: id, updatedAt: now })
    .where(eq(users.id, input.ownerUserId));

  return (await getAgencyByOwnerUserId(input.ownerUserId))!;
}

export async function updateAgencyWhiteLabel(
  ownerUserId: string,
  whiteLabelName: string | null,
) {
  const agency = await getAgencyByOwnerUserId(ownerUserId);
  if (!agency) return null;

  const db = await getDb();
  const now = nowIso();
  await db
    .update(agencies)
    .set({
      whiteLabelName: whiteLabelName?.trim() || null,
      updatedAt: now,
    })
    .where(eq(agencies.id, agency.id));

  return (await getAgencyByOwnerUserId(ownerUserId))!;
}

export async function getAgencyReferrals(agencyId: string): Promise<AgencyReferralRow[]> {
  const db = await getDb();
  const rows = await db
    .select({
      id: affiliateReferrals.id,
      signupAt: affiliateReferrals.signupAt,
      convertedAt: affiliateReferrals.convertedAt,
      email: users.email,
      subscriptionTier: users.subscriptionTier,
    })
    .from(affiliateReferrals)
    .innerJoin(users, eq(users.id, affiliateReferrals.referredUserId))
    .where(eq(affiliateReferrals.agencyId, agencyId))
    .orderBy(desc(affiliateReferrals.signupAt));

  return rows.map((row) => {
    const tier = row.subscriptionTier;
    return {
      id: row.id,
      email: row.email ?? null,
      subscriptionTier: tier === "pro" || tier === "max" ? tier : "free",
      signupAt: row.signupAt,
      convertedAt: row.convertedAt ?? null,
    };
  });
}

export async function getAgencyDashboardStats(agencyId: string) {
  const referrals = await getAgencyReferrals(agencyId);
  return {
    totalReferred: referrals.length,
    activeSubscriptions: referrals.filter(
      (referral) => referral.subscriptionTier === "pro" || referral.subscriptionTier === "max",
    ).length,
  };
}

export async function applyAgencyReferral(userId: string, referralCode: string) {
  const agency = await getAgencyByReferralCode(referralCode);
  if (!agency || agency.status !== "active") {
    return false;
  }

  if (agency.ownerUserId === userId) {
    return false;
  }

  const user = await getOrCreateUser(userId);
  if (user.referredByAgencyId || user.agencyId) {
    return false;
  }

  const db = await getDb();
  const now = nowIso();

  await db
    .update(users)
    .set({ referredByAgencyId: agency.id, updatedAt: now })
    .where(eq(users.id, userId));

  const existingReferral = await db.query.affiliateReferrals.findFirst({
    where: eq(affiliateReferrals.referredUserId, userId),
  });

  if (!existingReferral) {
    await db.insert(affiliateReferrals).values({
      id: randomUUID(),
      agencyId: agency.id,
      referredUserId: userId,
      signupAt: now,
      createdAt: now,
    });
  }

  return true;
}

export async function markAffiliateReferralConverted(
  userId: string,
  subscriptionTier: UserRecord["subscriptionTier"],
) {
  if (subscriptionTier !== "pro" && subscriptionTier !== "max") {
    return;
  }

  const db = await getDb();
  const now = nowIso();
  await db
    .update(affiliateReferrals)
    .set({
      convertedAt: now,
      subscriptionTier,
    })
    .where(
      and(
        eq(affiliateReferrals.referredUserId, userId),
        sql`${affiliateReferrals.convertedAt} IS NULL`,
      ),
    );
}

export type ApiKeyRecord = {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

function parseApiKey(row: typeof apiKeys.$inferSelect): ApiKeyRecord {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    keyPrefix: row.keyPrefix,
    lastUsedAt: row.lastUsedAt,
    revokedAt: row.revokedAt,
    createdAt: row.createdAt,
  };
}

export async function listApiKeysForUser(userId: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), sql`${apiKeys.revokedAt} IS NULL`))
    .orderBy(desc(apiKeys.createdAt));
  return rows.map(parseApiKey);
}

export async function createApiKeyForUser(
  userId: string,
  name = "Cadence",
): Promise<{ key: ApiKeyRecord; rawKey: string }> {
  const db = await getDb();
  const { rawKey, keyPrefix, keyHash } = generateApiKey();
  const id = randomUUID();
  const now = nowIso();

  await db.insert(apiKeys).values({
    id,
    userId,
    name: name.trim() || "Cadence",
    keyPrefix,
    keyHash,
    createdAt: now,
  });

  return {
    key: {
      id,
      userId,
      name: name.trim() || "Cadence",
      keyPrefix,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: now,
    },
    rawKey,
  };
}

export async function revokeApiKeyForUser(keyId: string, userId: string) {
  const db = await getDb();
  const now = nowIso();
  const updated = await db
    .update(apiKeys)
    .set({ revokedAt: now })
    .where(
      and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.userId, userId),
        sql`${apiKeys.revokedAt} IS NULL`,
      ),
    )
    .returning({ id: apiKeys.id });
  return Boolean(updated[0]);
}

export async function authenticateWithApiKey(
  rawKey: string,
): Promise<{ userId: string; keyId: string } | null> {
  const db = await getDb();
  const keyHash = hashApiKey(rawKey);
  const row = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.keyHash, keyHash), sql`${apiKeys.revokedAt} IS NULL`),
  });
  if (!row) return null;

  const now = nowIso();
  await db
    .update(apiKeys)
    .set({ lastUsedAt: now })
    .where(eq(apiKeys.id, row.id));

  return { userId: row.userId, keyId: row.id };
}

export async function findBrandByWebsiteForUser(
  userId: string,
  websiteUrl: string,
) {
  const exact = await getBrandByWebsite(userId, websiteUrl);
  if (exact) return exact;

  const host = websiteHostname(websiteUrl).toLowerCase();
  const userBrands = await getBrandsByUserId(userId);
  return (
    userBrands.find((brand) => websiteHostname(brand.websiteUrl).toLowerCase() === host) ??
    null
  );
}

export async function getBlueskyOauthState(key: string) {
  const db = await getDb();
  const row = await db.query.blueskyOauthState.findFirst({
    where: eq(blueskyOauthState.key, key),
  });
  if (!row?.value) return undefined;
  return decryptOptional(row.value) ?? undefined;
}

export async function setBlueskyOauthState(key: string, value: string) {
  const db = await getDb();
  const encrypted = encryptOptional(value);
  if (!encrypted) throw new Error("Failed to encrypt Bluesky OAuth state");
  const now = nowIso();
  await db
    .insert(blueskyOauthState)
    .values({ key, value: encrypted, updatedAt: now })
    .onConflictDoUpdate({
      target: blueskyOauthState.key,
      set: { value: encrypted, updatedAt: now },
    });
}

export async function deleteBlueskyOauthState(key: string) {
  const db = await getDb();
  await db.delete(blueskyOauthState).where(eq(blueskyOauthState.key, key));
}

export async function getBlueskyOauthSession(key: string) {
  const db = await getDb();
  const row = await db.query.blueskyOauthSession.findFirst({
    where: eq(blueskyOauthSession.key, key),
  });
  if (!row?.value) return undefined;
  return decryptOptional(row.value) ?? undefined;
}

export async function setBlueskyOauthSession(key: string, value: string) {
  const db = await getDb();
  const encrypted = encryptOptional(value);
  if (!encrypted) throw new Error("Failed to encrypt Bluesky OAuth session");
  const now = nowIso();
  await db
    .insert(blueskyOauthSession)
    .values({ key, value: encrypted, updatedAt: now })
    .onConflictDoUpdate({
      target: blueskyOauthSession.key,
      set: { value: encrypted, updatedAt: now },
    });
}

export async function deleteBlueskyOauthSession(key: string) {
  const db = await getDb();
  await db.delete(blueskyOauthSession).where(eq(blueskyOauthSession.key, key));
}
