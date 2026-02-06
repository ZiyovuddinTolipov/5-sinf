"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTests, createTest, updateTest, deleteTest } from "@/actions/tests";
import { toast } from "sonner";
import type { TestFormValues } from "@/schemas/test";

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
