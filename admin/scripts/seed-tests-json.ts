import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "fs";
import { join } from "path";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { subjects, tests, test_questions } from "../src/db/schema";

interface QuestionOption {
  label: string;
  text: string;
}

interface Question {
  test_id: string;
  question: string;
  options: QuestionOption[];
  correct_option: string;
  points: number;
  sort_order: number;
}

interface TopicData {
  topic: string;
  questions: Question[];
}

const END_TIME = "2026-06-30T23:59:59+05:00";
const START_TIME = new Date().toISOString();
const SUBJECT_NAME = "Tarix";

async function main() {
  const jsonPath = join(__dirname, "../../tests.json");
  const data: TopicData[] = JSON.parse(readFileSync(jsonPath, "utf-8"));

  // Find or create subject
  let [subject] = await db
    .select()
    .from(subjects)
    .where(eq(subjects.name, SUBJECT_NAME))
    .limit(1);

  if (!subject) {
    [subject] = await db
      .insert(subjects)
      .values({ name: SUBJECT_NAME })
      .returning();
    console.log(`Created subject: ${SUBJECT_NAME}`);
  } else {
    console.log(`Found subject: ${SUBJECT_NAME} (${subject.id})`);
  }

  let totalTests = 0;
  let totalQuestions = 0;

  for (const topicData of data) {
    const [test] = await db
      .insert(tests)
      .values({
        subject_id: subject.id,
        name: topicData.topic,
        start_time: START_TIME,
        end_time: END_TIME,
      })
      .returning();

    console.log(`  Created test: ${topicData.topic} (${test.id})`);
    totalTests++;

    const questionRows = topicData.questions.map((q) => ({
      test_id: test.id,
      question: q.question,
      options: q.options,
      correct_option: q.correct_option,
      points: q.points,
      sort_order: q.sort_order,
    }));

    await db.insert(test_questions).values(questionRows);
    console.log(`    Inserted ${questionRows.length} questions`);
    totalQuestions += questionRows.length;
  }

  console.log(`\nDone: ${totalTests} tests, ${totalQuestions} questions`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
