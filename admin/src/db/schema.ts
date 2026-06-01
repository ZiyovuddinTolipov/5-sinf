import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============ better-auth tables ============

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============ Domain tables (snake_case JS keys to match UI types) ============

export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subject_id: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    pdf_url: text("pdf_url"),
    version: integer("version").notNull().default(1),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (t) => [index("idx_lessons_subject_id").on(t.subject_id)],
);

export const tests = pgTable(
  "tests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subject_id: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    start_time: timestamp("start_time", { withTimezone: true, mode: "string" }).notNull(),
    end_time: timestamp("end_time", { withTimezone: true, mode: "string" }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_tests_subject_id").on(t.subject_id),
    index("idx_tests_time_window").on(t.start_time, t.end_time),
    check("valid_time_window", sql`${t.end_time} > ${t.start_time}`),
  ],
);

export const test_questions = pgTable(
  "test_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    test_id: uuid("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    options: jsonb("options").notNull(),
    correct_option: text("correct_option").notNull(),
    points: integer("points").notNull(),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_test_questions_test_id").on(t.test_id),
    check("correct_option_valid", sql`${t.correct_option} IN ('A','B','C','D')`),
    check("points_range", sql`${t.points} >= 1 AND ${t.points} <= 5`),
  ],
);

export const user_lessons = pgTable(
  "user_lessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lesson_id: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    downloaded: boolean("downloaded").notNull().default(false),
    downloaded_version: integer("downloaded_version").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("user_lessons_user_id_lesson_id_key").on(t.user_id, t.lesson_id),
    index("idx_user_lessons_user_id").on(t.user_id),
    index("idx_user_lessons_lesson_id").on(t.lesson_id),
  ],
);

export const user_tests = pgTable(
  "user_tests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    question_id: uuid("question_id")
      .notNull()
      .references(() => test_questions.id, { onDelete: "cascade" }),
    selected_option: text("selected_option").notNull(),
    points_earned: integer("points_earned").notNull().default(0),
    ranking_position: integer("ranking_position"),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("user_tests_user_id_question_id_key").on(t.user_id, t.question_id),
    index("idx_user_tests_user_id").on(t.user_id),
    index("idx_user_tests_question_id").on(t.question_id),
    check("selected_option_valid", sql`${t.selected_option} IN ('A','B','C','D')`),
  ],
);

export const rankings = pgTable(
  "rankings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    total_points: integer("total_points").notNull().default(0),
    tests_taken: integer("tests_taken").notNull().default(0),
    rank_position: integer("rank_position"),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (t) => [index("idx_rankings_total_points").on(t.total_points)],
);

export const admin_users = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    full_name: text("full_name"),
    avatar_url: text("avatar_url"),
    banned_until: timestamp("banned_until", { withTimezone: true, mode: "string" }),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (t) => [index("idx_profiles_user_id").on(t.user_id)],
);
