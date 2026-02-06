import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { LessonWithSubject } from "../types";

export function useLessons(subjectId?: string) {
  const [lessons, setLessons] = useState<LessonWithSubject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    let query = supabase
      .from("lessons")
      .select("*, subjects(name)")
      .order("created_at", { ascending: false });

    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }

    const { data } = await query;
    setLessons((data ?? []) as LessonWithSubject[]);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [subjectId]);

  return { lessons, loading, refetch: fetch };
}
