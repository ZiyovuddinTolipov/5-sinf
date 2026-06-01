import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admin_users } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function isAdmin(userId: string) {
  const [row] = await db
    .select({ id: admin_users.id })
    .from(admin_users)
    .where(eq(admin_users.user_id, userId))
    .limit(1);
  return !!row;
}

export async function requireAdmin() {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHENTICATED");
  if (!(await isAdmin(u.id))) throw new Error("FORBIDDEN");
  return u;
}
