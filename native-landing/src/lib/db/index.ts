import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  lte,
  ne,
  sql,
} from "drizzle-orm";
import { getNextScheduleSlot } from "@/lib/scheduling/slots";
import { getDb } from "./client";
import { brands, connections, posts, users } from "./schema";

export type BrandRecord = {
  id: string;
  userId: string;
  name: string;
  websiteUrl: string;
  description: string | null;
  crawlStatus: "pending" | "running" | "completed" | "failed";
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
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserRecord = {
  id: string;
  email: string | null;
  subscriptionTier: "free" | "pro" | "max";
  stripeCustomerId: string | null;
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
    accessToken: row.accessToken,
    isDemo: row.isDemo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function parseUser(row: typeof users.$inferSelect): UserRecord {
  const tier = row.subscriptionTier;
  return {
    id: row.id,
    email: row.email,
    subscriptionTier: tier === "pro" || tier === "max" ? tier : "free",
    stripeCustomerId: row.stripeCustomerId,
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
  const now = nowIso();
  await db.insert(brands).values({
    id: input.id,
    userId: input.userId,
    name: input.name,
    websiteUrl: input.websiteUrl,
    description: input.description ?? null,
    crawlStatus: "pending",
    postingFrequency: 3,
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
    .select({ post: posts })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(and(eq(brands.userId, userId), eq(posts.status, "pending")))
    .orderBy(desc(posts.createdAt));
  return rows.map((row) => parsePost(row.post));
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
  const existing = await getScheduledTimesForBrand(post.brandId);
  const scheduledAt = getNextScheduleSlot(existing);
  const now = nowIso();

  await db
    .update(posts)
    .set({ scheduledAt, updatedAt: now })
    .where(eq(posts.id, postId));

  const updated = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  return updated ? parsePost(updated) : null;
}

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
      sql`${posts.id} = ${postId} AND ${posts.brandId} IN (
        SELECT id FROM brands WHERE user_id = ${userId}
      )`,
    );
}

export async function markPostFailed(postId: string, userId: string, message: string) {
  const db = await getDb();
  const now = nowIso();
  await db
    .update(posts)
    .set({
      status: "failed",
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
  isDemo?: boolean;
}) {
  const db = await getDb();
  const now = nowIso();
  const platform = input.platform.toLowerCase();

  await db
    .insert(connections)
    .values({
      id: input.id,
      userId: input.userId,
      brandId: input.brandId,
      platform,
      accountName: input.accountName ?? null,
      accessToken: input.accessToken ?? null,
      isDemo: input.isDemo ?? false,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [connections.brandId, connections.platform],
      set: {
        accountName: input.accountName ?? null,
        accessToken: input.accessToken ?? null,
        isDemo: input.isDemo ?? false,
        updatedAt: now,
      },
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

  const weeklyRows = await db.execute(sql`
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

  const weeklyPublished = (
    weeklyRows.rows as Array<{ week_start: string; count: number }>
  ).map((row) => ({
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
