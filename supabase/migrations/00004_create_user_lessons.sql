-- Create user_lessons table (tracks which lessons users have downloaded)
CREATE TABLE IF NOT EXISTS user_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  downloaded BOOLEAN DEFAULT false NOT NULL,
  downloaded_version INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_lessons_user_id ON user_lessons(user_id);
CREATE INDEX idx_user_lessons_lesson_id ON user_lessons(lesson_id);

ALTER TABLE user_lessons ENABLE ROW LEVEL SECURITY;
