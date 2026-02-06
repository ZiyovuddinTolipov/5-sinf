import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { RankingEntry } from "../types";

export function useRankings(limit = 20) {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_rankings_with_profiles", {
      p_limit: limit,
    });

    if (error) {
      console.error("Rankings fetch error:", error.message);
    }
    setRankings((data ?? []) as RankingEntry[]);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [limit]);

  return { rankings, loading, refetch: fetch };
}

export function useMyRanking(userId: string | undefined) {
  const [ranking, setRanking] = useState<RankingEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc("get_my_ranking", {
      p_user_id: userId,
    });

    if (error) {
      console.error("My ranking fetch error:", error.message);
    }
    const rows = data as RankingEntry[] | null;
    setRanking(rows && rows.length > 0 ? rows[0] : null);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [userId]);

  return { ranking, loading, refetch: fetch };
}
