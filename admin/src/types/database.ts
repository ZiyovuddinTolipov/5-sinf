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

export interface AdminUser {
  id: string;
  user_id: string;
  created_at: string;
}

export interface Student {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  banned_until: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}
