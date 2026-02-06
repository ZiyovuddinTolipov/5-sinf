"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { RankingEntry } from "@/types";

export async function getRankings(): Promise<RankingEntry[]> {
  const supabase = createAdminClient();

  // Get rankings
  const { data: rankings, error } = await supabase
    .from("rankings")
    .select("*")
    .order("rank_position", { ascending: true })
    .limit(100);

  if (error) throw new Error(error.message);
  if (!rankings || rankings.length === 0) return [];

  // Get user details from auth.users via admin API
  const userIds = rankings.map((r) => r.user_id);
  const userDetails: Record<string, { email: string | null; name: string | null }> = {};

  for (const userId of userIds) {
    const { data } = await supabase.auth.admin.getUserById(userId);
    if (data?.user) {
      userDetails[userId] = {
        email: data.user.email ?? null,
        name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null,
      };
    }
  }

  return rankings.map((r) => ({
    ...r,
    user_email: userDetails[r.user_id]?.email ?? null,
    user_name: userDetails[r.user_id]?.name ?? null,
  }));
}
