-- =============================================
-- Profiles table + get_user_test_results function
-- =============================================

-- 1) Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone authenticated can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 2) Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    now(),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3) Auto-update updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- 4) Function to get user test results
CREATE OR REPLACE FUNCTION get_user_test_results(p_user_id UUID, p_limit INT DEFAULT 5)
RETURNS TABLE (
  test_id UUID,
  test_name TEXT,
  subject_name TEXT,
  total_points INT,
  earned_points INT,
  total_questions INT,
  correct_answers INT,
  completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id AS test_id,
    t.name AS test_name,
    s.name AS subject_name,
    COALESCE(SUM(tq.points), 0)::INT AS total_points,
    COALESCE(SUM(ut.points_earned), 0)::INT AS earned_points,
    COUNT(DISTINCT tq.id)::INT AS total_questions,
    COUNT(DISTINCT CASE WHEN ut.points_earned > 0 THEN tq.id END)::INT AS correct_answers,
    MAX(ut.created_at) AS completed_at
  FROM tests t
  INNER JOIN subjects s ON s.id = t.subject_id
  INNER JOIN test_questions tq ON tq.test_id = t.id
  INNER JOIN user_tests ut ON ut.question_id = tq.id AND ut.user_id = p_user_id
  GROUP BY t.id, t.name, s.name
  ORDER BY MAX(ut.created_at) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
