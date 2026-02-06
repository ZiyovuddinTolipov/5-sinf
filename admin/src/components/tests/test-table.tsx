"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import type { TestWithSubject } from "@/types";
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
import { TestForm } from "./test-form";
import { DeleteTestDialog } from "./delete-test-dialog";

interface TestTableProps {
  tests: TestWithSubject[];
}

function getTestStatus(startTime: string, endTime: string) {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) {
    return (
      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0">
        Kutilmoqda
      </Badge>
    );
  }
  if (now >= start && now <= end) {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0">
        Faol
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-0">
      Yopilgan
    </Badge>
  );
}

function getQuestionCount(test: TestWithSubject): number {
  if (test.test_questions && test.test_questions.length > 0) {
    return test.test_questions[0].count;
  }
  return 0;
}

function TestCard({
  test,
  onView,
  onEdit,
  onDelete,
}: {
  test: TestWithSubject;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0 flex-1">
          <p
            className="text-sm font-medium truncate cursor-pointer hover:text-primary"
            onClick={onView}
          >
            {test.name}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-normal">
              {test.subjects?.name ?? "\u2014"}
            </Badge>
            <Badge className="bg-primary/10 text-primary border-0">
              {getQuestionCount(test)} ta savol
            </Badge>
            {getTestStatus(test.start_time, test.end_time)}
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        {format(new Date(test.start_time), "dd.MM.yyyy HH:mm")} —{" "}
        {format(new Date(test.end_time), "dd.MM.yyyy HH:mm")}
      </div>
      <div className="flex gap-1 pt-1">
        <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
          <Eye className="h-3.5 w-3.5 mr-1 text-primary" />
          Ko&apos;rish
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
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

export function TestTable({ tests }: TestTableProps) {
  const router = useRouter();
  const [editTest, setEditTest] = useState<TestWithSubject | null>(null);
  const [deleteTest, setDeleteTest] = useState<TestWithSubject | null>(null);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Nomi</TableHead>
              <TableHead>Fan</TableHead>
              <TableHead>Savollar</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Vaqt oynasi</TableHead>
              <TableHead className="w-32 text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Hozircha testlar yo&apos;q
                </TableCell>
              </TableRow>
            ) : (
              tests.map((test, index) => (
                <TableRow key={test.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell
                    className="max-w-[250px] truncate font-medium cursor-pointer hover:text-primary"
                    onClick={() => router.push(`/tests/${test.id}`)}
                  >
                    {test.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {test.subjects?.name ?? "\u2014"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                      {getQuestionCount(test)} ta savol
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getTestStatus(test.start_time, test.end_time)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{format(new Date(test.start_time), "dd.MM.yyyy HH:mm")}</div>
                    <div className="text-muted-foreground">
                      {format(new Date(test.end_time), "dd.MM.yyyy HH:mm")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => router.push(`/tests/${test.id}`)}
                        title="Savollarni ko'rish"
                      >
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditTest(test)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleteTest(test)}
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
        {tests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Hozircha testlar yo&apos;q
          </p>
        ) : (
          tests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              onView={() => router.push(`/tests/${test.id}`)}
              onEdit={() => setEditTest(test)}
              onDelete={() => setDeleteTest(test)}
            />
          ))
        )}
      </div>

      <TestForm
        open={!!editTest}
        onOpenChange={(open) => !open && setEditTest(null)}
        test={editTest}
      />

      <DeleteTestDialog
        open={!!deleteTest}
        onOpenChange={(open) => !open && setDeleteTest(null)}
        test={deleteTest}
      />
    </>
  );
}
