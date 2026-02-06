"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Subject } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubjectForm } from "./subject-form";
import { DeleteSubjectDialog } from "./delete-subject-dialog";

interface SubjectTableProps {
  subjects: Subject[];
}

export function SubjectTable({ subjects }: SubjectTableProps) {
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Fan nomi</TableHead>
            <TableHead>Yaratilgan sana</TableHead>
            <TableHead className="w-24 text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Hozircha fanlar yo&apos;q
              </TableCell>
            </TableRow>
          ) : (
            subjects.map((subject, index) => (
              <TableRow key={subject.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>
                  {new Date(subject.created_at).toLocaleDateString("uz-UZ")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditSubject(subject)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteSubject(subject)}
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

      <SubjectForm
        open={!!editSubject}
        onOpenChange={(open) => !open && setEditSubject(null)}
        subject={editSubject}
      />

      <DeleteSubjectDialog
        open={!!deleteSubject}
        onOpenChange={(open) => !open && setDeleteSubject(null)}
        subject={deleteSubject}
      />
    </>
  );
}
