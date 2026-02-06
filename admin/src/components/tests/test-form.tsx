"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { testSchema, type TestFormValues } from "@/schemas/test";
import { useCreateTest, useUpdateTest } from "@/hooks/use-tests";
import { useSubjects } from "@/hooks/use-subjects";
import type { TestWithSubject, TestOption } from "@/types";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test?: TestWithSubject | null;
}

function optionsToForm(options: TestOption[]) {
  const map: Record<string, string> = { A: "", B: "", C: "", D: "" };
  options.forEach((o) => (map[o.label] = o.text));
  return {
    option_a: map.A,
    option_b: map.B,
    option_c: map.C,
    option_d: map.D,
  };
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
      subject_id: "",
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
      points: 1,
      start_time: "",
      end_time: "",
    },
  });

  useEffect(() => {
    if (test) {
      const opts = optionsToForm(test.options);
      form.reset({
        subject_id: test.subject_id,
        question: test.question,
        ...opts,
        correct_option: test.correct_option,
        points: test.points,
        start_time: toLocalDatetime(test.start_time),
        end_time: toLocalDatetime(test.end_time),
      });
    } else {
      form.reset({
        subject_id: "",
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "A",
        points: 1,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Testni tahrirlash" : "Yangi test qo'shish"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Savol</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Savolni kiriting..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Label>Variantlar</Label>
              {(["A", "B", "C", "D"] as const).map((letter) => (
                <FormField
                  key={letter}
                  control={form.control}
                  name={
                    `option_${letter.toLowerCase()}` as
                      | "option_a"
                      | "option_b"
                      | "option_c"
                      | "option_d"
                  }
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-center font-medium">
                          {letter})
                        </span>
                        <FormControl>
                          <Input
                            placeholder={`${letter} variant`}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <FormField
              control={form.control}
              name="correct_option"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To&apos;g&apos;ri javob</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      {(["A", "B", "C", "D"] as const).map((letter) => (
                        <div
                          key={letter}
                          className="flex items-center space-x-1"
                        >
                          <RadioGroupItem value={letter} id={`correct-${letter}`} />
                          <Label htmlFor={`correct-${letter}`}>{letter}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ball (1-5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
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
