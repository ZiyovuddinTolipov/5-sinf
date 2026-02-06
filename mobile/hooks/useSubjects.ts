import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Subject } from "../types";

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .order("name");
    setSubjects((data ?? []) as Subject[]);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  return { subjects, loading, refetch: fetch };
}
