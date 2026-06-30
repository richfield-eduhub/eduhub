-- ═══════════════════════════════════════════════════════════
-- Seed: John Smith teaches BSC-IT + BBA, with double major students
-- ═══════════════════════════════════════════════════════════

-- 1. Assign John Smith to teach BBA modules (BM511, COM511, MKT511)
INSERT INTO module_lecturers (id, module_id, lecturer_id, semester_id, is_primary, created_at, updated_at)
VALUES
  (gen_random_uuid(), '10000007-0007-4000-8000-000000000007', '32000001-0000-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', true, NOW(), NOW()),
  (gen_random_uuid(), 'bba10004-0000-4000-8000-000000000004', '32000001-0000-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', true, NOW(), NOW()),
  (gen_random_uuid(), 'bba10005-0000-4000-8000-000000000005', '32000001-0000-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 2. Create new BBA students
-- Michael Jones - BBA only
DO $$
DECLARE
  user_id_michael UUID := gen_random_uuid();
  student_id_michael UUID := gen_random_uuid();
BEGIN
  INSERT INTO users (id, email, password_hash, role, account_status, is_verified, created_at, updated_at)
  VALUES (user_id_michael, 'michael.jones@student.eduhub.ac.za', '$2b$10$rKfSKT0JZfLGKvXH9pQxr.Gzcj2dF8bMhVZl8qV5y5SU.5sSvRUqK', 'student', 'active', true, NOW(), NOW())
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO user_details (user_id, first_name, last_name, phone, date_of_birth, created_at, updated_at)
  VALUES (user_id_michael, 'Michael', 'Jones', '+27821234567', '2004-03-15', NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
  VALUES (student_id_michael, user_id_michael, '2610000100', 'a3dea4bb-f84f-444a-8913-129f50711af4', 1, '2026-02-01', 'active', NOW(), NOW())
  ON CONFLICT (student_number) DO NOTHING;

  -- Enroll in 3 BBA modules
  INSERT INTO registrations (id, student_id, module_id, semester_id, status, registration_date, created_at, updated_at)
  VALUES
    (gen_random_uuid(), student_id_michael, '10000007-0007-4000-8000-000000000007', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
    (gen_random_uuid(), student_id_michael, 'bba10004-0000-4000-8000-000000000004', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
    (gen_random_uuid(), student_id_michael, 'bba10005-0000-4000-8000-000000000005', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW())
  ON CONFLICT DO NOTHING;
END$$;

-- Sarah Williams - BBA only
DO $$
DECLARE
  user_id_sarah UUID := gen_random_uuid();
  student_id_sarah UUID := gen_random_uuid();
BEGIN
  INSERT INTO users (id, email, password_hash, role, account_status, is_verified, created_at, updated_at)
  VALUES (user_id_sarah, 'sarah.williams@student.eduhub.ac.za', '$2b$10$rKfSKT0JZfLGKvXH9pQxr.Gzcj2dF8bMhVZl8qV5y5SU.5sSvRUqK', 'student', 'active', true, NOW(), NOW())
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO user_details (user_id, first_name, last_name, phone, date_of_birth, created_at, updated_at)
  VALUES (user_id_sarah, 'Sarah', 'Williams', '+27821234568', '2003-07-22', NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
  VALUES (student_id_sarah, user_id_sarah, '2610000200', 'a3dea4bb-f84f-444a-8913-129f50711af4', 1, '2026-02-01', 'active', NOW(), NOW())
  ON CONFLICT (student_number) DO NOTHING;

  -- Enroll in 3 BBA modules
  INSERT INTO registrations (id, student_id, module_id, semester_id, status, registration_date, created_at, updated_at)
  VALUES
    (gen_random_uuid(), student_id_sarah, '10000007-0007-4000-8000-000000000007', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
    (gen_random_uuid(), student_id_sarah, 'bba10004-0000-4000-8000-000000000004', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
    (gen_random_uuid(), student_id_sarah, 'bba10005-0000-4000-8000-000000000005', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW())
  ON CONFLICT DO NOTHING;
END$$;

-- 3. David Nkosi - Double major (BSC-IT + BBA)
DO $$
DECLARE
  user_id_david UUID := gen_random_uuid();
  student_id_david UUID := gen_random_uuid();
BEGIN
  INSERT INTO users (id, email, password_hash, role, account_status, is_verified, created_at, updated_at)
  VALUES (user_id_david, 'david.nkosi@student.eduhub.ac.za', '$2b$10$rKfSKT0JZfLGKvXH9pQxr.Gzcj2dF8bMhVZl8qV5y5SU.5sSvRUqK', 'student', 'active', true, NOW(), NOW())
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO user_details (user_id, first_name, last_name, phone, date_of_birth, created_at, updated_at)
  VALUES (user_id_david, 'David', 'Nkosi', '+27821234569', '2003-11-08', NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
  VALUES (student_id_david, user_id_david, '2610000300', '727ff8ae-0470-42a0-b8c6-58daf0ee564d', 1, '2026-02-01', 'active', NOW(), NOW())
  ON CONFLICT (student_number) DO NOTHING;

  -- Double major: 2 BSC-IT modules + 2 BBA modules
  INSERT INTO registrations (id, student_id, module_id, semester_id, status, registration_date, created_at, updated_at)
  VALUES
    -- BSC-IT modules
    (gen_random_uuid(), student_id_david, 'ca3ceb85-5027-41cd-8d36-31aba49284b0', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
    (gen_random_uuid(), student_id_david, '6a25a805-eb36-4358-b1af-df4057f57f0a', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
    -- BBA modules
    (gen_random_uuid(), student_id_david, '10000007-0007-4000-8000-000000000007', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
    (gen_random_uuid(), student_id_david, 'bba10004-0000-4000-8000-000000000004', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW())
  ON CONFLICT DO NOTHING;
END$$;

-- 4. Make Thabo Molefe take 2 modules (PROG511 + WEB511)
INSERT INTO registrations (id, student_id, module_id, semester_id, status, registration_date, created_at, updated_at)
SELECT
  gen_random_uuid(),
  s.id,
  '6a25a805-eb36-4358-b1af-df4057f57f0a',
  '99000001-0000-4000-8000-000000000001',
  'approved',
  NOW(),
  NOW(),
  NOW()
FROM students s
WHERE s.student_number = '2610000008'
ON CONFLICT DO NOTHING;

-- Verification
\echo '\n✅ SEED COMPLETE\n'
\echo '📊 Summary:'
SELECT
  'Programmes John teaches' as metric,
  COUNT(DISTINCT q.code) as count
FROM module_lecturers ml
JOIN modules m ON ml.module_id = m.id
JOIN qualifications q ON m.qualification_id = q.id
WHERE ml.lecturer_id = '32000001-0000-4000-8000-000000000001'

UNION ALL

SELECT
  'Total modules John teaches',
  COUNT(DISTINCT ml.module_id)
FROM module_lecturers ml
WHERE ml.lecturer_id = '32000001-0000-4000-8000-000000000001'

UNION ALL

SELECT
  'Total students enrolled',
  COUNT(DISTINCT r.student_id)
FROM registrations r
WHERE r.status = 'approved'

UNION ALL

SELECT
  'Total registrations',
  COUNT(*)
FROM registrations
WHERE status = 'approved';
