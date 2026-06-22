import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { getNextScheduleSlot } from "@/lib/scheduling/slots";

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

let db: Database.Database | null = null;

function ensureColumn(
  database: Database.Database,
  table: string,
  column: string,
  definition: string,
) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all() as Array<{
    name: string;
  }>;
  if (!columns.some((entry) => entry.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function applyMigrations(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      website_url TEXT NOT NULL,
      description TEXT,
      crawl_status TEXT NOT NULL DEFAULT 'pending',
      research_data TEXT,
      posting_frequency INTEGER NOT NULL DEFAULT 3,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      brand_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      brand_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      account_name TEXT,
      access_token TEXT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
      UNIQUE(brand_id, platform)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      subscription_tier TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  ensureColumn(database, "brands", "posting_frequency", "INTEGER NOT NULL DEFAULT 3");
  ensureColumn(database, "posts", "scheduled_at", "TEXT");
  ensureColumn(database, "posts", "published_at", "TEXT");
  ensureColumn(database, "posts", "external_post_id", "TEXT");
  ensureColumn(database, "posts", "publish_error", "TEXT");
  ensureColumn(database, "posts", "image_url", "TEXT");

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_brand_id ON posts(brand_id);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
  `);
}

function getDatabase() {
  if (!db) {
    const dir = join(process.cwd(), "data");
    mkdirSync(dir, { recursive: true });
    db = new Database(join(dir, "postwick.db"));
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }

  applyMigrations(db);
  return db;
}

function parseBrand(row: Record<string, unknown>): BrandRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    websiteUrl: String(row.website_url),
    description: row.description ? String(row.description) : null,
    crawlStatus: String(row.crawl_status) as BrandRecord["crawlStatus"],
    researchData: row.research_data ? String(row.research_data) : null,
    postingFrequency: Number(row.posting_frequency ?? 3),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function parsePost(row: Record<string, unknown>): PostRecord {
  return {
    id: String(row.id),
    brandId: String(row.brand_id),
    platform: String(row.platform),
    content: String(row.content),
    imageUrl: row.image_url ? String(row.image_url) : null,
    status: String(row.status) as PostRecord["status"],
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
    externalPostId: row.external_post_id ? String(row.external_post_id) : null,
    publishError: row.publish_error ? String(row.publish_error) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function parseConnection(row: Record<string, unknown>): ConnectionRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    brandId: String(row.brand_id),
    platform: String(row.platform),
    accountName: row.account_name ? String(row.account_name) : null,
    accessToken: row.access_token ? String(row.access_token) : null,
    isDemo: Number(row.is_demo) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function getBrandsByUserId(userId: string) {
  const rows = getDatabase()
    .prepare(
      `SELECT * FROM brands WHERE user_id = ? ORDER BY datetime(created_at) DESC`,
    )
    .all(userId) as Record<string, unknown>[];
  return rows.map(parseBrand);
}

export function getBrandById(id: string, userId: string) {
  const row = getDatabase()
    .prepare(`SELECT * FROM brands WHERE id = ? AND user_id = ?`)
    .get(id, userId) as Record<string, unknown> | undefined;
  return row ? parseBrand(row) : null;
}

export function getBrandByWebsite(userId: string, websiteUrl: string) {
  const row = getDatabase()
    .prepare(`SELECT * FROM brands WHERE user_id = ? AND website_url = ?`)
    .get(userId, websiteUrl) as Record<string, unknown> | undefined;
  return row ? parseBrand(row) : null;
}

export function createBrand(input: {
  id: string;
  userId: string;
  name: string;
  websiteUrl: string;
  description?: string;
}) {
  const now = new Date().toISOString();
  getDatabase()
    .prepare(
      `INSERT INTO brands (id, user_id, name, website_url, description, crawl_status, posting_frequency, created_at, updated_at)
       VALUES (@id, @userId, @name, @websiteUrl, @description, 'pending', 3, @now, @now)`,
    )
    .run({
      id: input.id,
      userId: input.userId,
      name: input.name,
      websiteUrl: input.websiteUrl,
      description: input.description ?? null,
      now,
    });

  return getBrandById(input.id, input.userId)!;
}

export function updateBrand(
  id: string,
  userId: string,
  data: Partial<{
    name: string;
    description: string;
    crawlStatus: BrandRecord["crawlStatus"];
    researchData: unknown;
  }>,
) {
  const existing = getBrandById(id, userId);
  if (!existing) return null;

  const now = new Date().toISOString();
  getDatabase()
    .prepare(
      `UPDATE brands SET
        name = @name,
        description = @description,
        crawl_status = @crawlStatus,
        research_data = @researchData,
        updated_at = @now
       WHERE id = @id AND user_id = @userId`,
    )
    .run({
      id,
      userId,
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      crawlStatus: data.crawlStatus ?? existing.crawlStatus,
      researchData:
        data.researchData !== undefined
          ? JSON.stringify(data.researchData)
          : existing.researchData,
      now,
    });

  return getBrandById(id, userId);
}

export function deleteBrand(id: string, userId: string) {
  const result = getDatabase()
    .prepare(`DELETE FROM brands WHERE id = ? AND user_id = ?`)
    .run(id, userId);
  return result.changes > 0;
}

export function getPostsByBrandId(brandId: string) {
  const rows = getDatabase()
    .prepare(
      `SELECT * FROM posts WHERE brand_id = ? ORDER BY datetime(created_at) DESC`,
    )
    .all(brandId) as Record<string, unknown>[];
  return rows.map(parsePost);
}

export function getPendingPostsByUserId(userId: string) {
  const rows = getDatabase()
    .prepare(
      `SELECT p.* FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE b.user_id = ? AND p.status = 'pending'
       ORDER BY datetime(p.created_at) DESC`,
    )
    .all(userId) as Record<string, unknown>[];
  return rows.map(parsePost);
}

export function getScheduledPostsByUserId(userId: string, limit = 8) {
  const rows = getDatabase()
    .prepare(
      `SELECT p.*, b.name as brand_name FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE b.user_id = ?
         AND p.status IN ('approved', 'published')
         AND p.scheduled_at IS NOT NULL
       ORDER BY datetime(p.scheduled_at) ASC
       LIMIT ?`,
    )
    .all(userId, limit) as Record<string, unknown>[];

  return rows.map((row) => ({
    ...parsePost(row),
    brandName: String(row.brand_name),
  })) as CalendarPost[];
}

export function getCalendarPostsByUserId(userId: string, from: string, to: string) {
  const rows = getDatabase()
    .prepare(
      `SELECT p.*, b.name as brand_name FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE b.user_id = ?
         AND p.scheduled_at IS NOT NULL
         AND datetime(p.scheduled_at) >= datetime(?)
         AND datetime(p.scheduled_at) <= datetime(?)
       ORDER BY datetime(p.scheduled_at) ASC`,
    )
    .all(userId, from, to) as Record<string, unknown>[];

  return rows.map((row) => ({
    ...parsePost(row),
    brandName: String(row.brand_name),
  })) as CalendarPost[];
}

export function getScheduledTimesForBrand(brandId: string) {
  const rows = getDatabase()
    .prepare(
      `SELECT scheduled_at FROM posts
       WHERE brand_id = ?
         AND scheduled_at IS NOT NULL
         AND status IN ('approved', 'published')`,
    )
    .all(brandId) as Array<{ scheduled_at: string }>;

  return rows.map((row) => row.scheduled_at);
}

export function createPosts(
  items: Array<{
    id: string;
    brandId: string;
    platform: string;
    content: string;
    imageUrl?: string | null;
  }>,
) {
  const now = new Date().toISOString();
  const insert = getDatabase().prepare(
    `INSERT INTO posts (id, brand_id, platform, content, image_url, status, created_at, updated_at)
     VALUES (@id, @brandId, @platform, @content, @imageUrl, 'pending', @now, @now)`,
  );

  const tx = getDatabase().transaction((rows: typeof items) => {
    for (const row of rows) {
      insert.run({ ...row, imageUrl: row.imageUrl ?? null, now });
    }
  });
  tx(items);
  return getPostsByBrandId(items[0]?.brandId ?? "");
}

export function updatePostStatus(
  postId: string,
  userId: string,
  status: PostRecord["status"],
) {
  const now = new Date().toISOString();
  const result = getDatabase()
    .prepare(
      `UPDATE posts SET status = @status, updated_at = @now
       WHERE id = @postId AND brand_id IN (SELECT id FROM brands WHERE user_id = @userId)`,
    )
    .run({ postId, userId, status, now });

  if (result.changes === 0) return null;

  const row = getDatabase()
    .prepare(`SELECT * FROM posts WHERE id = ?`)
    .get(postId) as Record<string, unknown>;
  return row ? parsePost(row) : null;
}

export function scheduleApprovedPost(postId: string, userId: string) {
  const row = getDatabase()
    .prepare(
      `SELECT p.* FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE p.id = ? AND b.user_id = ?`,
    )
    .get(postId, userId) as Record<string, unknown> | undefined;

  if (!row) return null;

  const post = parsePost(row);
  const existing = getScheduledTimesForBrand(post.brandId);
  const scheduledAt = getNextScheduleSlot(existing);
  const now = new Date().toISOString();

  getDatabase()
    .prepare(
      `UPDATE posts SET scheduled_at = @scheduledAt, updated_at = @now
       WHERE id = @postId`,
    )
    .run({ postId, scheduledAt, now });

  const updated = getDatabase()
    .prepare(`SELECT * FROM posts WHERE id = ?`)
    .get(postId) as Record<string, unknown>;
  return updated ? parsePost(updated) : null;
}

export function getDuePosts(userId: string) {
  const now = new Date().toISOString();
  const rows = getDatabase()
    .prepare(
      `SELECT p.* FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE b.user_id = ?
         AND p.status = 'approved'
         AND p.scheduled_at IS NOT NULL
         AND datetime(p.scheduled_at) <= datetime(?)`,
    )
    .all(userId, now) as Record<string, unknown>[];
  return rows.map(parsePost);
}

export function markPostPublished(postId: string, userId: string, externalPostId: string) {
  const now = new Date().toISOString();
  getDatabase()
    .prepare(
      `UPDATE posts SET
        status = 'published',
        published_at = @now,
        external_post_id = @externalPostId,
        publish_error = NULL,
        updated_at = @now
       WHERE id = @postId
         AND brand_id IN (SELECT id FROM brands WHERE user_id = @userId)`,
    )
    .run({ postId, userId, externalPostId, now });
}

export function markPostFailed(postId: string, userId: string, message: string) {
  const now = new Date().toISOString();
  getDatabase()
    .prepare(
      `UPDATE posts SET
        status = 'failed',
        publish_error = @message,
        updated_at = @now
       WHERE id = @postId
         AND brand_id IN (SELECT id FROM brands WHERE user_id = @userId)`,
    )
    .run({ postId, userId, message, now });
}

export function getConnectionsByUserId(userId: string) {
  const rows = getDatabase()
    .prepare(
      `SELECT * FROM connections WHERE user_id = ? ORDER BY datetime(created_at) DESC`,
    )
    .all(userId) as Record<string, unknown>[];
  return rows.map(parseConnection);
}

export function getConnectionForBrand(brandId: string, platform: string) {
  const row = getDatabase()
    .prepare(`SELECT * FROM connections WHERE brand_id = ? AND platform = ?`)
    .get(brandId, platform.toLowerCase()) as Record<string, unknown> | undefined;
  return row ? parseConnection(row) : null;
}

export function upsertConnection(input: {
  id: string;
  userId: string;
  brandId: string;
  platform: string;
  accountName?: string;
  accessToken?: string;
  isDemo?: boolean;
}) {
  const now = new Date().toISOString();
  getDatabase()
    .prepare(
      `INSERT INTO connections (id, user_id, brand_id, platform, account_name, access_token, is_demo, created_at, updated_at)
       VALUES (@id, @userId, @brandId, @platform, @accountName, @accessToken, @isDemo, @now, @now)
       ON CONFLICT(brand_id, platform) DO UPDATE SET
         account_name = excluded.account_name,
         access_token = excluded.access_token,
         is_demo = excluded.is_demo,
         updated_at = excluded.updated_at`,
    )
    .run({
      id: input.id,
      userId: input.userId,
      brandId: input.brandId,
      platform: input.platform.toLowerCase(),
      accountName: input.accountName ?? null,
      accessToken: input.accessToken ?? null,
      isDemo: input.isDemo ? 1 : 0,
      now,
    });

  return getConnectionForBrand(input.brandId, input.platform);
}

export function deleteConnection(connectionId: string, userId: string) {
  const result = getDatabase()
    .prepare(`DELETE FROM connections WHERE id = ? AND user_id = ?`)
    .run(connectionId, userId);
  return result.changes > 0;
}

export function userHasConnections(userId: string) {
  const row = getDatabase()
    .prepare(`SELECT COUNT(*) as count FROM connections WHERE user_id = ?`)
    .get(userId) as { count: number };
  return row.count > 0;
}

function parseUser(row: Record<string, unknown>): UserRecord {
  const tier = String(row.subscription_tier);
  return {
    id: String(row.id),
    email: row.email ? String(row.email) : null,
    subscriptionTier:
      tier === "pro" || tier === "max" ? tier : "free",
    stripeCustomerId: row.stripe_customer_id ? String(row.stripe_customer_id) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function getUserById(userId: string) {
  const row = getDatabase()
    .prepare(`SELECT * FROM users WHERE id = ?`)
    .get(userId) as Record<string, unknown> | undefined;
  return row ? parseUser(row) : null;
}

export function getOrCreateUser(userId: string, email?: string | null) {
  const existing = getUserById(userId);
  if (existing) {
    if (email && email !== existing.email) {
      const now = new Date().toISOString();
      getDatabase()
        .prepare(`UPDATE users SET email = @email, updated_at = @now WHERE id = @userId`)
        .run({ userId, email, now });
      return getUserById(userId)!;
    }
    return existing;
  }

  const now = new Date().toISOString();
  getDatabase()
    .prepare(
      `INSERT INTO users (id, email, subscription_tier, created_at, updated_at)
       VALUES (@userId, @email, 'free', @now, @now)`,
    )
    .run({ userId, email: email ?? null, now });

  return getUserById(userId)!;
}

export function updateUserSubscription(
  userId: string,
  data: {
    subscriptionTier: UserRecord["subscriptionTier"];
    stripeCustomerId?: string | null;
  },
) {
  const now = new Date().toISOString();
  const existing = getUserById(userId);
  getDatabase()
    .prepare(
      `INSERT INTO users (id, email, subscription_tier, stripe_customer_id, created_at, updated_at)
       VALUES (@userId, NULL, @subscriptionTier, @stripeCustomerId, @now, @now)
       ON CONFLICT(id) DO UPDATE SET
         subscription_tier = excluded.subscription_tier,
         stripe_customer_id = COALESCE(excluded.stripe_customer_id, users.stripe_customer_id),
         updated_at = excluded.updated_at`,
    )
    .run({
      userId,
      subscriptionTier: data.subscriptionTier,
      stripeCustomerId: data.stripeCustomerId ?? existing?.stripeCustomerId ?? null,
      now,
    });

  return getUserById(userId)!;
}

export function getDashboardStats(userId: string) {
  const scheduled = getDatabase()
    .prepare(
      `SELECT COUNT(*) as count FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE b.user_id = ? AND p.status = 'approved' AND p.scheduled_at IS NOT NULL`,
    )
    .get(userId) as { count: number };

  const pending = getDatabase()
    .prepare(
      `SELECT COUNT(*) as count FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE b.user_id = ? AND p.status = 'pending'`,
    )
    .get(userId) as { count: number };

  const brands = getDatabase()
    .prepare(`SELECT COUNT(*) as count FROM brands WHERE user_id = ?`)
    .get(userId) as { count: number };

  const published = getDatabase()
    .prepare(
      `SELECT COUNT(*) as count FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE b.user_id = ? AND p.status = 'published'`,
    )
    .get(userId) as { count: number };

  return {
    scheduled: scheduled.count,
    pending: pending.count,
    brands: brands.count,
    published: published.count,
  };
}

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

export function getAnalyticsSummary(userId: string): AnalyticsSummary {
  const db = getDatabase();

  const counts = db
    .prepare(
      `SELECT p.status, COUNT(*) as count FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE b.user_id = ?
       GROUP BY p.status`,
    )
    .all(userId) as Array<{ status: string; count: number }>;

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

  const publishedThisWeek = (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM posts p
         INNER JOIN brands b ON b.id = p.brand_id
         WHERE b.user_id = ? AND p.status = 'published'
           AND datetime(p.published_at) >= datetime('now', '-7 days')`,
      )
      .get(userId) as { count: number }
  ).count;

  const publishedThisMonth = (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM posts p
         INNER JOIN brands b ON b.id = p.brand_id
         WHERE b.user_id = ? AND p.status = 'published'
           AND datetime(p.published_at) >= datetime('now', '-30 days')`,
      )
      .get(userId) as { count: number }
  ).count;

  const platformRows = db
    .prepare(
      `SELECT p.platform, p.status, COUNT(*) as count FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE b.user_id = ?
       GROUP BY p.platform, p.status`,
    )
    .all(userId) as Array<{ platform: string; status: string; count: number }>;

  const platformMap = new Map<string, { total: number; published: number }>();
  for (const row of platformRows) {
    const current = platformMap.get(row.platform) ?? { total: 0, published: 0 };
    current.total += row.count;
    if (row.status === "published") {
      current.published += row.count;
    }
    platformMap.set(row.platform, current);
  }

  const weeklyRows = db
    .prepare(
      `SELECT strftime('%Y-%W', p.published_at) as week_key,
              MIN(date(p.published_at)) as week_start,
              COUNT(*) as count
       FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE b.user_id = ? AND p.status = 'published' AND p.published_at IS NOT NULL
         AND datetime(p.published_at) >= datetime('now', '-56 days')
       GROUP BY week_key
       ORDER BY week_key ASC`,
    )
    .all(userId) as Array<{ week_key: string; week_start: string; count: number }>;

  const weeklyPublished = weeklyRows.map((row) => ({
    label: new Date(`${row.week_start}T12:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    count: row.count,
  }));

  return {
    totalPosts: pending + scheduled + published + failed + skipped,
    pending,
    scheduled,
    published,
    failed,
    skipped,
    approvalRate,
    publishedThisWeek,
    publishedThisMonth,
    byPlatform: Array.from(platformMap.entries()).map(([platform, stats]) => ({
      platform,
      total: stats.total,
      published: stats.published,
    })),
    weeklyPublished,
  };
}

