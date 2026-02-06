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

function StudentCard({
  student,
  index,
  onEdit,
  onBan,
  onDelete,
}: {
  student: Student;
  index: number;
  onEdit: () => void;
  onBan: () => void;
  onDelete: () => void;
}) {
  const banned = isBanned(student);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{student.email}</p>
          <p className="text-sm text-muted-foreground">
            {student.full_name ?? "\u2014"}
          </p>
        </div>
        {banned ? (
          <Badge className="bg-red-50 text-red-700 border-0 shrink-0 ml-2">
            Banlangan
          </Badge>
        ) : (
          <Badge className="bg-emerald-50 text-emerald-700 border-0 shrink-0 ml-2">
            Faol
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Ro&apos;yxatdan:{" "}
          {format(new Date(student.created_at), "dd.MM.yyyy")}
        </span>
        <span>
          Oxirgi kirish:{" "}
          {student.last_sign_in_at
            ? format(new Date(student.last_sign_in_at), "dd.MM.yyyy")
            : "\u2014"}
        </span>
      </div>
      <div className="flex gap-1 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Tahrirlash
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onBan}
        >
          {banned ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              Unban
            </>
          ) : (
            <>
              <ShieldBan className="h-3.5 w-3.5 mr-1 text-amber-600" />
              Ban
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function StudentTable({ students }: StudentTableProps) {
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [banStudent, setBanStudent] = useState<Student | null>(null);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
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
                    <TableCell className="font-medium max-w-[200px] truncate">
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
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {students.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Hozircha o&apos;quvchilar yo&apos;q
          </p>
        ) : (
          students.map((student, index) => (
            <StudentCard
              key={student.id}
              student={student}
              index={index}
              onEdit={() => setEditStudent(student)}
              onBan={() => setBanStudent(student)}
              onDelete={() => setDeleteStudent(student)}
            />
          ))
        )}
      </div>

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
