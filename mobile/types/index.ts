export interface Subject {
  id: string;
  name: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  subject_id: string;
  title: string;
  pdf_url: string | null;
  version: number;
  created_at: string;
}

export interface Test {
  id: string;
  subject_id: string;
  name: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface TestQuestion {
  id: string;
  test_id: string;
  question: string;
  options: TestOption[];
  correct_option: "A" | "B" | "C" | "D";
  points: number;
  sort_order: number;
  created_at: string;
}

export interface TestOption {
  label: "A" | "B" | "C" | "D";
  text: string;
}

export interface UserLesson {
  id: string;
  user_id: string;
  lesson_id: string;
  downloaded: boolean;
  downloaded_version: number;
  created_at: string;
}

export interface UserTest {
  id: string;
  user_id: string;
  question_id: string;
  selected_option: "A" | "B" | "C" | "D";
  points_earned: number;
  ranking_position: number | null;
  created_at: string;
}

export interface Ranking {
  id: string;
  user_id: string;
  total_points: number;
  tests_taken: number;
  rank_position: number | null;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  test_id: string;
  test_name: string;
  subject_name: string;
  total_points: number;
  earned_points: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
}

export type LessonWithSubject = Lesson & {
  subjects: { name: string } | null;
};

export type TestWithSubject = Test & {
  subjects: { name: string } | null;
  test_questions: { count: number }[];
};

export type RankingWithProfile = Ranking & {
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};
