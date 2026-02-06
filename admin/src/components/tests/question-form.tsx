"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { questionSchema, type QuestionFormValues } from "@/schemas/test";
import { useCreateQuestion, useUpdateQuestion } from "@/hooks/use-tests";
import type { TestQuestionRow, TestOption } from "@/types";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface QuestionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId: string;
  question?: TestQuestionRow | null;
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

export function QuestionForm({ open, onOpenChange, testId, question }: QuestionFormProps) {
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const isEditing = !!question;

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
      points: 1,
    },
  });

  useEffect(() => {
    if (question) {
      const opts = optionsToForm(question.options);
      form.reset({
        question: question.question,
        ...opts,
        correct_option: question.correct_option,
        points: question.points,
      });
    } else {
      form.reset({
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "A",
        points: 1,
      });
    }
  }, [question, form]);

  const onSubmit = async (data: QuestionFormValues) => {
    if (isEditing && question) {
      const result = await updateQuestion.mutateAsync({
        id: question.id,
        testId,
        data,
      });
      if ("success" in result) onOpenChange(false);
    } else {
      const result = await createQuestion.mutateAsync({ testId, data });
      if ("success" in result) {
        form.reset();
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Savolni tahrirlash" : "Yangi savol qo'shish"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                disabled={createQuestion.isPending || updateQuestion.isPending}
              >
                {createQuestion.isPending || updateQuestion.isPending
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
