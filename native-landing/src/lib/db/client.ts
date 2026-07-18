import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { encrypt, isEncrypted } from "@/lib/crypto";
import * as schema from "./schema";

let db: NeonHttpDatabase<typeof schema> | null = null;
let schemaReady: Promise<void> | null = null;
let tokenMigrationReady: Promise<void> | null = null;

type MetaOauthPendingPageRow = {
  id: string;
  name: string;
  accessToken: string;
  pictureUrl: string | null;
};

async function migratePlaintextTokens(databaseUrl: string) {
  if (!process.env.ENCRYPTION_KEY?.trim()) {
    return;
  }

  const sql = neon(databaseUrl);
  const connectionRows = (await sql`
    SELECT id, access_token
    FROM connections
    WHERE access_token IS NOT NULL
  `) as Array<{ id: string; access_token: string | null }>;

  for (const row of connectionRows) {
    const token = row.access_token;
    if (typeof token !== "string" || isEncrypted(token)) {
      continue;
    }

    await sql`
      UPDATE connections
      SET access_token = ${encrypt(token)}
      WHERE id = ${row.id}
    `;
  }

  const pendingRows = (await sql`
    SELECT id, pages_data
    FROM meta_oauth_pending
  `) as Array<{ id: string; pages_data: string }>;

  for (const row of pendingRows) {
    const raw = row.pages_data;
    if (typeof raw !== "string") {
      continue;
    }

    let pages: MetaOauthPendingPageRow[];
    try {
      pages = JSON.parse(raw) as MetaOauthPendingPageRow[];
    } catch {
      continue;
    }

    let changed = false;
    const encryptedPages = pages.map((page) => {
      if (!page.accessToken || isEncrypted(page.accessToken)) {
        return page;
      }
      changed = true;
      return {
        ...page,
        accessToken: encrypt(page.accessToken),
      };
    });

    if (!changed) {
      continue;
    }

    await sql`
      UPDATE meta_oauth_pending
      SET pages_data = ${JSON.stringify(encryptedPages)}
      WHERE id = ${row.id}
    `;
  }
}

async function ensureSchema() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(process.env.DATABASE_URL);
  await sql`
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      website_url TEXT NOT NULL,
      description TEXT,
      crawl_status TEXT NOT NULL DEFAULT 'pending',
      research_data TEXT,
      posting_frequency INTEGER NOT NULL DEFAULT 3,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      scheduled_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ,
      external_post_id TEXT,
      publish_error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      account_name TEXT,
      access_token TEXT,
      metadata TEXT,
      is_demo BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (brand_id, platform)
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      subscription_tier TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT,
      timezone TEXT NOT NULL DEFAULT 'America/New_York',
      default_posting_frequency INTEGER NOT NULL DEFAULT 3,
      notify_queue BOOLEAN NOT NULL DEFAULT TRUE,
      notify_publish BOOLEAN NOT NULL DEFAULT TRUE,
      notify_weekly_digest BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/New_York'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS default_posting_frequency INTEGER NOT NULL DEFAULT 3`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_queue BOOLEAN NOT NULL DEFAULT TRUE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_publish BOOLEAN NOT NULL DEFAULT TRUE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_weekly_digest BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS demo_mode_enabled BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_source TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_detail TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS refine_usage_count INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS refine_usage_period TEXT`;
  await sql`ALTER TABLE connections ADD COLUMN IF NOT EXISTS metadata TEXT`;
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS public_slug TEXT`;
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS public_niche TEXT`;
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS public_city TEXT`;
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS postwick_auto_share BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_id TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_agency_id TEXT`;
  await sql`
    CREATE TABLE IF NOT EXISTS agencies (
      id TEXT PRIMARY KEY,
      owner_user_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      contact_email TEXT,
      referral_code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active',
      white_label_name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS affiliate_referrals (
      id TEXT PRIMARY KEY,
      agency_id TEXT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
      referred_user_id TEXT NOT NULL UNIQUE,
      signup_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      converted_at TIMESTAMPTZ,
      subscription_tier TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS brands_public_slug_idx ON brands(public_slug) WHERE public_slug IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_brands_is_public ON brands(is_public)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_brand_id ON posts(brand_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_is_public_published_at ON posts(is_public, published_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS meta_oauth_pending (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      pages_data TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, brand_id, platform)
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT 'Cadence',
      key_prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      last_used_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS bluesky_oauth_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS bluesky_oauth_session (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS postwick_claim_codes (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      brand_id TEXT REFERENCES brands(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_postwick_claim_codes_user_id ON postwick_claim_codes(user_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS postwick_accounts (
      id TEXT PRIMARY KEY,
      clerk_user_id TEXT NOT NULL UNIQUE,
      kerygma_user_id TEXT NOT NULL UNIQUE,
      username TEXT UNIQUE,
      brand_ids TEXT NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS postwick_page_views (
      id TEXT PRIMARY KEY,
      brand_id TEXT NOT NULL,
      post_id TEXT,
      path TEXT NOT NULL,
      viewed_on DATE NOT NULL,
      count INTEGER NOT NULL DEFAULT 1
    )`;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS postwick_page_views_day_idx
    ON postwick_page_views (
      brand_id,
      COALESCE(post_id, ''),
      path,
      viewed_on
    )`;
}

async function ensureTokenMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!tokenMigrationReady) {
    tokenMigrationReady = migratePlaintextTokens(process.env.DATABASE_URL!);
  }

  await tokenMigrationReady;
}

export async function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!schemaReady) {
    schemaReady = ensureSchema();
  }
  await schemaReady;
  await ensureTokenMigration();

  if (!db) {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
  }

  return db;
}
