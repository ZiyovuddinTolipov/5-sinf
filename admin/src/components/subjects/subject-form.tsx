"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subjectSchema, type SubjectFormValues } from "@/schemas/subject";
import { useCreateSubject, useUpdateSubject } from "@/hooks/use-subjects";
import type { Subject } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SubjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject | null;
}

export function SubjectForm({ open, onOpenChange, subject }: SubjectFormProps) {
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const isEditing = !!subject;

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (subject) {
      form.reset({ name: subject.name });
    } else {
      form.reset({ name: "" });
    }
  }, [subject, form]);

  const onSubmit = async (data: SubjectFormValues) => {
    if (isEditing && subject) {
      const result = await updateSubject.mutateAsync({ id: subject.id, data });
      if ("success" in result) onOpenChange(false);
    } else {
      const result = await createSubject.mutateAsync(data);
      if ("success" in result) onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Fanni tahrirlash" : "Yangi fan qo'shish"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fan nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Matematika" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={createSubject.isPending || updateSubject.isPending}
              >
                {createSubject.isPending || updateSubject.isPending
                  ? "Saqlanmoqda..."
                  : isEditing
                    ? "Saqlash"
                    : "Qo'shish"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
