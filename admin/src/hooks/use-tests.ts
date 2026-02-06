"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTests,
  createTest,
  updateTest,
  deleteTest,
  getTestQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/actions/tests";
import { toast } from "sonner";
import type { TestFormValues, QuestionFormValues } from "@/schemas/test";

// =============================================
// Test hooks (parent)
// =============================================

export function useTests() {
  return useQuery({
    queryKey: ["tests"],
    queryFn: () => getTests(),
  });
}

export function useCreateTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TestFormValues) => createTest(data),
    onSuccess: (result) => {
      if ("error" in result) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }
      toast.success("Test muvaffaqiyatli yaratildi");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestFormValues }) =>
      updateTest(id, data),
    onSuccess: (result) => {
      if ("error" in result) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }
      toast.success("Test muvaffaqiyatli yangilandi");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTest(id),
    onSuccess: (result) => {
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Test muvaffaqiyatli o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

// =============================================
// Question hooks (children)
// =============================================

export function useTestQuestions(testId: string) {
  return useQuery({
    queryKey: ["test-questions", testId],
    queryFn: () => getTestQuestions(testId),
    enabled: !!testId,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testId, data }: { testId: string; data: QuestionFormValues }) =>
      createQuestion(testId, data),
    onSuccess: (result, variables) => {
      if ("error" in result) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }
      toast.success("Savol muvaffaqiyatli qo'shildi");
      queryClient.invalidateQueries({ queryKey: ["test-questions", variables.testId] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, testId, data }: { id: string; testId: string; data: QuestionFormValues }) =>
      updateQuestion(id, testId, data),
    onSuccess: (result, variables) => {
      if ("error" in result) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }
      toast.success("Savol muvaffaqiyatli yangilandi");
      queryClient.invalidateQueries({ queryKey: ["test-questions", variables.testId] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, testId }: { id: string; testId: string }) =>
      deleteQuestion(id, testId),
    onSuccess: (result, variables) => {
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Savol muvaffaqiyatli o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["test-questions", variables.testId] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error) => toast.error(error.message),
  });
}
