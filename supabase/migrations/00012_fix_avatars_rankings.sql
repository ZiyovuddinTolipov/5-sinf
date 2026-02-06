-- =============================================
-- Fix: avatars bucket, rankings RPC, backfill profiles
-- =============================================

-- 1) Create avatars storage bucket (lesson-pdfs only allows PDF mime types)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');

-- 2) RPC: rankings with profiles (avoids PostgREST FK join issue)
CREATE OR REPLACE FUNCTION get_rankings_with_profiles(p_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  total_points INT,
  tests_taken INT,
  rank_position INT,
  updated_at TIMESTAMPTZ,
  full_name TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id, r.user_id, r.total_points, r.tests_taken, r.rank_position, r.updated_at,
    p.full_name, p.avatar_url
  FROM rankings r
  LEFT JOIN profiles p ON p.user_id = r.user_id
  ORDER BY r.rank_position ASC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_ranking(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  total_points INT,
  tests_taken INT,
  rank_position INT,
  updated_at TIMESTAMPTZ,
  full_name TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id, r.user_id, r.total_points, r.tests_taken, r.rank_position, r.updated_at,
    p.full_name, p.avatar_url
  FROM rankings r
  LEFT JOIN profiles p ON p.user_id = r.user_id
  WHERE r.user_id = p_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Backfill profiles for existing users who don't have one
INSERT INTO profiles (user_id, full_name, created_at, updated_at)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', SPLIT_PART(u.email, '@', 1)),
  now(),
  now()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;
