import { BookOpen, FileText, ClipboardList, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";

async function getStats() {
  const supabase = createAdminClient();

  const [subjects, lessons, tests, rankings] = await Promise.all([
    supabase.from("subjects").select("id", { count: "exact", head: true }),
    supabase.from("lessons").select("id", { count: "exact", head: true }),
    supabase.from("tests").select("id", { count: "exact", head: true }),
    supabase.from("rankings").select("id", { count: "exact", head: true }),
  ]);

  return {
    subjects: subjects.count ?? 0,
    lessons: lessons.count ?? 0,
    tests: tests.count ?? 0,
    students: rankings.count ?? 0,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      title: "Fanlar",
      value: stats.subjects,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Darsliklar",
      value: stats.lessons,
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Testlar",
      value: stats.tests,
      icon: ClipboardList,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "O'quvchilar",
      value: stats.students,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Boshqaruv paneli</h1>
        <p className="text-muted-foreground mt-1">
          5-sinf elektron darslik va test tizimi umumiy ko&apos;rinishi
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="shadow-sm border-0 shadow-black/5"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
