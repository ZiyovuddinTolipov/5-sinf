"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentSchema,
  studentUpdateSchema,
  type StudentFormValues,
  type StudentUpdateValues,
} from "@/schemas/student";
import { useCreateStudent, useUpdateStudent } from "@/hooks/use-students";
import type { Student } from "@/types";
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

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
}

export function StudentForm({ open, onOpenChange, student }: StudentFormProps) {
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const isEditing = !!student;

  const createForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
    },
  });

  const editForm = useForm<StudentUpdateValues>({
    resolver: zodResolver(studentUpdateSchema),
    defaultValues: {
      full_name: "",
    },
  });

  useEffect(() => {
    if (student) {
      editForm.reset({
        full_name: student.full_name ?? "",
      });
    } else {
      createForm.reset({
        email: "",
        password: "",
        full_name: "",
      });
    }
  }, [student, createForm, editForm]);

  const onCreateSubmit = async (data: StudentFormValues) => {
    const result = await createStudent.mutateAsync(data);
    if ("success" in result) onOpenChange(false);
  };

  const onEditSubmit = async (data: StudentUpdateValues) => {
    if (!student) return;
    const result = await updateStudent.mutateAsync({ id: student.id, data });
    if ("success" in result) onOpenChange(false);
  };

  if (isEditing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>O&apos;quvchini tahrirlash</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <div className="text-sm text-muted-foreground">
                {student?.email}
              </div>

              <FormField
                control={editForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ism familiya</FormLabel>
                    <FormControl>
                      <Input placeholder="Masalan: Ali Valiyev" {...field} />
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
                <Button type="submit" disabled={updateStudent.isPending}>
                  {updateStudent.isPending ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yangi o&apos;quvchi qo&apos;shish</DialogTitle>
        </DialogHeader>
        <Form {...createForm}>
          <form
            onSubmit={createForm.handleSubmit(onCreateSubmit)}
            className="space-y-4"
          >
            <FormField
              control={createForm.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ism familiya</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: Ali Valiyev" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="masalan@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parol</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Kamida 6 ta belgi"
                      {...field}
                    />
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
              <Button type="submit" disabled={createStudent.isPending}>
                {createStudent.isPending ? "Yaratilmoqda..." : "Qo'shish"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
