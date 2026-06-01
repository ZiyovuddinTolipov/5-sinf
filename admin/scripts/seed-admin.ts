import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { admin_users, user as userTable } from "../src/db/schema";
import { auth } from "../src/lib/auth";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD env vars");
    process.exit(1);
  }

  const [existing] = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  let userId = existing?.id;

  if (!userId) {
    const res = await auth.api.signUpEmail({
      body: { email, password, name },
    });
    userId = res.user.id;
    console.log("Created user:", email);
  } else {
    console.log("User already exists:", email);
  }

  const [existingAdmin] = await db
    .select({ id: admin_users.id })
    .from(admin_users)
    .where(eq(admin_users.user_id, userId))
    .limit(1);

  if (!existingAdmin) {
    await db.insert(admin_users).values({ user_id: userId });
    console.log("Granted admin role");
  } else {
    console.log("Already admin");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
