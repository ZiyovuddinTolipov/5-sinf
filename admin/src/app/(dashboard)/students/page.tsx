"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useStudents } from "@/hooks/use-students";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentTable } from "@/components/students/student-table";
import { StudentForm } from "@/components/students/student-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data: students, isLoading } = useStudents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            O&apos;quvchilar
          </h1>
          <p className="text-muted-foreground mt-1">
            O&apos;quvchilarni yarating, tahrirlang va boshqaring
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yangi o&apos;quvchi
        </Button>
      </div>

      <Card className="shadow-sm border-0 shadow-black/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            O&apos;quvchilar ro&apos;yxati
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <StudentTable students={students ?? []} />
          )}
        </CardContent>
      </Card>

      <StudentForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
