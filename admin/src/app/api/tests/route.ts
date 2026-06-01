import { NextResponse, type NextRequest } from "next/server";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { subjects, test_questions, tests } from "@/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const subjectId = req.nextUrl.searchParams.get("subject_id");

    const base = db
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
      .leftJoin(subjects, eq(tests.subject_id, subjects.id));

    const rows = subjectId
      ? await base.where(eq(tests.subject_id, subjectId)).orderBy(desc(tests.created_at))
      : await base.orderBy(desc(tests.created_at));

    const counts = await db
      .select({ test_id: test_questions.test_id, c: count(test_questions.id) })
      .from(test_questions)
      .groupBy(test_questions.test_id);
    const countMap = new Map(counts.map((r) => [r.test_id, r.c]));

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        subject_id: r.subject_id,
        name: r.name,
        start_time: r.start_time,
        end_time: r.end_time,
        created_at: r.created_at,
        subjects: r.subject_name ? { name: r.subject_name } : null,
        test_questions: [{ count: countMap.get(r.id) ?? 0 }],
      })),
    );
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
