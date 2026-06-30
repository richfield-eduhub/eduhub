-- ═══════════════════════════════════════════════════════════
-- Final Seed: John Smith multi-programme with double major students
-- ═══════════════════════════════════════════════════════════

-- Use actual semester ID
\set SEMESTER_ID '3c18624a-2e62-406d-9d56-94353b95fbb7'
\set LECTURER_ID '32000001-0000-4000-8000-000000000001'
\set BBA_QUAL_ID 'a3dea4bb-f84f-444a-8913-129f50711af4'
\set BSCIT_QUAL_ID '727ff8ae-0470-42a0-b8c6-58daf0ee564d'

-- 1. Assign John Smith to teach BBA modules
INSERT INTO module_lecturers (id, module_id, lecturer_id, semester_id, is_primary, created_at, updated_at)
VALUES
  (gen_random_uuid(), '10000007-0007-4000-8000-000000000007', :'LECTURER_ID', :'SEMESTER_ID', true, NOW(), NOW()),
  (gen_random_uuid(), 'bba10004-0000-4000-8000-000000000004', :'LECTURER_ID', :'SEMESTER_ID', true, NOW(), NOW()),
  (gen_random_uuid(), 'bba10005-0000-4000-8000-000000000005', :'LECTURER_ID', :'SEMESTER_ID', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 2. Michael Jones - BBA only
WITH new_user AS (
  INSERT INTO users (id, email, password_hash, role, account_status, is_verified, created_at, updated_at)
  VALUES (gen_random_uuid(), 'michael.jones@student.eduhub.ac.za', '$2b$10$rKfSKT0JZfLGKvXH9pQxr.Gzcj2dF8bMhVZl8qV5y5SU.5sSvRUqK', 'student', 'active', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id
),
new_details AS (
  INSERT INTO user_details (user_id, first_name, last_name, phone, date_of_birth, created_at, updated_at)
  SELECT id, 'Michael', 'Jones', '+27821234567', '2004-03-15', NOW(), NOW()
  FROM new_user
  ON CONFLICT (user_id) DO NOTHING
  RETURNING user_id
),
new_student AS (
  INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
  SELECT gen_random_uuid(), id, '2610000100', :'BBA_QUAL_ID', 1, '2026-02-01', 'active', NOW(), NOW()
  FROM new_user
  ON CONFLICT (student_number) DO UPDATE SET student_number = EXCLUDED.student_number
  RETURNING id
)
INSERT INTO registrations (id, student_id, module_id, semester_id, status, registration_date, created_at, updated_at)
SELECT gen_random_uuid(), id, '10000007-0007-4000-8000-000000000007', :'SEMESTER_ID', 'approved', NOW(), NOW(), NOW() FROM new_student
UNION ALL
SELECT gen_random_uuid(), id, 'bba10004-0000-4000-8000-000000000004', :'SEMESTER_ID', 'approved', NOW(), NOW(), NOW() FROM new_student
UNION ALL
SELECT gen_random_uuid(), id, 'bba10005-0000-4000-8000-000000000005', :'SEMESTER_ID', 'approved', NOW(), NOW(), NOW() FROM new_student
ON CONFLICT DO NOTHING;

-- 3. Sarah Williams - BBA only
WITH new_user AS (
  INSERT INTO users (id, email, password_hash, role, account_status, is_verified, created_at, updated_at)
  VALUES (gen_random_uuid(), 'sarah.williams@student.eduhub.ac.za', '$2b$10$rKfSKT0JZfLGKvXH9pQxr.Gzcj2dF8bMhVZl8qV5y5SU.5sSvRUqK', 'student', 'active', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id
),
new_details AS (
  INSERT INTO user_details (user_id, first_name, last_name, phone, date_of_birth, created_at, updated_at)
  SELECT id, 'Sarah', 'Williams', '+27821234568', '2003-07-22', NOW(), NOW()
  FROM new_user
  ON CONFLICT (user_id) DO NOTHING
  RETURNING user_id
),
new_student AS (
  INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
  SELECT gen_random_uuid(), id, '2610000200', :'BBA_QUAL_ID', 1, '2026-02-01', 'active', NOW(), NOW()
  FROM new_user
  ON CONFLICT (student_number) DO UPDATE SET student_number = EXCLUDED.student_number
  RETURNING id
)
INSERT INTO registrations (id, student_id, module_id, semester_id, status, registration_date, created_at, updated_at)
SELECT gen_random_uuid(), id, '10000007-0007-4000-8000-000000000007', :'SEMESTER_ID', 'approved', NOW(), NOW(), NOW() FROM new_student
UNION ALL
SELECT gen_random_uuid(), id, 'bba10004-0000-4000-8000-000000000004', :'SEMESTER_ID', 'approved', NOW(), NOW(), NOW() FROM new_student
UNION ALL
SELECT gen_random_uuid(), id, 'bba10005-0000-4000-8000-000000000005', :'SEMESTER_ID', 'approved', NOW(), NOW(), NOW() FROM new_student
ON CONFLICT DO NOTHING;

-- 4. David Nkosi - Double major
WITH new_user AS (
  INSERT INTO users (id, email, password_hash, role, account_status, is_verified, created_at, updated_at)
  VALUES (gen_random_uuid(), 'david.nkosi@student.eduhub.ac.za', '$2b$10$rKfSKT0JZfLGKvXH9pQxr.Gzcj2dF8bMhVZl8qV5y5SU.5sSvRUqK', 'student', 'active', true, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id
),
new_details AS (
  INSERT INTO user_details (user_id, first_name, last_name, phone, date_of_birth, created_at, updated_at)
  SELECT id, 'David', 'Nkosi', '+27821234569', '2003-11-08', NOW(), NOW()
  FROM new_user
  ON CONFLICT (user_id) DO NOTHING
  RETURNING user_id
),
new_student AS (
  INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
  SELECT gen_random_uuid(), id, '2610000300', :'BSCIT_QUAL_ID', 1, '2026-02-01', 'active', NOW(), NOW()
  FROM new_user
  ON CONFLICT (student_number) DO UPDATE SET student_number = EXCLUDED.student_number
  RETURNING id
)
INSERT INTO registrations (id, student_id, module_id, semester_id, status, registration_date, created_at, updated_at)
SELECT gen_random_uuid(), id, 'ca3ceb85-5027-41cd-8d36-31aba49284b0', :'SEMESTER_ID', 'approved', NOW(), NOW(), NOW() FROM new_student -- PROG511
UNION ALL
SELECT gen_random_uuid(), id, '6a25a805-eb36-4358-b1af-df4057f57f0a', :'SEMESTER_ID', 'approved', NOW(), NOW(), NOW() FROM new_student -- WEB511
UNION ALL
SELECT gen_random_uuid(), id, '10000007-0007-4000-8000-000000000007', :'SEMESTER_ID', 'approved', NOW(), NOW(), NOW() FROM new_student -- BM511
UNION ALL
SELECT gen_random_uuid(), id, 'bba10004-0000-4000-8000-000000000004', :'SEMESTER_ID', 'approved', NOW(), NOW(), NOW() FROM new_student -- COM511
ON CONFLICT DO NOTHING;

-- 5. Add WEB511 to Thabo Molefe
INSERT INTO registrations (id, student_id, module_id, semester_id, status, registration_date, created_at, updated_at)
SELECT
  gen_random_uuid(),
  s.id,
  '6a25a805-eb36-4358-b1af-df4057f57f0a',
  :'SEMESTER_ID',
  'approved',
  NOW(),
  NOW(),
  NOW()
FROM students s
WHERE s.student_number = '2610000008'
ON CONFLICT DO NOTHING;

-- Verification
\echo '\n✅ SEED COMPLETE!\n'
SELECT
  q.code || ' - ' || q.name as programme,
  COUNT(DISTINCT ml.module_id) as modules
FROM module_lecturers ml
JOIN modules m ON ml.module_id = m.id
JOIN qualifications q ON m.qualification_id = q.id
WHERE ml.lecturer_id = :'LECTURER_ID'
GROUP BY q.code, q.name
ORDER BY q.code;

\echo '\n📊 Enrollment Summary:'
SELECT
  COUNT(DISTINCT r.student_id) as unique_students,
  COUNT(*) as total_registrations
FROM registrations r
WHERE r.status = 'approved';
