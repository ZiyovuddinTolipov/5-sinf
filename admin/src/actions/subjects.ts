"use server";

import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { subjectSchema } from "@/schemas/subject";
import { requireAdmin } from "@/lib/admin";
import type { Subject } from "@/types";

type ActionResult =
  | { success: true }
  | { success?: never; error: Record<string, string[]> | string };

export async function getSubjects(): Promise<Subject[]> {
  await requireAdmin();
  return await db.select().from(subjects).orderBy(asc(subjects.created_at));
}

export async function createSubject(formData: { name: string }): Promise<ActionResult> {
  await requireAdmin();
  const validated = subjectSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await db.insert(subjects).values({ name: validated.data.name });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "23505") {
      return { error: { name: ["Bu nomdagi fan allaqachon mavjud"] } };
    }
    return { error: { name: [(err as Error).message] } };
  }

  revalidatePath("/subjects");
  return { success: true };
}

export async function updateSubject(id: string, formData: { name: string }): Promise<ActionResult> {
  await requireAdmin();
  const validated = subjectSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await db.update(subjects).set({ name: validated.data.name }).where(eq(subjects.id, id));
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "23505") {
      return { error: { name: ["Bu nomdagi fan allaqachon mavjud"] } };
    }
    return { error: { name: [(err as Error).message] } };
  }

  revalidatePath("/subjects");
  return { success: true };
}

export async function deleteSubject(id: string): Promise<{ success: true } | { error: string }> {
  await requireAdmin();
  try {
    await db.delete(subjects).where(eq(subjects.id, id));
  } catch (err) {
    return { error: (err as Error).message };
  }
  revalidatePath("/subjects");
  return { success: true };
}
