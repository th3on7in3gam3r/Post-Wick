import { getBrandsByUserId } from "@/lib/db";
import { brandToClient, type Client } from "@/lib/clients";

export async function getClientsForUser(userId: string): Promise<Client[]> {
  const brands = await getBrandsByUserId(userId);
  return brands.map(brandToClient);
}
