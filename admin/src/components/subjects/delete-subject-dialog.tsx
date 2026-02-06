"use client";

import { useDeleteSubject } from "@/hooks/use-subjects";
import type { Subject } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
}

export function DeleteSubjectDialog({
  open,
  onOpenChange,
  subject,
}: DeleteSubjectDialogProps) {
  const deleteSubject = useDeleteSubject();

  const handleDelete = async () => {
    if (!subject) return;
    const result = await deleteSubject.mutateAsync(subject.id);
    if ("success" in result) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fanni o&apos;chirish</DialogTitle>
          <DialogDescription>
            &quot;{subject?.name}&quot; fanini o&apos;chirishni xohlaysizmi? Bu
            fanga tegishli barcha darsliklar va testlar ham o&apos;chiriladi.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteSubject.isPending}
          >
            {deleteSubject.isPending ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
