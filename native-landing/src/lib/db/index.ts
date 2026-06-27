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
import { brands, connections, metaOauthPending, posts, users } from "./schema";

export type BrandRecord = {
  id: string;
  userId: string;
  name: string;
  websiteUrl: string;
  description: string | null;
  crawlStatus: "pending" | "running" | "review" | "completed" | "failed";
  researchData: string | null;
  postingFrequency: number;
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
    refineUsageCount: row.refineUsageCount ?? 0,
    refineUsagePeriod: row.refineUsagePeriod ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function nowIso() {
  return new Date().toISOString();
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
  return (await getBrandById(input.id, input.userId))!;
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
      const used = await countBrandAutopilotPostsInWeek(
        post.brandId,
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
  const used = await countBrandAutopilotPostsInWeek(
    post.brandId,
    start.toISOString(),
    end.toISOString(),
    postId,
  );
  if (used >= postsPerWeek) {
    throw new WeeklyScheduleLimitError(
      "That week is full on your current plan. Pick another date or upgrade for more posts per week.",
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
        eq(posts.status, "approved"),
        sql`${posts.brandId} IN (
          SELECT id FROM brands WHERE user_id = ${userId}
        )`,
      ),
    );
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
    .insert(metaOauthPending)
    .values({
      id: input.id,
      userId: input.userId,
      brandId: input.brandId,
      platform: input.platform,
      pagesData: JSON.stringify(encryptedPages),
      expiresAt: input.expiresAt,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: [
        metaOauthPending.userId,
        metaOauthPending.brandId,
        metaOauthPending.platform,
      ],
      set: {
        id: input.id,
        pagesData: JSON.stringify(encryptedPages),
        expiresAt: input.expiresAt,
        createdAt: now,
      },
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
  if (pending.expiresAt <= nowIso()) {
    await db.delete(metaOauthPending).where(eq(metaOauthPending.id, id));
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

  return (await getUserById(userId))!;
}

export async function updateUserSettings(
  userId: string,
  data: Partial<{
    timezone: string;
    defaultPostingFrequency: number;
    notifyQueue: boolean;
    notifyPublish: boolean;
    notifyWeeklyDigest: boolean;
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
