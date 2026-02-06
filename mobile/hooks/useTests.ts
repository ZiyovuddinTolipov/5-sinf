import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { TestWithSubject, TestQuestion } from "../types";

export function useTests(subjectId?: string) {
  const [tests, setTests] = useState<TestWithSubject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    let query = supabase
      .from("tests")
      .select("*, subjects(name), test_questions(count)")
      .order("created_at", { ascending: false });

    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }

    const { data } = await query;
    setTests((data ?? []) as TestWithSubject[]);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [subjectId]);

  return { tests, loading, refetch: fetch };
}

export function useTestQuestions(testId: string) {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("test_questions")
      .select("*")
      .eq("test_id", testId)
      .order("sort_order")
      .order("created_at");

    setQuestions((data ?? []) as TestQuestion[]);
    setLoading(false);
  };

  useEffect(() => {
    if (testId) fetch();
  }, [testId]);

  return { questions, loading, refetch: fetch };
}
