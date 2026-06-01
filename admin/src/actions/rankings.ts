"use server";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, rankings, user as userTable } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import type { RankingEntry } from "@/types";

export async function getRankings(): Promise<RankingEntry[]> {
  await requireAdmin();

  const rows = await db
    .select({
      id: rankings.id,
      user_id: rankings.user_id,
      total_points: rankings.total_points,
      tests_taken: rankings.tests_taken,
      rank_position: rankings.rank_position,
      updated_at: rankings.updated_at,
      user_email: userTable.email,
      user_name: profiles.full_name,
    })
    .from(rankings)
    .leftJoin(userTable, eq(rankings.user_id, userTable.id))
    .leftJoin(profiles, eq(profiles.user_id, rankings.user_id))
    .orderBy(asc(rankings.rank_position))
    .limit(100);

  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    total_points: r.total_points,
    tests_taken: r.tests_taken,
    rank_position: r.rank_position,
    updated_at: r.updated_at,
    user_email: r.user_email ?? null,
    user_name: r.user_name ?? null,
  }));
}
