"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTests } from "@/hooks/use-tests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTable } from "@/components/tests/test-table";
import { TestForm } from "@/components/tests/test-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function TestsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data: tests, isLoading } = useTests();

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

      <Card className="shadow-sm border-0 shadow-black/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Testlar ro&apos;yxati
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
            <TestTable tests={tests ?? []} />
          )}
        </CardContent>
      </Card>

      <TestForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
