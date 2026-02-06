-- Create user_tests table (tracks user test submissions)
CREATE TABLE IF NOT EXISTS user_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  points_earned INTEGER DEFAULT 0 NOT NULL,
  ranking_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(user_id, test_id)
);

CREATE INDEX idx_user_tests_user_id ON user_tests(user_id);
CREATE INDEX idx_user_tests_test_id ON user_tests(test_id);

ALTER TABLE user_tests ENABLE ROW LEVEL SECURITY;
