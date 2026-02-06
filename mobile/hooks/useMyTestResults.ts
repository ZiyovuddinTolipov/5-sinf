import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
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
    const { data } = await supabase.rpc("get_user_test_results", {
      p_user_id: userId,
      p_limit: limit,
    });

    setResults((data ?? []) as TestResult[]);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [userId, limit]);

  return { results, loading, refetch: fetch };
}
