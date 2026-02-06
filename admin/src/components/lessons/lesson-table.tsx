"use client";

import { useState } from "react";
import { Pencil, Trash2, Upload, ExternalLink, CheckCircle } from "lucide-react";
import type { LessonWithSubject } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LessonForm } from "./lesson-form";
import { DeleteLessonDialog } from "./delete-lesson-dialog";
import { PdfUpload } from "./pdf-upload";

interface LessonTableProps {
  lessons: LessonWithSubject[];
}

export function LessonTable({ lessons }: LessonTableProps) {
  const [editLesson, setEditLesson] = useState<LessonWithSubject | null>(null);
  const [deleteLesson, setDeleteLesson] = useState<LessonWithSubject | null>(null);
  const [uploadLesson, setUploadLesson] = useState<LessonWithSubject | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Darslik nomi</TableHead>
            <TableHead>Fan</TableHead>
            <TableHead>Versiya</TableHead>
            <TableHead>Holat</TableHead>
            <TableHead>PDF</TableHead>
            <TableHead className="w-32 text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Hozircha darsliklar yo&apos;q
              </TableCell>
            </TableRow>
          ) : (
            lessons.map((lesson, index) => (
              <TableRow key={lesson.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium">{lesson.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {lesson.subjects?.name ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">v{lesson.version}</span>
                </TableCell>
                <TableCell>
                  {lesson.pdf_url ? (
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Faol
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-amber-700 bg-amber-50 border-0">
                      PDF yo&apos;q
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {lesson.pdf_url ? (
                    <a
                      href={lesson.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ko&apos;rish
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setUploadLesson(lesson)}
                      title="PDF yuklash"
                    >
                      <Upload className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditLesson(lesson)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeleteLesson(lesson)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <LessonForm
        open={!!editLesson}
        onOpenChange={(open) => !open && setEditLesson(null)}
        lesson={editLesson}
      />

      <DeleteLessonDialog
        open={!!deleteLesson}
        onOpenChange={(open) => !open && setDeleteLesson(null)}
        lesson={deleteLesson}
      />

      <PdfUpload
        open={!!uploadLesson}
        onOpenChange={(open) => !open && setUploadLesson(null)}
        lessonId={uploadLesson?.id ?? null}
        lessonTitle={uploadLesson?.title ?? ""}
      />
    </>
  );
}
