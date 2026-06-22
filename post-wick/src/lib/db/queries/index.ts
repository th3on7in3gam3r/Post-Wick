import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../client";
import { brands, posts, socialConnections, users } from "../schema";

export async function getUserById(userId: string) {
  const [user] = await getDb().select().from(users).where(eq(users.id, userId));
  return user ?? null;
}

export async function upsertUser(data: {
  id: string;
  email: string;
}) {
  const [user] = await getDb()
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.id,
      set: { email: data.email, updatedAt: new Date() },
    })
    .returning();
  return user;
}

export async function getBrandsByUserId(userId: string) {
  return getDb()
    .select()
    .from(brands)
    .where(eq(brands.userId, userId))
    .orderBy(desc(brands.createdAt));
}

export async function getBrandById(id: string, userId: string) {
  const [brand] = await getDb()
    .select()
    .from(brands)
    .where(and(eq(brands.id, id), eq(brands.userId, userId)));
  return brand ?? null;
}

export async function createBrand(data: {
  userId: string;
  name: string;
  websiteUrl: string;
  description?: string;
}) {
  const [brand] = await getDb().insert(brands).values(data).returning();
  return brand;
}

export async function updateBrand(
  id: string,
  userId: string,
  data: Partial<{
    name: string;
    websiteUrl: string;
    description: string;
    researchData: unknown;
    postingFrequency: number;
  }>,
) {
  const [brand] = await getDb()
    .update(brands)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(brands.id, id), eq(brands.userId, userId)))
    .returning();
  return brand ?? null;
}

export async function deleteBrand(id: string, userId: string) {
  const [brand] = await getDb()
    .delete(brands)
    .where(and(eq(brands.id, id), eq(brands.userId, userId)))
    .returning();
  return brand ?? null;
}

export async function getPostsByBrandId(brandId: string) {
  return getDb()
    .select()
    .from(posts)
    .where(eq(posts.brandId, brandId))
    .orderBy(desc(posts.createdAt));
}

export async function getPendingPostsByBrandId(brandId: string) {
  return getDb()
    .select()
    .from(posts)
    .where(and(eq(posts.brandId, brandId), eq(posts.status, "pending")))
    .orderBy(desc(posts.createdAt));
}

export async function getPostById(postId: string, brandId: string) {
  const [post] = await getDb()
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.brandId, brandId)));
  return post ?? null;
}

export async function updatePostStatus(
  postId: string,
  brandId: string,
  status: "pending" | "approved" | "skipped" | "published" | "failed",
) {
  const [post] = await getDb()
    .update(posts)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(posts.id, postId), eq(posts.brandId, brandId)))
    .returning();
  return post ?? null;
}

export async function getSocialConnectionsByBrandId(brandId: string) {
  return getDb()
    .select()
    .from(socialConnections)
    .where(eq(socialConnections.brandId, brandId));
}
