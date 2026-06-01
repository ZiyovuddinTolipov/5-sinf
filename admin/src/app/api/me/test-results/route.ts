import { NextResponse, type NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { requireUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "5");

  const result = await db.execute<{
    test_id: string;
    test_name: string;
    subject_name: string;
    total_points: number;
    earned_points: number;
    total_questions: number;
    correct_answers: number;
    completed_at: string;
  }>(sql`
    SELECT
      t.id AS test_id,
      t.name AS test_name,
      s.name AS subject_name,
      COALESCE(SUM(tq.points), 0)::INT AS total_points,
      COALESCE(SUM(ut.points_earned), 0)::INT AS earned_points,
      COUNT(DISTINCT tq.id)::INT AS total_questions,
      COUNT(DISTINCT CASE WHEN ut.points_earned > 0 THEN tq.id END)::INT AS correct_answers,
      MAX(ut.created_at) AS completed_at
    FROM tests t
    INNER JOIN subjects s ON s.id = t.subject_id
    INNER JOIN test_questions tq ON tq.test_id = t.id
    INNER JOIN user_tests ut ON ut.question_id = tq.id AND ut.user_id = ${user.id}
    GROUP BY t.id, t.name, s.name
    ORDER BY MAX(ut.created_at) DESC
    LIMIT ${limit}
  `);

  return NextResponse.json(result.rows);
}
