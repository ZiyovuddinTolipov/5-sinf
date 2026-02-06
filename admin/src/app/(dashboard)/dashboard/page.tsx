import {
  Users,
  FileText,
  ClipboardList,
  Zap,
  Clock,
  AlertTriangle,
  Activity,
  Bell,
  BookOpen,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";

interface RecentItem {
  type: "test" | "lesson";
  name: string;
  subject: string;
  created_at: string;
}

async function getDashboardData() {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const threeDaysLater = new Date(
    Date.now() + 3 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [
    usersCount,
    lessonsCount,
    testsCount,
    activeTestsCount,
    recentTests,
    recentLessons,
    expiringTests,
    lessonsWithoutPdf,
  ] = await Promise.all([
    supabase.from("rankings").select("id", { count: "exact", head: true }),
    supabase.from("lessons").select("id", { count: "exact", head: true }),
    supabase.from("tests").select("id", { count: "exact", head: true }),
    supabase
      .from("tests")
      .select("id", { count: "exact", head: true })
      .lte("start_time", now)
      .gte("end_time", now),
    supabase
      .from("tests")
      .select("name, subjects(name), created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("lessons")
      .select("title, subjects(name), created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("tests")
      .select("id, name, end_time")
      .gte("end_time", now)
      .lte("end_time", threeDaysLater)
      .order("end_time", { ascending: true }),
    supabase.from("lessons").select("id, title").is("pdf_url", null),
  ]);

  // Merge recent tests & lessons into one sorted list
  const recentActivity: RecentItem[] = [];

  if (recentTests.data) {
    for (const t of recentTests.data) {
      recentActivity.push({
        type: "test",
        name: (t as Record<string, unknown>).name as string,
        subject:
          ((t as Record<string, unknown>).subjects as { name: string } | null)
            ?.name ?? "\u2014",
        created_at: (t as Record<string, unknown>).created_at as string,
      });
    }
  }

  if (recentLessons.data) {
    for (const l of recentLessons.data) {
      recentActivity.push({
        type: "lesson",
        name: (l as Record<string, unknown>).title as string,
        subject:
          ((l as Record<string, unknown>).subjects as { name: string } | null)
            ?.name ?? "\u2014",
        created_at: (l as Record<string, unknown>).created_at as string,
      });
    }
  }

  recentActivity.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    stats: {
      users: usersCount.count ?? 0,
      lessons: lessonsCount.count ?? 0,
      tests: testsCount.count ?? 0,
      activeTests: activeTestsCount.count ?? 0,
    },
    recentActivity: recentActivity.slice(0, 10),
    notifications: {
      expiringTests:
        (expiringTests.data as { id: string; name: string; end_time: string }[] | null) ?? [],
      lessonsWithoutPdf:
        (lessonsWithoutPdf.data as { id: string; title: string }[] | null) ?? [],
    },
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const statCards = [
    {
      title: "O'quvchilar",
      value: data.stats.users,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Darsliklar",
      value: data.stats.lessons,
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Testlar",
      value: data.stats.tests,
      icon: ClipboardList,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Faol testlar",
      value: data.stats.activeTests,
      icon: Zap,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  const totalNotifications =
    data.notifications.expiringTests.length +
    data.notifications.lessonsWithoutPdf.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Boshqaruv paneli</h1>
        <p className="text-muted-foreground mt-1">
          5-sinf elektron darslik va test tizimi umumiy ko&apos;rinishi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="shadow-sm border-0 shadow-black/5">
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

      {/* Recent Activity + Notifications */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity — 2/3 */}
        <Card className="shadow-sm border-0 shadow-black/5 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-medium">
                So&apos;nggi faoliyat
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Hozircha faoliyat yo&apos;q
              </p>
            ) : (
              <div className="space-y-1">
                {data.recentActivity.map((item, i) => (
                  <div
                    key={`${item.type}-${item.name}-${i}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`rounded-lg p-2 ${
                        item.type === "test"
                          ? "bg-amber-50"
                          : "bg-emerald-50"
                      }`}
                    >
                      {item.type === "test" ? (
                        <ClipboardList className="h-4 w-4 text-amber-600" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="font-normal text-xs"
                        >
                          {item.subject}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.type === "test" ? "Test" : "Darslik"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: uz,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications — 1/3 */}
        <Card className="shadow-sm border-0 shadow-black/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-medium">
                  Bildirishnomalar
                </CardTitle>
              </div>
              {totalNotifications > 0 && (
                <Badge className="bg-primary/10 text-primary border-0">
                  {totalNotifications}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {totalNotifications === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Hamma narsa joyida!
              </p>
            ) : (
              <div className="space-y-2">
                {data.notifications.expiringTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-start gap-3 rounded-lg bg-amber-50 px-3 py-2.5"
                  >
                    <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {test.name}
                      </p>
                      <p className="text-xs text-amber-700">
                        {formatDistanceToNow(new Date(test.end_time), {
                          addSuffix: false,
                          locale: uz,
                        })}{" "}
                        ichida tugaydi
                      </p>
                    </div>
                  </div>
                ))}
                {data.notifications.lessonsWithoutPdf.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-start gap-3 rounded-lg bg-red-50 px-3 py-2.5"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-red-600">
                        PDF yuklanmagan
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