export function getPostHistory(
  userId: string,
  filter: "all" | "published" | "failed" = "all",
  limit = 50,
) {
  const statusClause =
    filter === "all"
      ? `p.status IN ('published', 'failed')`
      : `p.status = '${filter}'`;

  const rows = getDatabase()
    .prepare(
      `SELECT p.*, b.name as brand_name FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE b.user_id = ? AND ${statusClause}
       ORDER BY datetime(COALESCE(p.published_at, p.scheduled_at, p.updated_at)) DESC
       LIMIT ?`,
    )
    .all(userId, limit) as Record<string, unknown>[];

  return rows.map((row) => ({
    ...parsePost(row),
    brandName: String(row.brand_name),
  })) as CalendarPost[];
}

export function getRecentActivity(userId: string, limit = 12): ActivityItem[] {
  const rows = getDatabase()
    .prepare(
      `SELECT p.*, b.name as brand_name FROM posts p
       INNER JOIN brands b ON b.id = p.brand_id
       WHERE b.user_id = ? AND p.status != 'pending'
       ORDER BY datetime(p.updated_at) DESC
       LIMIT ?`,
    )
    .all(userId, limit) as Record<string, unknown>[];

  return rows.map((row) => {
    const post = parsePost(row);
    let action: ActivityItem["action"] = "generated";

    if (post.status === "published") action = "published";
    else if (post.status === "approved") action = "scheduled";
    else if (post.status === "skipped") action = "skipped";
    else if (post.status === "failed") action = "failed";

    return {
      ...post,
      brandName: String(row.brand_name),
      action,
    };
  });
}
