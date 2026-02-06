"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { testSchema, type TestFormValues } from "@/schemas/test";
import type { TestWithSubject, TestOption } from "@/types";

type ActionResult =
  | { success: true }
  | { success?: never; error: Record<string, string[]> | string };

function formToOptions(data: TestFormValues): TestOption[] {
  return [
    { label: "A", text: data.option_a },
    { label: "B", text: data.option_b },
    { label: "C", text: data.option_c },
    { label: "D", text: data.option_d },
  ];
}

export async function getTests(): Promise<TestWithSubject[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tests")
    .select("*, subjects(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as TestWithSubject[];
}

export async function createTest(formData: TestFormValues): Promise<ActionResult> {
  const validated = testSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("tests").insert({
    subject_id: validated.data.subject_id,
    question: validated.data.question,
    options: formToOptions(validated.data),
    correct_option: validated.data.correct_option,
    points: validated.data.points,
    start_time: validated.data.start_time,
    end_time: validated.data.end_time,
  });

  if (error) return { error: { question: [error.message] } };

  revalidatePath("/tests");
  return { success: true };
}

export async function updateTest(id: string, formData: TestFormValues): Promise<ActionResult> {
  const validated = testSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tests")
    .update({
      subject_id: validated.data.subject_id,
      question: validated.data.question,
      options: formToOptions(validated.data),
      correct_option: validated.data.correct_option,
      points: validated.data.points,
      start_time: validated.data.start_time,
      end_time: validated.data.end_time,
    })
    .eq("id", id);

  if (error) return { error: { question: [error.message] } };

  revalidatePath("/tests");
  return { success: true };
}

export async function deleteTest(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("tests").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/tests");
  return { success: true };
}
