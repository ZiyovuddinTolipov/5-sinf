import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  try {
    await requireUser();
    const rows = await db.select().from(subjects).orderBy(asc(subjects.name));
    return NextResponse.json(rows);
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
