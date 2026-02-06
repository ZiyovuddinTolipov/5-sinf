"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudents,
  createStudent,
  updateStudent,
  banStudent,
  unbanStudent,
  deleteStudent,
} from "@/actions/students";
import { toast } from "sonner";
import type { StudentFormValues, StudentUpdateValues } from "@/schemas/student";

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents(),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StudentFormValues) => createStudent(data),
    onSuccess: (result) => {
      if ("error" in result) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }
      toast.success("O'quvchi muvaffaqiyatli yaratildi");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StudentUpdateValues }) =>
      updateStudent(id, data),
    onSuccess: (result) => {
      if ("error" in result) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }
      toast.success("O'quvchi muvaffaqiyatli yangilandi");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useBanStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ban }: { id: string; ban: boolean }) =>
      ban ? banStudent(id) : unbanStudent(id),
    onSuccess: (result, variables) => {
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(
        variables.ban
          ? "O'quvchi banlandi"
          : "O'quvchi bani olib tashlandi"
      );
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: (result) => {
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("O'quvchi muvaffaqiyatli o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => toast.error(error.message),
  });
}
