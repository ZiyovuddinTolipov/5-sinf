"use client";

import { useDeleteQuestion } from "@/hooks/use-tests";
import type { TestQuestionRow } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: TestQuestionRow | null;
  testId: string;
}

export function DeleteQuestionDialog({
  open,
  onOpenChange,
  question,
  testId,
}: DeleteQuestionDialogProps) {
  const deleteQuestion = useDeleteQuestion();

  const handleDelete = async () => {
    if (!question) return;
    const result = await deleteQuestion.mutateAsync({ id: question.id, testId });
    if ("success" in result) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Savolni o&apos;chirish</DialogTitle>
          <DialogDescription>
            Bu savolni o&apos;chirishni xohlaysizmi? Bu amalni ortga qaytarib
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
            disabled={deleteQuestion.isPending}
          >
            {deleteQuestion.isPending ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
