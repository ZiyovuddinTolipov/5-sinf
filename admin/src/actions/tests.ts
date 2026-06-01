"use server";

import { revalidatePath } from "next/cache";
import { asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { test_questions, tests, subjects } from "@/db/schema";
import {
  questionSchema,
  testSchema,
  type QuestionFormValues,
  type TestFormValues,
} from "@/schemas/test";
import { requireAdmin } from "@/lib/admin";
import type { TestQuestionRow, TestWithSubject, TestOption } from "@/types";

type ActionResult =
  | { success: true }
  | { success?: never; error: Record<string, string[]> | string };

async function selectTestsWithCounts(): Promise<TestWithSubject[]> {
  const rows = await db
    .select({
      id: tests.id,
      subject_id: tests.subject_id,
      name: tests.name,
      start_time: tests.start_time,
      end_time: tests.end_time,
      created_at: tests.created_at,
      subject_name: subjects.name,
    })
    .from(tests)
    .leftJoin(subjects, eq(tests.subject_id, subjects.id))
    .orderBy(desc(tests.created_at));

  const counts = await db
    .select({ test_id: test_questions.test_id, c: count(test_questions.id) })
    .from(test_questions)
    .groupBy(test_questions.test_id);
  const countMap = new Map(counts.map((r) => [r.test_id, r.c]));

  return rows.map((r) => ({
    id: r.id,
    subject_id: r.subject_id,
    name: r.name,
    start_time: r.start_time,
    end_time: r.end_time,
    created_at: r.created_at,
    subjects: r.subject_name ? { name: r.subject_name } : null,
    test_questions: [{ count: countMap.get(r.id) ?? 0 }],
  }));
}

export async function getTests(): Promise<TestWithSubject[]> {
  await requireAdmin();
  return selectTestsWithCounts();
}

export async function getTestById(id: string): Promise<TestWithSubject | null> {
  await requireAdmin();
  const [r] = await db
    .select({
      id: tests.id,
      subject_id: tests.subject_id,
      name: tests.name,
      start_time: tests.start_time,
      end_time: tests.end_time,
      created_at: tests.created_at,
      subject_name: subjects.name,
    })
    .from(tests)
    .leftJoin(subjects, eq(tests.subject_id, subjects.id))
    .where(eq(tests.id, id))
    .limit(1);

  if (!r) return null;

  const [{ c }] = await db
    .select({ c: count(test_questions.id) })
    .from(test_questions)
    .where(eq(test_questions.test_id, id));

  return {
    id: r.id,
    subject_id: r.subject_id,
    name: r.name,
    start_time: r.start_time,
    end_time: r.end_time,
    created_at: r.created_at,
    subjects: r.subject_name ? { name: r.subject_name } : null,
    test_questions: [{ count: c }],
  };
}

export async function createTest(formData: TestFormValues): Promise<ActionResult> {
  await requireAdmin();
  const validated = testSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await db.insert(tests).values({
      name: validated.data.name,
      subject_id: validated.data.subject_id,
      start_time: validated.data.start_time,
      end_time: validated.data.end_time,
    });
  } catch (err) {
    return { error: { name: [(err as Error).message] } };
  }

  revalidatePath("/tests");
  return { success: true };
}

export async function updateTest(id: string, formData: TestFormValues): Promise<ActionResult> {
  await requireAdmin();
  const validated = testSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await db
      .update(tests)
      .set({
        name: validated.data.name,
        subject_id: validated.data.subject_id,
        start_time: validated.data.start_time,
        end_time: validated.data.end_time,
      })
      .where(eq(tests.id, id));
  } catch (err) {
    return { error: { name: [(err as Error).message] } };
  }

  revalidatePath("/tests");
  return { success: true };
}

export async function deleteTest(id: string): Promise<{ success: true } | { error: string }> {
  await requireAdmin();
  try {
    await db.delete(tests).where(eq(tests.id, id));
  } catch (err) {
    return { error: (err as Error).message };
  }
  revalidatePath("/tests");
  return { success: true };
}

function formToOptions(d: QuestionFormValues): TestOption[] {
  return [
    { label: "A", text: d.option_a },
    { label: "B", text: d.option_b },
    { label: "C", text: d.option_c },
    { label: "D", text: d.option_d },
  ];
}

export async function getTestQuestions(testId: string): Promise<TestQuestionRow[]> {
  await requireAdmin();
  const rows = await db
    .select()
    .from(test_questions)
    .where(eq(test_questions.test_id, testId))
    .orderBy(asc(test_questions.sort_order), asc(test_questions.created_at));
  return rows as TestQuestionRow[];
}

export async function createQuestion(testId: string, formData: QuestionFormValues): Promise<ActionResult> {
  await requireAdmin();
  const validated = questionSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    const [{ maxOrder }] = await db
      .select({ maxOrder: count(test_questions.id) })
      .from(test_questions)
      .where(eq(test_questions.test_id, testId));

    await db.insert(test_questions).values({
      test_id: testId,
      question: validated.data.question,
      options: formToOptions(validated.data),
      correct_option: validated.data.correct_option,
      points: validated.data.points,
      sort_order: maxOrder,
    });
  } catch (err) {
    return { error: { question: [(err as Error).message] } };
  }

  revalidatePath(`/tests/${testId}`);
  revalidatePath("/tests");
  return { success: true };
}

export async function updateQuestion(
  id: string,
  testId: string,
  formData: QuestionFormValues,
): Promise<ActionResult> {
  await requireAdmin();
  const validated = questionSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    await db
      .update(test_questions)
      .set({
        question: validated.data.question,
        options: formToOptions(validated.data),
        correct_option: validated.data.correct_option,
        points: validated.data.points,
      })
      .where(eq(test_questions.id, id));
  } catch (err) {
    return { error: { question: [(err as Error).message] } };
  }

  revalidatePath(`/tests/${testId}`);
  return { success: true };
}

export async function deleteQuestion(
  id: string,
  testId: string,
): Promise<{ success: true } | { error: string }> {
  await requireAdmin();
  try {
    await db.delete(test_questions).where(eq(test_questions.id, id));
  } catch (err) {
    return { error: (err as Error).message };
  }
  revalidatePath(`/tests/${testId}`);
  revalidatePath("/tests");
  return { success: true };
}
