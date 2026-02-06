"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { testSchema, type TestFormValues } from "@/schemas/test";
import { useCreateTest, useUpdateTest } from "@/hooks/use-tests";
import { useSubjects } from "@/hooks/use-subjects";
import type { TestWithSubject } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test?: TestWithSubject | null;
}

function toLocalDatetime(iso: string) {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function TestForm({ open, onOpenChange, test }: TestFormProps) {
  const createTest = useCreateTest();
  const updateTest = useUpdateTest();
  const { data: subjects } = useSubjects();
  const isEditing = !!test;

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: "",
      subject_id: "",
      start_time: "",
      end_time: "",
    },
  });

  useEffect(() => {
    if (test) {
      form.reset({
        name: test.name,
        subject_id: test.subject_id,
        start_time: toLocalDatetime(test.start_time),
        end_time: toLocalDatetime(test.end_time),
      });
    } else {
      form.reset({
        name: "",
        subject_id: "",
        start_time: "",
        end_time: "",
      });
    }
  }, [test, form]);

  const onSubmit = async (data: TestFormValues) => {
    const payload = {
      ...data,
      start_time: new Date(data.start_time).toISOString(),
      end_time: new Date(data.end_time).toISOString(),
    };

    if (isEditing && test) {
      const result = await updateTest.mutateAsync({ id: test.id, data: payload });
      if ("success" in result) onOpenChange(false);
    } else {
      const result = await createTest.mutateAsync(payload);
      if ("success" in result) onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Testni tahrirlash" : "Yangi test qo'shish"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: Matematika 1-bob testi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fan</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Fan tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Boshlanish vaqti</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tugash vaqti</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                disabled={createTest.isPending || updateTest.isPending}
              >
                {createTest.isPending || updateTest.isPending
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
