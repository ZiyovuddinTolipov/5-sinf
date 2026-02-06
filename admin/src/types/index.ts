export type { Subject, Lesson, Test, TestQuestion, TestOption, UserLesson, UserTest, Ranking, AdminUser } from "./database";

import type { Subject, Lesson, Test, TestQuestion } from "./database";

export type SubjectWithCount = Subject & {
  lessons_count: number;
  tests_count: number;
};

export type LessonWithSubject = Lesson & {
  subjects: {
    name: string;
  } | null;
};

export type TestWithSubject = Test & {
  subjects: {
    name: string;
  } | null;
  test_questions: { count: number }[];
};

export type TestQuestionRow = TestQuestion;

export interface RankingEntry {
  id: string;
  user_id: string;
  total_points: number;
  tests_taken: number;
  rank_position: number | null;
  updated_at: string;
  user_email: string | null;
  user_name: string | null;
}
