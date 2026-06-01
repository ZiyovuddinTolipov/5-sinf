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
import { and, asc, count, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { lessons, rankings, subjects, tests } from "@/db/schema";

interface RecentItem {
  type: "test" | "lesson";
  name: string;
  subject: string;
  created_at: string;
}

async function getDashboardData() {
  const now = new Date().toISOString();
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const [
    [{ c: usersCount }],
    [{ c: lessonsCount }],
    [{ c: testsCount }],
    [{ c: activeTestsCount }],
    recentTests,
    recentLessons,
    expiringTests,
    lessonsWithoutPdf,
  ] = await Promise.all([
    db.select({ c: count(rankings.id) }).from(rankings),
    db.select({ c: count(lessons.id) }).from(lessons),
    db.select({ c: count(tests.id) }).from(tests),
    db
      .select({ c: count(tests.id) })
      .from(tests)
      .where(and(lte(tests.start_time, now), gte(tests.end_time, now))),
    db
      .select({
        name: tests.name,
        subject_name: subjects.name,
        created_at: tests.created_at,
      })
      .from(tests)
      .leftJoin(subjects, eq(tests.subject_id, subjects.id))
      .orderBy(desc(tests.created_at))
      .limit(5),
    db
      .select({
        title: lessons.title,
        subject_name: subjects.name,
        created_at: lessons.created_at,
      })
      .from(lessons)
      .leftJoin(subjects, eq(lessons.subject_id, subjects.id))
      .orderBy(desc(lessons.created_at))
      .limit(5),
    db
      .select({ id: tests.id, name: tests.name, end_time: tests.end_time })
      .from(tests)
      .where(and(gte(tests.end_time, now), lte(tests.end_time, threeDaysLater)))
      .orderBy(asc(tests.end_time)),
    db
      .select({ id: lessons.id, title: lessons.title })
      .from(lessons)
      .where(isNull(lessons.pdf_url)),
  ]);

  const recentActivity: RecentItem[] = [];
  for (const t of recentTests) {
    recentActivity.push({
      type: "test",
      name: t.name,
      subject: t.subject_name ?? "—",
      created_at: t.created_at,
    });
  }
  for (const l of recentLessons) {
    recentActivity.push({
      type: "lesson",
      name: l.title,
      subject: l.subject_name ?? "—",
      created_at: l.created_at,
    });
  }
  recentActivity.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return {
    stats: {
      users: usersCount,
      lessons: lessonsCount,
      tests: testsCount,
      activeTests: activeTestsCount,
    },
    recentActivity: recentActivity.slice(0, 10),
    notifications: {
      expiringTests,
      lessonsWithoutPdf,
    },
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const statCards = [
    { title: "O'quvchilar", value: data.stats.users, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Darsliklar", value: data.stats.lessons, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Testlar", value: data.stats.tests, icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Faol testlar", value: data.stats.activeTests, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  const totalNotifications =
    data.notifications.expiringTests.length + data.notifications.lessonsWithoutPdf.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Boshqaruv paneli</h1>
        <p className="text-muted-foreground mt-1">
          5-sinf elektron darslik va test tizimi umumiy ko&apos;rinishi
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="shadow-sm border-0 shadow-black/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-sm border-0 shadow-black/5 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-medium">So&apos;nggi faoliyat</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Hozircha faoliyat yo&apos;q</p>
            ) : (
              <div className="space-y-1">
                {data.recentActivity.map((item, i) => (
                  <div
                    key={`${item.type}-${item.name}-${i}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`rounded-lg p-2 ${item.type === "test" ? "bg-amber-50" : "bg-emerald-50"}`}>
                      {item.type === "test" ? (
                        <ClipboardList className="h-4 w-4 text-amber-600" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-normal text-xs">{item.subject}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.type === "test" ? "Test" : "Darslik"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: uz })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 shadow-black/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-medium">Bildirishnomalar</CardTitle>
              </div>
              {totalNotifications > 0 && (
                <Badge className="bg-primary/10 text-primary border-0">{totalNotifications}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {totalNotifications === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Hamma narsa joyida!</p>
            ) : (
              <div className="space-y-2">
                {data.notifications.expiringTests.map((test) => (
                  <div key={test.id} className="flex items-start gap-3 rounded-lg bg-amber-50 px-3 py-2.5">
                    <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{test.name}</p>
                      <p className="text-xs text-amber-700">
                        {formatDistanceToNow(new Date(test.end_time), { addSuffix: false, locale: uz })} ichida tugaydi
                      </p>
                    </div>
                  </div>
                ))}
                {data.notifications.lessonsWithoutPdf.map((lesson) => (
                  <div key={lesson.id} className="flex items-start gap-3 rounded-lg bg-red-50 px-3 py-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                      <p className="text-xs text-red-600">PDF yuklanmagan</p>
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
