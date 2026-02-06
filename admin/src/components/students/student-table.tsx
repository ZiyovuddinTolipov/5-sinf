"use client";

import { useState } from "react";
import { Pencil, Trash2, ShieldBan, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import type { Student } from "@/types";
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
import { StudentForm } from "./student-form";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { BanStudentDialog } from "./ban-student-dialog";

interface StudentTableProps {
  students: Student[];
}

function isBanned(student: Student): boolean {
  if (!student.banned_until) return false;
  return new Date(student.banned_until) > new Date();
}

export function StudentTable({ students }: StudentTableProps) {
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [banStudent, setBanStudent] = useState<Student | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Ism</TableHead>
            <TableHead>Holat</TableHead>
            <TableHead>Ro&apos;yxatdan o&apos;tgan</TableHead>
            <TableHead>Oxirgi kirish</TableHead>
            <TableHead className="w-36 text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                Hozircha o&apos;quvchilar yo&apos;q
              </TableCell>
            </TableRow>
          ) : (
            students.map((student, index) => {
              const banned = isBanned(student);
              return (
                <TableRow key={student.id}>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student.email}
                  </TableCell>
                  <TableCell>{student.full_name ?? "\u2014"}</TableCell>
                  <TableCell>
                    {banned ? (
                      <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-0">
                        Banlangan
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0">
                        Faol
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(student.created_at), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell className="text-sm">
                    {student.last_sign_in_at
                      ? format(
                          new Date(student.last_sign_in_at),
                          "dd.MM.yyyy HH:mm"
                        )
                      : "\u2014"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditStudent(student)}
                        title="Tahrirlash"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setBanStudent(student)}
                        title={banned ? "Banni olib tashlash" : "Banlash"}
                      >
                        {banned ? (
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <ShieldBan className="h-4 w-4 text-amber-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleteStudent(student)}
                        title="O'chirish"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <StudentForm
        open={!!editStudent}
        onOpenChange={(open) => !open && setEditStudent(null)}
        student={editStudent}
      />

      <DeleteStudentDialog
        open={!!deleteStudent}
        onOpenChange={(open) => !open && setDeleteStudent(null)}
        student={deleteStudent}
      />

      <BanStudentDialog
        open={!!banStudent}
        onOpenChange={(open) => !open && setBanStudent(null)}
        student={banStudent}
      />
    </>
  );
}
