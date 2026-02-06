"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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

export function TestTable({ tests }: TestTableProps) {
  const [editTest, setEditTest] = useState<TestWithSubject | null>(null);
  const [deleteTest, setDeleteTest] = useState<TestWithSubject | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Savol</TableHead>
            <TableHead>Fan</TableHead>
            <TableHead>Ball</TableHead>
            <TableHead>Holat</TableHead>
            <TableHead>Vaqt oynasi</TableHead>
            <TableHead className="w-24 text-right">Amallar</TableHead>
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
                <TableCell className="max-w-[250px] truncate font-medium">
                  {test.question}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {test.subjects?.name ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                    {test.points} ball
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
