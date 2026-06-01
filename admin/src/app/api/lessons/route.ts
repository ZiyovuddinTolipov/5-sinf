import { NextResponse, type NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { lessons, subjects } from "@/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const subjectId = req.nextUrl.searchParams.get("subject_id");

    const base = db
      .select({
        id: lessons.id,
        subject_id: lessons.subject_id,
        title: lessons.title,
        pdf_url: lessons.pdf_url,
        version: lessons.version,
        created_at: lessons.created_at,
        subject_name: subjects.name,
      })
      .from(lessons)
      .leftJoin(subjects, eq(lessons.subject_id, subjects.id));

    const rows = subjectId
      ? await base.where(eq(lessons.subject_id, subjectId)).orderBy(desc(lessons.created_at))
      : await base.orderBy(desc(lessons.created_at));

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        subject_id: r.subject_id,
        title: r.title,
        pdf_url: r.pdf_url,
        version: r.version,
        created_at: r.created_at,
        subjects: r.subject_name ? { name: r.subject_name } : null,
      })),
    );
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
