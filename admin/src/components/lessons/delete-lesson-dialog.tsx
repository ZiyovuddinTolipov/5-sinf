"use client";

import { useDeleteLesson } from "@/hooks/use-lessons";
import type { LessonWithSubject } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: LessonWithSubject | null;
}

export function DeleteLessonDialog({
  open,
  onOpenChange,
  lesson,
}: DeleteLessonDialogProps) {
  const deleteLesson = useDeleteLesson();

  const handleDelete = async () => {
    if (!lesson) return;
    const result = await deleteLesson.mutateAsync(lesson.id);
    if ("success" in result) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Darslikni o&apos;chirish</DialogTitle>
          <DialogDescription>
            &quot;{lesson?.title}&quot; darsligini o&apos;chirishni
            xohlaysizmi? PDF fayl ham o&apos;chiriladi.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteLesson.isPending}
          >
            {deleteLesson.isPending ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
