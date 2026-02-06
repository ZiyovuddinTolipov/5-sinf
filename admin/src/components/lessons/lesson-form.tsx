"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { lessonSchema, type LessonFormValues } from "@/schemas/lesson";
import { useCreateLesson, useUpdateLesson, useUploadPdf } from "@/hooks/use-lessons";
import { useSubjects } from "@/hooks/use-subjects";
import type { LessonWithSubject } from "@/types";
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

interface LessonFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: LessonWithSubject | null;
}

export function LessonForm({ open, onOpenChange, lesson }: LessonFormProps) {
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const uploadPdf = useUploadPdf();
  const { data: subjects } = useSubjects();
  const isEditing = !!lesson;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { subject_id: "", title: "" },
  });

  useEffect(() => {
    if (lesson) {
      form.reset({ subject_id: lesson.subject_id, title: lesson.title });
    } else {
      form.reset({ subject_id: "", title: "" });
    }
    setSelectedFile(null);
  }, [lesson, form]);

  const handleFile = useCallback((file: File) => {
    if (file.type === "application/pdf") {
      setSelectedFile(file);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onSubmit = async (data: LessonFormValues) => {
    if (isEditing && lesson) {
      const result = await updateLesson.mutateAsync({ id: lesson.id, data });
      if ("success" in result) {
        // Upload PDF if selected
        if (selectedFile) {
          const formData = new FormData();
          formData.append("file", selectedFile);
          await uploadPdf.mutateAsync({ lessonId: lesson.id, formData });
        }
        onOpenChange(false);
      }
    } else {
      const result = await createLesson.mutateAsync(data);
      if ("success" in result && result.data) {
        // Upload PDF if selected
        if (selectedFile) {
          const formData = new FormData();
          formData.append("file", selectedFile);
          await uploadPdf.mutateAsync({ lessonId: result.data.id, formData });
        }
        onOpenChange(false);
      }
    }
  };

  const isPending = createLesson.isPending || updateLesson.isPending || uploadPdf.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Darslikni tahrirlash" : "Yangi darslik qo'shish"}
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Darslik nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="1-dars: Kirish" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PDF Upload */}
            <div className="space-y-2">
              <FormLabel>PDF fayl {isEditing && lesson?.pdf_url ? "(qayta yuklash)" : ""}</FormLabel>
              {isEditing && lesson?.pdf_url && !selectedFile && (
                <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="flex-1 truncate">Mavjud PDF (v{lesson.version})</span>
                  <a
                    href={lesson.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs"
                  >
                    Ko&apos;rish
                  </a>
                </div>
              )}
              <div
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      PDF ni bu yerga tashlang yoki tanlang
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : isEditing ? (
                  "Saqlash"
                ) : (
                  "Qo'shish"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
