import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { TestQuestion, TestWithSubject } from "../types";

export function useTests(subjectId?: string) {
  const [tests, setTests] = useState<TestWithSubject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const q = subjectId ? `?subject_id=${encodeURIComponent(subjectId)}` : "";
      const data = await api.get<TestWithSubject[]>(`/api/tests${q}`);
      setTests(data ?? []);
    } catch {
      setTests([]);
    } finally {
      setLoading(false);
    }
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
    try {
      const data = await api.get<TestQuestion[]>(`/api/tests/${testId}/questions`);
      setQuestions(data ?? []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testId) fetch();
  }, [testId]);

  return { questions, loading, refetch: fetch };
}
