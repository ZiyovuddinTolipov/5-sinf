-- =============================================
-- Restructure tests: Test (parent) → Test Questions (children)
-- =============================================

-- 1) Create test_questions table
CREATE TABLE IF NOT EXISTS test_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  points INTEGER NOT NULL CHECK (points >= 1 AND points <= 5),
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_test_questions_test_id ON test_questions(test_id);
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

-- 2) Migrate existing test data into test_questions
INSERT INTO test_questions (test_id, question, options, correct_option, points, sort_order)
SELECT id, question, options, correct_option, points, 0
FROM tests;

-- 3) Transform tests table: remove question columns, add name column
ALTER TABLE tests ADD COLUMN "name" TEXT;
UPDATE tests SET "name" = question;
ALTER TABLE tests ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE tests DROP COLUMN question;
ALTER TABLE tests DROP COLUMN options;
ALTER TABLE tests DROP COLUMN correct_option;
ALTER TABLE tests DROP COLUMN points;

-- 4) Update user_tests: test_id → question_id (references test_questions)
ALTER TABLE user_tests RENAME COLUMN test_id TO question_id;
ALTER TABLE user_tests DROP CONSTRAINT user_tests_test_id_fkey;
ALTER TABLE user_tests ADD CONSTRAINT user_tests_question_id_fkey
  FOREIGN KEY (question_id) REFERENCES test_questions(id) ON DELETE CASCADE;
DROP INDEX IF EXISTS idx_user_tests_test_id;
CREATE INDEX idx_user_tests_question_id ON user_tests(question_id);

-- Update UNIQUE constraint
ALTER TABLE user_tests DROP CONSTRAINT user_tests_user_id_test_id_key;
ALTER TABLE user_tests ADD CONSTRAINT user_tests_user_id_question_id_key UNIQUE(user_id, question_id);

-- 5) RLS policies for test_questions
CREATE POLICY "Anyone authenticated can read test_questions"
  ON test_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert test_questions"
  ON test_questions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update test_questions"
  ON test_questions FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete test_questions"
  ON test_questions FOR DELETE
  TO authenticated
  USING (is_admin());
