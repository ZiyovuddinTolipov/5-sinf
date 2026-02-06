"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { lessonSchema } from "@/schemas/lesson";
import type { Lesson, LessonWithSubject } from "@/types";

type ActionResult =
  | { success: true }
  | { success?: never; error: Record<string, string[]> | string };

type CreateResult =
  | { success: true; data: Lesson }
  | { success?: never; error: Record<string, string[]> | string };

export async function getLessons(): Promise<LessonWithSubject[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*, subjects(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as LessonWithSubject[];
}

export async function createLesson(formData: {
  subject_id: string;
  title: string;
}): Promise<CreateResult> {
  const validated = lessonSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      subject_id: validated.data.subject_id,
      title: validated.data.title,
    })
    .select()
    .single();

  if (error) return { error: { title: [error.message] } };

  revalidatePath("/lessons");
  return { success: true, data };
}

export async function updateLesson(
  id: string,
  formData: { subject_id: string; title: string }
): Promise<ActionResult> {
  const validated = lessonSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("lessons")
    .update({
      subject_id: validated.data.subject_id,
      title: validated.data.title,
    })
    .eq("id", id);

  if (error) return { error: { title: [error.message] } };

  revalidatePath("/lessons");
  return { success: true };
}

export async function deleteLesson(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = createAdminClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("pdf_url")
    .eq("id", id)
    .single();

  if (lesson?.pdf_url) {
    const path = lesson.pdf_url.split("/lesson-pdfs/")[1];
    if (path) {
      await supabase.storage.from("lesson-pdfs").remove([path]);
    }
  }

  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/lessons");
  return { success: true };
}

export async function uploadPdf(
  lessonId: string,
  formData: FormData
): Promise<{ success: true; url: string; version: number } | { error: string }> {
  const file = formData.get("file") as File;
  if (!file) return { error: "Fayl tanlanmadi" };

  if (file.type !== "application/pdf") {
    return { error: "Faqat PDF fayllar qabul qilinadi" };
  }

  if (file.size > 52428800) {
    return { error: "Fayl hajmi 50MB dan oshmasligi kerak" };
  }

  const supabase = createAdminClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("pdf_url, version")
    .eq("id", lessonId)
    .single();

  if (lesson?.pdf_url) {
    const oldPath = lesson.pdf_url.split("/lesson-pdfs/")[1];
    if (oldPath) {
      await supabase.storage.from("lesson-pdfs").remove([oldPath]);
    }
  }

  const fileName = `${lessonId}/${Date.now()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("lesson-pdfs")
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("lesson-pdfs").getPublicUrl(fileName);

  const newVersion = (lesson?.version ?? 0) + 1;

  const { error: updateError } = await supabase
    .from("lessons")
    .update({ pdf_url: publicUrl, version: newVersion })
    .eq("id", lessonId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/lessons");
  return { success: true, url: publicUrl, version: newVersion };
}
