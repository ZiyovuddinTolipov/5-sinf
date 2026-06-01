"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { admin_users } from "@/db/schema";

export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    if (!result?.user) return { error: "Email yoki parol noto'g'ri" };

    const [adminRow] = await db
      .select({ id: admin_users.id })
      .from(admin_users)
      .where(eq(admin_users.user_id, result.user.id))
      .limit(1);

    if (!adminRow) {
      await auth.api.signOut({ headers: await headers() });
      return { error: "Sizda admin huquqi yo'q" };
    }
  } catch (err) {
    return { error: "Email yoki parol noto'g'ri" };
  }

  redirect("/dashboard");
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function isAdmin() {
  const u = await getCurrentUser();
  if (!u) return false;
  const [row] = await db
    .select({ id: admin_users.id })
    .from(admin_users)
    .where(eq(admin_users.user_id, u.id))
    .limit(1);
  return !!row;
}
