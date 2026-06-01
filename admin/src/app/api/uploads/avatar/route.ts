import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { deleteFileByPublicUrl, saveFile } from "@/lib/storage";

const MAX = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Fayl tanlanmadi" }, { status: 400 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Faqat rasm fayllar" }, { status: 400 });
  if (file.size > MAX)
    return NextResponse.json({ error: "Hajmi 5MB dan oshmasligi kerak" }, { status: 400 });

  const [existing] = await db
    .select({ avatar_url: profiles.avatar_url })
    .from(profiles)
    .where(eq(profiles.user_id, session.user.id))
    .limit(1);

  await deleteFileByPublicUrl(existing?.avatar_url);
  const url = await saveFile("avatars", file, session.user.id);

  await db
    .insert(profiles)
    .values({ user_id: session.user.id, avatar_url: url })
    .onConflictDoUpdate({
      target: profiles.user_id,
      set: { avatar_url: url, updated_at: sql`now()` },
    });

  return NextResponse.json({ url });
}
