import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { test_questions } from "@/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    const { id } = await ctx.params;
    const rows = await db
      .select()
      .from(test_questions)
      .where(eq(test_questions.test_id, id))
      .orderBy(asc(test_questions.sort_order), asc(test_questions.created_at));
    return NextResponse.json(rows);
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
