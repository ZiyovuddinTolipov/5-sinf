import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { TestResult } from "../types";

export function useMyTestResults(userId: string | undefined, limit = 5) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.get<TestResult[]>(`/api/me/test-results?limit=${limit}`);
      setResults(data ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [userId, limit]);

  return { results, loading, refetch: fetch };
}
