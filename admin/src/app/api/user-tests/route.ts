import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { rankings, user_tests } from "@/db/schema";
import { requireUser } from "@/lib/api-auth";

interface AnswerInput {
  question_id: string;
  selected_option: "A" | "B" | "C" | "D";
  points_earned: number;
}

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }

  const body = (await req.json()) as { answers: AnswerInput[] };
  if (!Array.isArray(body.answers) || body.answers.length === 0) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(user_tests).values(
        body.answers.map((a) => ({
          user_id: user.id,
          question_id: a.question_id,
          selected_option: a.selected_option,
          points_earned: a.points_earned,
        })),
      );

      // Recompute user's totals
      const [agg] = await tx
        .select({
          total: sql<number>`COALESCE(SUM(${user_tests.points_earned}),0)::int`,
          taken: sql<number>`COUNT(${user_tests.id})::int`,
        })
        .from(user_tests)
        .where(eq(user_tests.user_id, user.id));

      await tx
        .insert(rankings)
        .values({
          user_id: user.id,
          total_points: agg.total,
          tests_taken: agg.taken,
          updated_at: sql`now()`,
        })
        .onConflictDoUpdate({
          target: rankings.user_id,
          set: {
            total_points: agg.total,
            tests_taken: agg.taken,
            updated_at: sql`now()`,
          },
        });

      // Recompute all rank positions
      await tx.execute(sql`
        WITH ranked AS (
          SELECT id,
                 ROW_NUMBER() OVER (ORDER BY total_points DESC, tests_taken DESC) AS new_rank
          FROM rankings
        )
        UPDATE rankings r SET rank_position = ranked.new_rank
        FROM ranked WHERE r.id = ranked.id
      `);
    });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes("duplicate key") || msg.includes("unique")) {
      return NextResponse.json({ error: "duplicate" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
