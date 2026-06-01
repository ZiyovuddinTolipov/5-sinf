"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, isNull, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { admin_users, profiles, session, user as userTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import {
  studentSchema,
  studentUpdateSchema,
  type StudentFormValues,
  type StudentUpdateValues,
} from "@/schemas/student";
import type { Student } from "@/types";

type ActionResult =
  | { success: true }
  | { success?: never; error: Record<string, string[]> | string };

export async function getStudents(): Promise<Student[]> {
  await requireAdmin();

  const adminIds = (await db.select({ user_id: admin_users.user_id }).from(admin_users)).map(
    (r) => r.user_id,
  );

  const rows = await db
    .select({
      id: userTable.id,
      email: userTable.email,
      created_at: userTable.createdAt,
      full_name: profiles.full_name,
      avatar_url: profiles.avatar_url,
      banned_until: profiles.banned_until,
      last_sign_in_at: sql<string | null>`MAX(${session.createdAt})`.as("last_sign_in_at"),
    })
    .from(userTable)
    .leftJoin(profiles, eq(profiles.user_id, userTable.id))
    .leftJoin(session, eq(session.userId, userTable.id))
    .where(adminIds.length ? notInArray(userTable.id, adminIds) : isNull(userTable.id))
    .groupBy(userTable.id, profiles.full_name, profiles.avatar_url, profiles.banned_until)
    .orderBy(desc(userTable.createdAt));

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    full_name: r.full_name,
    avatar_url: r.avatar_url,
    banned_until: r.banned_until,
    created_at: typeof r.created_at === "string" ? r.created_at : r.created_at.toISOString(),
    last_sign_in_at: r.last_sign_in_at ?? null,
  }));
}

export async function createStudent(formData: StudentFormValues): Promise<ActionResult> {
  await requireAdmin();
  const validated = studentSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  let userId: string;
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: validated.data.email,
        password: validated.data.password,
        name: validated.data.full_name,
      },
    });
    userId = res.user.id;
  } catch (err) {
    return { error: { email: [(err as Error).message] } };
  }

  await db
    .insert(profiles)
    .values({ user_id: userId, full_name: validated.data.full_name })
    .onConflictDoUpdate({
      target: profiles.user_id,
      set: { full_name: validated.data.full_name, updated_at: sql`now()` },
    });

  revalidatePath("/students");
  return { success: true };
}

export async function updateStudent(id: string, formData: StudentUpdateValues): Promise<ActionResult> {
  await requireAdmin();
  const validated = studentUpdateSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await db
      .insert(profiles)
      .values({ user_id: id, full_name: validated.data.full_name })
      .onConflictDoUpdate({
        target: profiles.user_id,
        set: { full_name: validated.data.full_name, updated_at: sql`now()` },
      });
  } catch (err) {
    return { error: { full_name: [(err as Error).message] } };
  }

  revalidatePath("/students");
  return { success: true };
}

export async function banStudent(id: string): Promise<{ success: true } | { error: string }> {
  await requireAdmin();
  try {
    const farFuture = new Date("2099-12-31T23:59:59Z").toISOString();
    await db
      .insert(profiles)
      .values({ user_id: id, banned_until: farFuture })
      .onConflictDoUpdate({
        target: profiles.user_id,
        set: { banned_until: farFuture, updated_at: sql`now()` },
      });
    await db.delete(session).where(eq(session.userId, id));
  } catch (err) {
    return { error: (err as Error).message };
  }
  revalidatePath("/students");
  return { success: true };
}

export async function unbanStudent(id: string): Promise<{ success: true } | { error: string }> {
  await requireAdmin();
  try {
    await db
      .update(profiles)
      .set({ banned_until: null, updated_at: sql`now()` })
      .where(eq(profiles.user_id, id));
  } catch (err) {
    return { error: (err as Error).message };
  }
  revalidatePath("/students");
  return { success: true };
}

export async function deleteStudent(id: string): Promise<{ success: true } | { error: string }> {
  await requireAdmin();
  try {
    await db.delete(userTable).where(eq(userTable.id, id));
  } catch (err) {
    return { error: (err as Error).message };
  }
  revalidatePath("/students");
  return { success: true };
}
