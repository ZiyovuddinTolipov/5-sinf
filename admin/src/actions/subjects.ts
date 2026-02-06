"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { subjectSchema } from "@/schemas/subject";
import type { Subject } from "@/types";

type ActionResult =
  | { success: true }
  | { success?: never; error: Record<string, string[]> | string };

export async function getSubjects(): Promise<Subject[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createSubject(formData: { name: string }): Promise<ActionResult> {
  const validated = subjectSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("subjects")
    .insert({ name: validated.data.name });

  if (error) {
    if (error.code === "23505") {
      return { error: { name: ["Bu nomdagi fan allaqachon mavjud"] } };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/subjects");
  return { success: true };
}

export async function updateSubject(id: string, formData: { name: string }): Promise<ActionResult> {
  const validated = subjectSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("subjects")
    .update({ name: validated.data.name })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: { name: ["Bu nomdagi fan allaqachon mavjud"] } };
    }
    return { error: { name: [error.message] } };
  }

  revalidatePath("/subjects");
  return { success: true };
}

export async function deleteSubject(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("subjects").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/subjects");
  return { success: true };
}
