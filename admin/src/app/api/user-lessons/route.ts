import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { user_lessons } from "@/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }

  const body = (await req.json()) as {
    lesson_id: string;
    downloaded?: boolean;
    downloaded_version?: number;
  };

  await db
    .insert(user_lessons)
    .values({
      user_id: user.id,
      lesson_id: body.lesson_id,
      downloaded: body.downloaded ?? false,
      downloaded_version: body.downloaded_version ?? 0,
    })
    .onConflictDoUpdate({
      target: [user_lessons.user_id, user_lessons.lesson_id],
      set: {
        downloaded: body.downloaded ?? sql`${user_lessons.downloaded}`,
        downloaded_version: body.downloaded_version ?? sql`${user_lessons.downloaded_version}`,
      },
    });

  return NextResponse.json({ success: true });
}
