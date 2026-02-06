"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useTests } from "@/hooks/use-tests";
import { useSubjects } from "@/hooks/use-subjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTable } from "@/components/tests/test-table";
import { TestForm } from "@/components/tests/test-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function TestsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | "all">("all");
  const { data: tests, isLoading } = useTests();
  const { data: subjects } = useSubjects();

  const filteredTests = useMemo(() => {
    if (!tests) return [];
    if (selectedSubject === "all") return tests;
    return tests.filter((t) => t.subject_id === selectedSubject);
  }, [tests, selectedSubject]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testlar</h1>
          <p className="text-muted-foreground mt-1">
            Testlarni yarating va har bir test ichiga savollar qo&apos;shing
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yangi test
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedSubject === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          onClick={() => setSelectedSubject("all")}
        >
          Barchasi {tests ? `(${tests.length})` : ""}
        </button>
        {subjects?.map((s) => {
          const count = tests?.filter((t) => t.subject_id === s.id).length ?? 0;
          return (
            <button
              key={s.id}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedSubject === s.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              onClick={() => setSelectedSubject(s.id)}
            >
              {s.name} ({count})
            </button>
          );
        })}
      </div>

      <Card className="shadow-sm border-0 shadow-black/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Testlar ro&apos;yxati
            {selectedSubject !== "all" && subjects
              ? ` — ${subjects.find((s) => s.id === selectedSubject)?.name}`
              : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <TestTable tests={filteredTests} />
          )}
        </CardContent>
      </Card>

      <TestForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
