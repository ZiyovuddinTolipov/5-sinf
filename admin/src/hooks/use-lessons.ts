"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  uploadPdf,
} from "@/actions/lessons";
import { toast } from "sonner";

export function useLessons() {
  return useQuery({
    queryKey: ["lessons"],
    queryFn: () => getLessons(),
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { subject_id: string; title: string }) =>
      createLesson(data),
    onSuccess: (result) => {
      if ("error" in result) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }
      toast.success("Darslik muvaffaqiyatli yaratildi");
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { subject_id: string; title: string };
    }) => updateLesson(id, data),
    onSuccess: (result) => {
      if ("error" in result) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }
      toast.success("Darslik muvaffaqiyatli yangilandi");
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLesson(id),
    onSuccess: (result) => {
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Darslik muvaffaqiyatli o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUploadPdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, formData }: { lessonId: string; formData: FormData }) =>
      uploadPdf(lessonId, formData),
    onSuccess: (result) => {
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("PDF muvaffaqiyatli yuklandi");
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (error) => toast.error(error.message),
  });
}
