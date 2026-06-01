import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Subject } from "../types";

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await api.get<Subject[]>("/api/subjects");
      setSubjects(data ?? []);
    } catch {
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { subjects, loading, refetch: fetch };
}
