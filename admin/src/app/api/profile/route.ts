import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.user_id, user.id))
    .limit(1);
  return NextResponse.json(row ?? null);
}

export async function PATCH(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }

  const body = (await req.json()) as {
    full_name?: string | null;
    avatar_url?: string | null;
  };

  const updates: Record<string, unknown> = { updated_at: sql`now()` };
  if (body.full_name !== undefined) updates.full_name = body.full_name;
  if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;

  await db
    .insert(profiles)
    .values({
      user_id: user.id,
      full_name: body.full_name ?? null,
      avatar_url: body.avatar_url ?? null,
    })
    .onConflictDoUpdate({ target: profiles.user_id, set: updates });

  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.user_id, user.id))
    .limit(1);
  return NextResponse.json(row ?? null);
}
