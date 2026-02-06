"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { useTestQuestions } from "@/hooks/use-tests";
import { getTestById } from "@/actions/tests";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionTable } from "@/components/tests/question-table";
import { QuestionForm } from "@/components/tests/question-form";

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  const [questionFormOpen, setQuestionFormOpen] = useState(false);

  const { data: test, isLoading: testLoading } = useQuery({
    queryKey: ["tests", testId],
    queryFn: () => getTestById(testId),
    enabled: !!testId,
  });

  const { data: questions, isLoading: questionsLoading } = useTestQuestions(testId);

  if (testLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/tests")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Testlarga qaytish
        </Button>
        <p className="text-muted-foreground">Test topilmadi.</p>
      </div>
    );
  }

  const now = new Date();
  const start = new Date(test.start_time);
  const end = new Date(test.end_time);
  const status = now < start ? "Kutilmoqda" : now <= end ? "Faol" : "Yopilgan";
  const statusClass =
    status === "Faol"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Kutilmoqda"
        ? "bg-blue-50 text-blue-700"
        : "bg-gray-100 text-gray-600";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/tests")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{test.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="secondary" className="font-normal">
              {test.subjects?.name ?? "\u2014"}
            </Badge>
            <Badge className={`${statusClass} border-0`}>{status}</Badge>
            <span className="text-sm text-muted-foreground">
              {format(start, "dd.MM.yyyy HH:mm")} &mdash; {format(end, "dd.MM.yyyy HH:mm")}
            </span>
          </div>
        </div>
        <Button onClick={() => setQuestionFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yangi savol
        </Button>
      </div>

      <Card className="shadow-sm border-0 shadow-black/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-medium">
              Savollar ({questions?.length ?? 0} ta)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {questionsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <QuestionTable questions={questions ?? []} testId={testId} />
          )}
        </CardContent>
      </Card>

      <QuestionForm
        open={questionFormOpen}
        onOpenChange={setQuestionFormOpen}
        testId={testId}
      />
    </div>
  );
}
