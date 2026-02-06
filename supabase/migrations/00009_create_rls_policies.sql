-- =============================================
-- RLS Policies for all tables
-- =============================================

-- SUBJECTS: authenticated read, admin write
CREATE POLICY "Anyone authenticated can read subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert subjects"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update subjects"
  ON subjects FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete subjects"
  ON subjects FOR DELETE
  TO authenticated
  USING (is_admin());

-- LESSONS: authenticated read, admin write
CREATE POLICY "Anyone authenticated can read lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update lessons"
  ON lessons FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING (is_admin());

-- TESTS: authenticated read, admin write
CREATE POLICY "Anyone authenticated can read tests"
  ON tests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert tests"
  ON tests FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update tests"
  ON tests FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete tests"
  ON tests FOR DELETE
  TO authenticated
  USING (is_admin());

-- USER_LESSONS: users can read/write own data, admins can read all
CREATE POLICY "Users can read own user_lessons"
  ON user_lessons FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own user_lessons"
  ON user_lessons FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own user_lessons"
  ON user_lessons FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- USER_TESTS: users can read/write own data, admins can read all
CREATE POLICY "Users can read own user_tests"
  ON user_tests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own user_tests"
  ON user_tests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RANKINGS: anyone authenticated can read
CREATE POLICY "Anyone authenticated can read rankings"
  ON rankings FOR SELECT
  TO authenticated
  USING (true);

-- ADMIN_USERS: only admins can read
CREATE POLICY "Admins can read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (is_admin());

-- =============================================
-- Storage Policies for lesson-pdfs bucket
-- =============================================

CREATE POLICY "Anyone can read lesson PDFs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'lesson-pdfs');

CREATE POLICY "Admins can upload lesson PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lesson-pdfs' AND is_admin());

CREATE POLICY "Admins can update lesson PDFs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'lesson-pdfs' AND is_admin());

CREATE POLICY "Admins can delete lesson PDFs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'lesson-pdfs' AND is_admin());
