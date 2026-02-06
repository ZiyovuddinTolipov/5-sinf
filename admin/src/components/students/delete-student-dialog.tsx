"use client";

import { useDeleteStudent } from "@/hooks/use-students";
import type { Student } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function DeleteStudentDialog({
  open,
  onOpenChange,
  student,
}: DeleteStudentDialogProps) {
  const deleteStudent = useDeleteStudent();

  const handleDelete = async () => {
    if (!student) return;
    const result = await deleteStudent.mutateAsync(student.id);
    if ("success" in result) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>O&apos;quvchini o&apos;chirish</DialogTitle>
          <DialogDescription>
            <strong>{student?.full_name ?? student?.email}</strong> ni
            o&apos;chirishni xohlaysizmi? Bu amalni ortga qaytarib
            bo&apos;lmaydi.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteStudent.isPending}
          >
            {deleteStudent.isPending ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
