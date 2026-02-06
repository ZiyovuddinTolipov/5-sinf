-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 options: [{label: "A", text: "..."}, ...]
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  points INTEGER NOT NULL CHECK (points >= 1 AND points <= 5),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT valid_time_window CHECK (end_time > start_time)
);

CREATE INDEX idx_tests_subject_id ON tests(subject_id);
CREATE INDEX idx_tests_time_window ON tests(start_time, end_time);

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
