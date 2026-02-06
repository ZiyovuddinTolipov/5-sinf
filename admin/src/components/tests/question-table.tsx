"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { TestQuestionRow } from "@/types";
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
import { QuestionForm } from "./question-form";
import { DeleteQuestionDialog } from "./delete-question-dialog";

interface QuestionTableProps {
  questions: TestQuestionRow[];
  testId: string;
}

export function QuestionTable({ questions, testId }: QuestionTableProps) {
  const [editQuestion, setEditQuestion] = useState<TestQuestionRow | null>(null);
  const [deleteQuestion, setDeleteQuestion] = useState<TestQuestionRow | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Savol</TableHead>
            <TableHead className="w-24">Ball</TableHead>
            <TableHead className="w-32">To&apos;g&apos;ri javob</TableHead>
            <TableHead className="w-24 text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Hozircha savollar yo&apos;q. &quot;Yangi savol&quot; tugmasini bosing.
              </TableCell>
            </TableRow>
          ) : (
            questions.map((question, index) => (
              <TableRow key={question.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="max-w-[400px] truncate font-medium">
                  {question.question}
                </TableCell>
                <TableCell>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                    {question.points} ball
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-medium">
                    {question.correct_option}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditQuestion(question)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeleteQuestion(question)}
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

      <QuestionForm
        open={!!editQuestion}
        onOpenChange={(open) => !open && setEditQuestion(null)}
        testId={testId}
        question={editQuestion}
      />

      <DeleteQuestionDialog
        open={!!deleteQuestion}
        onOpenChange={(open) => !open && setDeleteQuestion(null)}
        question={deleteQuestion}
        testId={testId}
      />
    </>
  );
}
