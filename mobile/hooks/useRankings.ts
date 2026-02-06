import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { RankingWithProfile } from "../types";

export function useRankings(limit = 20) {
  const [rankings, setRankings] = useState<RankingWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("rankings")
      .select("*, profiles(full_name, avatar_url)")
      .order("rank_position", { ascending: true })
      .limit(limit);

    setRankings((data ?? []) as RankingWithProfile[]);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [limit]);

  return { rankings, loading, refetch: fetch };
}

export function useMyRanking(userId: string | undefined) {
  const [ranking, setRanking] = useState<RankingWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("rankings")
      .select("*, profiles(full_name, avatar_url)")
      .eq("user_id", userId)
      .single();

    setRanking(data as RankingWithProfile | null);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [userId]);

  return { ranking, loading, refetch: fetch };
}
