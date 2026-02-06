"use client";

import { useBanStudent } from "@/hooks/use-students";
import type { Student } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BanStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

function isBanned(student: Student | null): boolean {
  if (!student?.banned_until) return false;
  return new Date(student.banned_until) > new Date();
}

export function BanStudentDialog({
  open,
  onOpenChange,
  student,
}: BanStudentDialogProps) {
  const banMutation = useBanStudent();
  const banned = isBanned(student);

  const handleAction = async () => {
    if (!student) return;
    const result = await banMutation.mutateAsync({
      id: student.id,
      ban: !banned,
    });
    if ("success" in result) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {banned
              ? "Banni olib tashlash"
              : "O'quvchini banlash"}
          </DialogTitle>
          <DialogDescription>
            {banned ? (
              <>
                <strong>{student?.full_name ?? student?.email}</strong> ning
                banini olib tashlamoqchimisiz? O&apos;quvchi qaytadan tizimga
                kira oladi.
              </>
            ) : (
              <>
                <strong>{student?.full_name ?? student?.email}</strong> ni
                banlamoqchimisiz? O&apos;quvchi tizimga kira olmaydi.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          {banned ? (
            <Button onClick={handleAction} disabled={banMutation.isPending}>
              {banMutation.isPending
                ? "Bajarilmoqda..."
                : "Banni olib tashlash"}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleAction}
              disabled={banMutation.isPending}
            >
              {banMutation.isPending ? "Banlanmoqda..." : "Banlash"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
