import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { RankingEntry } from "../types";

export function useRankings(limit = 20) {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await api.get<RankingEntry[]>(`/api/rankings?limit=${limit}`);
      setRankings(data ?? []);
    } catch {
      setRankings([]);
    } finally {
      setLoading(false);
    }
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
    try {
      const data = await api.get<RankingEntry | null>("/api/rankings/me");
      setRanking(data);
    } catch {
      setRanking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [userId]);

  return { ranking, loading, refetch: fetch };
}
