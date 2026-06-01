"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { lessons, subjects } from "@/db/schema";
import { lessonSchema } from "@/schemas/lesson";
import { requireAdmin } from "@/lib/admin";
import { deleteFileByPublicUrl, saveFile } from "@/lib/storage";
import type { Lesson, LessonWithSubject } from "@/types";

type ActionResult =
  | { success: true }
  | { success?: never; error: Record<string, string[]> | string };

type CreateResult =
  | { success: true; data: Lesson }
  | { success?: never; error: Record<string, string[]> | string };

export async function getLessons(): Promise<LessonWithSubject[]> {
  await requireAdmin();
  const rows = await db
    .select({
      id: lessons.id,
      subject_id: lessons.subject_id,
      title: lessons.title,
      pdf_url: lessons.pdf_url,
      version: lessons.version,
      created_at: lessons.created_at,
      subject_name: subjects.name,
    })
    .from(lessons)
    .leftJoin(subjects, eq(lessons.subject_id, subjects.id))
    .orderBy(desc(lessons.created_at));

  return rows.map((r) => ({
    id: r.id,
    subject_id: r.subject_id,
    title: r.title,
    pdf_url: r.pdf_url,
    version: r.version,
    created_at: r.created_at,
    subjects: r.subject_name ? { name: r.subject_name } : null,
  }));
}

export async function createLesson(formData: {
  subject_id: string;
  title: string;
}): Promise<CreateResult> {
  await requireAdmin();
  const validated = lessonSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    const [row] = await db
      .insert(lessons)
      .values({ subject_id: validated.data.subject_id, title: validated.data.title })
      .returning();
    revalidatePath("/lessons");
    return { success: true, data: row };
  } catch (err) {
    return { error: { title: [(err as Error).message] } };
  }
}

export async function updateLesson(
  id: string,
  formData: { subject_id: string; title: string },
): Promise<ActionResult> {
  await requireAdmin();
  const validated = lessonSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await db
      .update(lessons)
      .set({ subject_id: validated.data.subject_id, title: validated.data.title })
      .where(eq(lessons.id, id));
  } catch (err) {
    return { error: { title: [(err as Error).message] } };
  }

  revalidatePath("/lessons");
  return { success: true };
}

export async function deleteLesson(id: string): Promise<{ success: true } | { error: string }> {
  await requireAdmin();
  try {
    const [row] = await db
      .select({ pdf_url: lessons.pdf_url })
      .from(lessons)
      .where(eq(lessons.id, id))
      .limit(1);
    await deleteFileByPublicUrl(row?.pdf_url);
    await db.delete(lessons).where(eq(lessons.id, id));
  } catch (err) {
    return { error: (err as Error).message };
  }

  revalidatePath("/lessons");
  return { success: true };
}

export async function uploadPdf(
  lessonId: string,
  formData: FormData,
): Promise<{ success: true; url: string; version: number } | { error: string }> {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) return { error: "Fayl tanlanmadi" };
  if (file.type !== "application/pdf") return { error: "Faqat PDF fayllar qabul qilinadi" };
  if (file.size > 52428800) return { error: "Fayl hajmi 50MB dan oshmasligi kerak" };

  try {
    const [existing] = await db
      .select({ pdf_url: lessons.pdf_url, version: lessons.version })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    await deleteFileByPublicUrl(existing?.pdf_url);
    const url = await saveFile("lesson-pdfs", file, lessonId);
    const newVersion = (existing?.version ?? 0) + 1;

    await db
      .update(lessons)
      .set({ pdf_url: url, version: newVersion })
      .where(eq(lessons.id, lessonId));

    revalidatePath("/lessons");
    return { success: true, url, version: newVersion };
  } catch (err) {
    return { error: (err as Error).message };
  }
}
