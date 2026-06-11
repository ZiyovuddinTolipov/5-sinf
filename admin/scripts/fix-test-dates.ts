import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/db";
import { tests } from "../src/db/schema";
import { sql } from "drizzle-orm";

const NEW_END = "2026-06-30T23:59:59+05:00";

async function main() {
  const result = await db
    .update(tests)
    .set({ end_time: NEW_END })
    .where(sql`1=1`)
    .returning({ id: tests.id, name: tests.name });

  console.log(`Updated ${result.length} tests → end_time = ${NEW_END}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
