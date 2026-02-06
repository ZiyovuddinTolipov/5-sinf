"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { testSchema, questionSchema, type TestFormValues, type QuestionFormValues } from "@/schemas/test";
import type { TestWithSubject, TestQuestionRow, TestOption } from "@/types";

type ActionResult =
  | { success: true }
  | { success?: never; error: Record<string, string[]> | string };

// =============================================
// Test CRUD (parent)
// =============================================

export async function getTests(): Promise<TestWithSubject[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tests")
    .select("*, subjects(name), test_questions(count)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as TestWithSubject[];
}

export async function getTestById(id: string): Promise<TestWithSubject | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tests")
    .select("*, subjects(name), test_questions(count)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as TestWithSubject;
}

export async function createTest(formData: TestFormValues): Promise<ActionResult> {
  const validated = testSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("tests").insert({
    name: validated.data.name,
    subject_id: validated.data.subject_id,
    start_time: validated.data.start_time,
    end_time: validated.data.end_time,
  });

  if (error) return { error: { name: [error.message] } };

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
      name: validated.data.name,
      subject_id: validated.data.subject_id,
      start_time: validated.data.start_time,
      end_time: validated.data.end_time,
    })
    .eq("id", id);

  if (error) return { error: { name: [error.message] } };

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

// =============================================
// Test Questions CRUD (children)
// =============================================

function formToOptions(data: QuestionFormValues): TestOption[] {
  return [
    { label: "A", text: data.option_a },
    { label: "B", text: data.option_b },
    { label: "C", text: data.option_c },
    { label: "D", text: data.option_d },
  ];
}

export async function getTestQuestions(testId: string): Promise<TestQuestionRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("test_questions")
    .select("*")
    .eq("test_id", testId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as TestQuestionRow[];
}

export async function createQuestion(testId: string, formData: QuestionFormValues): Promise<ActionResult> {
  const validated = questionSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = createAdminClient();

  // Get current max sort_order
  const { data: existing } = await supabase
    .from("test_questions")
    .select("sort_order")
    .eq("test_id", testId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { error } = await supabase.from("test_questions").insert({
    test_id: testId,
    question: validated.data.question,
    options: formToOptions(validated.data),
    correct_option: validated.data.correct_option,
    points: validated.data.points,
    sort_order: nextOrder,
  });

  if (error) return { error: { question: [error.message] } };

  revalidatePath(`/tests/${testId}`);
  revalidatePath("/tests");
  return { success: true };
}

export async function updateQuestion(id: string, testId: string, formData: QuestionFormValues): Promise<ActionResult> {
  const validated = questionSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("test_questions")
    .update({
      question: validated.data.question,
      options: formToOptions(validated.data),
      correct_option: validated.data.correct_option,
      points: validated.data.points,
    })
    .eq("id", id);

  if (error) return { error: { question: [error.message] } };

  revalidatePath(`/tests/${testId}`);
  return { success: true };
}

export async function deleteQuestion(id: string, testId: string): Promise<{ success: true } | { error: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("test_questions").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/tests/${testId}`);
  revalidatePath("/tests");
  return { success: true };
}
