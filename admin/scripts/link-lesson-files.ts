import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "fs";
import { join } from "path";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { lessons } from "../src/db/schema";

async function main() {
  const mapping: Record<string, string> = JSON.parse(
    readFileSync(join(__dirname, "../../lesson_file_mapping.json"), "utf-8"),
  );

  const allLessons = await db.select({ id: lessons.id, title: lessons.title }).from(lessons);
  console.log(`Found ${allLessons.length} lessons in DB\n`);

  let updated = 0;
  let skipped = 0;

  for (const lesson of allLessons) {
    const pdfUrl = mapping[lesson.title];
    if (!pdfUrl) {
      console.log(`  SKIP (no file): ${lesson.title}`);
      skipped++;
      continue;
    }
    await db.update(lessons).set({ pdf_url: pdfUrl }).where(eq(lessons.id, lesson.id));
    console.log(`  OK: ${lesson.title}`);
    updated++;
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
