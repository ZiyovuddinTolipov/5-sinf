import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { LessonWithSubject } from "../types";

export function useLessons(subjectId?: string) {
  const [lessons, setLessons] = useState<LessonWithSubject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const q = subjectId ? `?subject_id=${encodeURIComponent(subjectId)}` : "";
      const data = await api.get<LessonWithSubject[]>(`/api/lessons${q}`);
      setLessons(data ?? []);
    } catch {
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [subjectId]);

  return { lessons, loading, refetch: fetch };
}
