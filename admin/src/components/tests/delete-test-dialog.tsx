"use client";

import { useDeleteTest } from "@/hooks/use-tests";
import type { TestWithSubject } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: TestWithSubject | null;
}

export function DeleteTestDialog({
  open,
  onOpenChange,
  test,
}: DeleteTestDialogProps) {
  const deleteTest = useDeleteTest();

  const handleDelete = async () => {
    if (!test) return;
    const result = await deleteTest.mutateAsync(test.id);
    if ("success" in result) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Testni o&apos;chirish</DialogTitle>
          <DialogDescription>
            Bu testni o&apos;chirishni xohlaysizmi? Bu amalni ortga qaytarib
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
            disabled={deleteTest.isPending}
          >
            {deleteTest.isPending ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
