import { NextResponse, type NextRequest } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, rankings } from "@/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "50");

    const rows = await db
      .select({
        id: rankings.id,
        user_id: rankings.user_id,
        total_points: rankings.total_points,
        tests_taken: rankings.tests_taken,
        rank_position: rankings.rank_position,
        updated_at: rankings.updated_at,
        full_name: profiles.full_name,
        avatar_url: profiles.avatar_url,
      })
      .from(rankings)
      .leftJoin(profiles, eq(profiles.user_id, rankings.user_id))
      .orderBy(asc(rankings.rank_position))
      .limit(limit);

    return NextResponse.json(rows);
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
