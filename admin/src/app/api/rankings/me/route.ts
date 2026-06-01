import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, rankings } from "@/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }

  const [row] = await db
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
    .where(eq(rankings.user_id, user.id))
    .limit(1);

  return NextResponse.json(row ?? null);
}
