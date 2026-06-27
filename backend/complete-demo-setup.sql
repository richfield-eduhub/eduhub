-- ══════════════════════════════════════════════════════════════
-- Complete Demo Data Setup for EduHub
-- Creates fully populated demo accounts:
--   - admin@eduhub.ac.za
--   - john.smith@eduhub.ac.za (lecturer)
--   - thabo.molefe@student.eduhub.ac.za (student)
-- ══════════════════════════════════════════════════════════════

\echo '🎬 Setting up complete demo data...'

-- ══════════════════════════════════════════════════════════════
-- 1. Create Thabo's student account
-- ══════════════════════════════════════════════════════════════

\echo '   Creating Thabo student account...'

-- User account
INSERT INTO users (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
VALUES (
  '20000003-0000-4000-8000-000000000003',
  'thabo.molefe@student.eduhub.ac.za',
  '$2b$10$YQdCnz3mF5sH7vGJZ0cJ7OqXqZ9aJ5kQ8tJ7dL2nK4mP6oR8sT9uW',  -- Password123!
  'STUD-2026-0001',
  'student',
  'active',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- User details
INSERT INTO user_details (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, city, province, lifecycle_status, created_at, updated_at)
VALUES (
  '41000001-0000-4000-8000-000000000001',
  '20000003-0000-4000-8000-000000000003',
  'Thabo',
  'Molefe',
  '2004-03-15',
  'Male',
  'South African',
  '0403150001083',
  '0821234567',
  'Johannesburg',
  'Gauteng',
  'enrolled',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- Student record
INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
VALUES (
  '42000001-0000-4000-8000-000000000001',
  '20000003-0000-4000-8000-000000000003',
  'STUD-2026-0001',
  '727ff8ae-0470-42a0-b8c6-58daf0ee564d',  -- BSc IT
  1,
  '2026-02-01',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- Emergency contacts
INSERT INTO emergency_contacts (id, student_id, name, relationship, phone, is_primary, created_at, updated_at)
VALUES
  ('90000001-0001-4000-8000-000000000001', '42000001-0000-4000-8000-000000000001', 'Mary Molefe', 'Mother', '+27829876543', true, NOW(), NOW()),
  ('90000002-0002-4000-8000-000000000002', '42000001-0000-4000-8000-000000000001', 'Peter Molefe', 'Father', '+27829876544', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 2. Create 3 more students for John's classes
-- ══════════════════════════════════════════════════════════════

\echo '   Creating 3 additional students...'

-- Sarah Nkosi
INSERT INTO users (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
VALUES ('20000004-0000-4000-8000-000000000004', 'sarah.nkosi@student.eduhub.ac.za', '$2b$10$YQdCnz3mF5sH7vGJZ0cJ7OqXqZ9aJ5kQ8tJ7dL2nK4mP6oR8sT9uW', 'STUD-2026-0002', 'student', 'active', true, true, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO user_details (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, city, province, lifecycle_status, created_at, updated_at)
VALUES ('41000002-0000-4000-8000-000000000002', '20000004-0000-4000-8000-000000000004', 'Sarah', 'Nkosi', '2003-07-22', 'Female', 'South African', '0307220002084', '0823456789', 'Johannesburg', 'Gauteng', 'enrolled', NOW(), NOW()) ON CONFLICT (user_id) DO NOTHING;
INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
VALUES ('42000002-0000-4000-8000-000000000002', '20000004-0000-4000-8000-000000000004', 'STUD-2026-0002', '727ff8ae-0470-42a0-b8c6-58daf0ee564d', 1, '2026-02-01', 'active', NOW(), NOW()) ON CONFLICT (user_id) DO NOTHING;

-- Lebogang Dlamini
INSERT INTO users (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
VALUES ('20000005-0000-4000-8000-000000000005', 'lebo.dlamini@student.eduhub.ac.za', '$2b$10$YQdCnz3mF5sH7vGJZ0cJ7OqXqZ9aJ5kQ8tJ7dL2nK4mP6oR8sT9uW', 'STUD-2026-0003', 'student', 'active', true, true, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO user_details (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, city, province, lifecycle_status, created_at, updated_at)
VALUES ('41000003-0000-4000-8000-000000000003', '20000005-0000-4000-8000-000000000005', 'Lebogang', 'Dlamini', '2004-11-08', 'Female', 'South African', '0411080003085', '0829876543', 'Johannesburg', 'Gauteng', 'enrolled', NOW(), NOW()) ON CONFLICT (user_id) DO NOTHING;
INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
VALUES ('42000003-0000-4000-8000-000000000003', '20000005-0000-4000-8000-000000000005', 'STUD-2026-0003', '727ff8ae-0470-42a0-b8c6-58daf0ee564d', 1, '2026-02-01', 'active', NOW(), NOW()) ON CONFLICT (user_id) DO NOTHING;

-- Mandla Zulu
INSERT INTO users (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
VALUES ('20000006-0000-4000-8000-000000000006', 'mandla.zulu@student.eduhub.ac.za', '$2b$10$YQdCnz3mF5sH7vGJZ0cJ7OqXqZ9aJ5kQ8tJ7dL2nK4mP6oR8sT9uW', 'STUD-2026-0004', 'student', 'active', true, true, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO user_details (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, city, province, lifecycle_status, created_at, updated_at)
VALUES ('41000004-0000-4000-8000-000000000004', '20000006-0000-4000-8000-000000000006', 'Mandla', 'Zulu', '2003-05-14', 'Male', 'South African', '0305140004086', '0827654321', 'Johannesburg', 'Gauteng', 'enrolled', NOW(), NOW()) ON CONFLICT (user_id) DO NOTHING;
INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
VALUES ('42000004-0000-4000-8000-000000000004', '20000006-0000-4000-8000-000000000006', 'STUD-2026-0004', '727ff8ae-0470-42a0-b8c6-58daf0ee564d', 1, '2026-02-01', 'active', NOW(), NOW()) ON CONFLICT (user_id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 3. Use existing semester (already created)
-- ══════════════════════════════════════════════════════════════

\echo '   Using existing semester 2026-1...'

-- Semester already exists: 3c18624a-2e62-406d-9d56-94353b95fbb7

-- ══════════════════════════════════════════════════════════════
-- 4. Create John Smith lecturer record
-- ══════════════════════════════════════════════════════════════

\echo '   Creating John Smith lecturer record...'

INSERT INTO lecturers (id, user_id, employee_number, department, title, specialization, hire_date, created_at, updated_at)
VALUES (
  '32000001-0000-4000-8000-000000000001',
  '20000002-0000-4000-8000-000000000002',
  'EMP2024001',
  'Information Technology',
  'Dr.',
  'Software Engineering & Web Development',
  '2020-01-15',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 5. Assign John to modules (PROG511, WEB511, IT511)
-- ══════════════════════════════════════════════════════════════

\echo '   Assigning John to modules...'

INSERT INTO module_lecturers (id, module_id, lecturer_id, semester_id, is_primary, created_at)
VALUES
  (gen_random_uuid(), 'ca3ceb85-5027-41cd-8d36-31aba49284b0', '32000001-0000-4000-8000-000000000001', '3c18624a-2e62-406d-9d56-94353b95fbb7', true, NOW()),  -- PROG511
  (gen_random_uuid(), '6a25a805-eb36-4358-b1af-df4057f57f0a', '32000001-0000-4000-8000-000000000001', '3c18624a-2e62-406d-9d56-94353b95fbb7', true, NOW()),  -- WEB511
  (gen_random_uuid(), 'e2213c05-7621-4c41-a384-9367a1f3b90a', '32000001-0000-4000-8000-000000000001', '3c18624a-2e62-406d-9d56-94353b95fbb7', true, NOW())   -- IT511
ON CONFLICT (module_id, lecturer_id, semester_id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 6. Enroll all 4 students in all 3 modules
-- ══════════════════════════════════════════════════════════════

\echo '   Enrolling students in modules...'

INSERT INTO registrations (id, student_id, module_id, semester_id, status, created_at, updated_at)
SELECT
  gen_random_uuid(),
  s.id,
  m.id,
  '3c18624a-2e62-406d-9d56-94353b95fbb7',
  'approved',
  NOW(),
  NOW()
FROM students s
CROSS JOIN modules m
WHERE s.id IN (
  '42000001-0000-4000-8000-000000000001',  -- Thabo
  '42000002-0000-4000-8000-000000000002',  -- Sarah
  '42000003-0000-4000-8000-000000000003',  -- Lebo
  '42000004-0000-4000-8000-000000000004'   -- Mandla
)
AND m.id IN (
  'ca3ceb85-5027-41cd-8d36-31aba49284b0',  -- PROG511
  '6a25a805-eb36-4358-b1af-df4057f57f0a',  -- WEB511
  'e2213c05-7621-4c41-a384-9367a1f3b90a'   -- IT511
)
ON CONFLICT (student_id, module_id, semester_id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 7. Add announcements from John
-- ══════════════════════════════════════════════════════════════

\echo '   Creating announcements...'

INSERT INTO announcements (id, module_id, created_by, title, content, priority, created_at, updated_at)
VALUES
  ('85000001-0001-4000-8000-000000000001', 'ca3ceb85-5027-41cd-8d36-31aba49284b0', '20000002-0000-4000-8000-000000000002', 'Welcome to Programming 511!', 'Welcome to Programming 511! This semester we will cover Python and Java fundamentals. Please ensure you have your development environment set up by next week. Check the course materials on the portal.', 'normal', NOW(), NOW()),
  ('85000002-0002-4000-8000-000000000002', 'ca3ceb85-5027-41cd-8d36-31aba49284b0', '20000002-0000-4000-8000-000000000002', 'URGENT: Midterm Exam Schedule', 'The Programming 511 midterm exam will be held on April 10th, 2026 at 09:00 in the Main Exam Hall. This is a 2-hour exam covering all material from weeks 1-6. No rescheduling will be allowed except for medical emergencies.', 'urgent', NOW(), NOW()),
  ('85000003-0003-4000-8000-000000000003', '6a25a805-eb36-4358-b1af-df4057f57f0a', '20000002-0000-4000-8000-000000000002', 'Web Development Project Guidelines', 'Your final project for Web Development 511 requires building a responsive website using HTML5, CSS3, and JavaScript. Form groups of 3-4 students by next week. Project proposals are due March 1st.', 'high', NOW(), NOW()),
  ('85000004-0004-4000-8000-000000000004', 'e2213c05-7621-4c41-a384-9367a1f3b90a', '20000002-0000-4000-8000-000000000002', 'Introduction to Information Systems', 'Welcome to IT511! We will explore how information systems support business operations. First assignment will be posted next Monday.', 'normal', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- Verification
-- ══════════════════════════════════════════════════════════════

\echo ''
\echo '✅ Demo data setup complete!'
\echo ''
\echo '📊 Summary:'

SELECT 'Total Students' as metric, COUNT(*)::text as value FROM students WHERE id IN ('42000001-0000-4000-8000-000000000001', '42000002-0000-4000-8000-000000000002', '42000003-0000-4000-8000-000000000003', '42000004-0000-4000-8000-000000000004')
UNION ALL
SELECT 'Total Lecturers', COUNT(*)::text FROM lecturers WHERE id = '32000001-0000-4000-8000-000000000001'
UNION ALL
SELECT 'John''s Modules', COUNT(*)::text FROM module_lecturers WHERE lecturer_id = '32000001-0000-4000-8000-000000000001'
UNION ALL
SELECT 'Total Registrations', COUNT(*)::text FROM registrations WHERE semester_id = '3c18624a-2e62-406d-9d56-94353b95fbb7'
UNION ALL
SELECT 'Total Announcements', COUNT(*)::text FROM announcements WHERE created_by = '20000002-0000-4000-8000-000000000002';

\echo ''
\echo '🔐 Login Credentials:'
\echo '   Admin: admin@eduhub.ac.za / Password123!'
\echo '   Lecturer: john.smith@eduhub.ac.za / Password123!'
\echo '   Student: thabo.molefe@student.eduhub.ac.za / Password123!'
\echo ''
