"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubjects, createSubject, updateSubject, deleteSubject } from "@/actions/subjects";
import { toast } from "sonner";

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => getSubjects(),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => createSubject(data),
    onSuccess: (result) => {
      if ("error" in result) {
        const errorMsg = typeof result.error === "string"
          ? result.error
          : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }
      toast.success("Fan muvaffaqiyatli yaratildi");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      updateSubject(id, data),
    onSuccess: (result) => {
      if ("error" in result) {
        const errorMsg = typeof result.error === "string"
          ? result.error
          : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }
      toast.success("Fan muvaffaqiyatli yangilandi");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSubject(id),
    onSuccess: (result) => {
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Fan muvaffaqiyatli o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
