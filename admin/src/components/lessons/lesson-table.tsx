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

function LessonCard({
  lesson,
  onUpload,
  onEdit,
  onDelete,
}: {
  lesson: LessonWithSubject;
  onUpload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{lesson.title}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-normal">
              {lesson.subjects?.name ?? "\u2014"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              v{lesson.version}
            </span>
          </div>
        </div>
        {lesson.pdf_url ? (
          <Badge className="bg-emerald-50 text-emerald-700 border-0 shrink-0 ml-2">
            <CheckCircle className="mr-1 h-3 w-3" />
            Faol
          </Badge>
        ) : (
          <Badge className="text-amber-700 bg-amber-50 border-0 shrink-0 ml-2">
            PDF yo&apos;q
          </Badge>
        )}
      </div>
      {lesson.pdf_url && (
        <a
          href={lesson.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          PDF ko&apos;rish
        </a>
      )}
      <div className="flex gap-1 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onUpload}
        >
          <Upload className="h-3.5 w-3.5 mr-1 text-primary" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Tahrirlash
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function LessonTable({ lessons }: LessonTableProps) {
  const [editLesson, setEditLesson] = useState<LessonWithSubject | null>(null);
  const [deleteLesson, setDeleteLesson] = useState<LessonWithSubject | null>(null);
  const [uploadLesson, setUploadLesson] = useState<LessonWithSubject | null>(null);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
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
                      {lesson.subjects?.name ?? "\u2014"}
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
                      <span className="text-muted-foreground text-sm">\u2014</span>
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
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {lessons.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Hozircha darsliklar yo&apos;q
          </p>
        ) : (
          lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onUpload={() => setUploadLesson(lesson)}
              onEdit={() => setEditLesson(lesson)}
              onDelete={() => setDeleteLesson(lesson)}
            />
          ))
        )}
      </div>

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
