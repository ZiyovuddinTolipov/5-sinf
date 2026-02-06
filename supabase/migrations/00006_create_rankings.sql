-- Create rankings table
CREATE TABLE IF NOT EXISTS rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0 NOT NULL,
  tests_taken INTEGER DEFAULT 0 NOT NULL,
  rank_position INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_rankings_total_points ON rankings(total_points DESC);

ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

-- Function to recalculate rankings after a user_test insert
CREATE OR REPLACE FUNCTION recalculate_rankings()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert the user's ranking
  INSERT INTO rankings (user_id, total_points, tests_taken, updated_at)
  SELECT
    NEW.user_id,
    COALESCE(SUM(ut.points_earned), 0),
    COUNT(ut.id),
    now()
  FROM user_tests ut
  WHERE ut.user_id = NEW.user_id
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_points = EXCLUDED.total_points,
    tests_taken = EXCLUDED.tests_taken,
    updated_at = now();

  -- Recalculate all rank positions
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, tests_taken DESC) AS new_rank
    FROM rankings
  )
  UPDATE rankings r
  SET rank_position = ranked.new_rank
  FROM ranked
  WHERE r.id = ranked.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user_tests insert
CREATE TRIGGER on_user_test_insert
  AFTER INSERT ON user_tests
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_rankings();
