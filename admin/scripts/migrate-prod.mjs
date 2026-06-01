import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

function needsSsl(connectionString) {
  try {
    const u = new URL(connectionString);
    // Railway internal hostnames don't use SSL; proxy/external hosts do
    if (u.hostname.endsWith(".railway.internal")) return false;
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return false;
    return true;
  } catch {
    return false;
  }
}

const pool = new pg.Pool({
  connectionString: url,
  ssl: needsSsl(url) ? { rejectUnauthorized: false } : undefined,
});

console.log("Running migrations...");
await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
console.log("Migrations complete");
await pool.end();
