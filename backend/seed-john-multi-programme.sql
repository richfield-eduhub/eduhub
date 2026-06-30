-- ═══════════════════════════════════════════════════════════
-- Seed Data: Make John Smith teach multiple programmes
-- ═══════════════════════════════════════════════════════════

-- 1. Ensure BBA qualification exists
INSERT INTO qualifications (id, code, name, faculty, duration_years, total_fee, is_active, created_at, updated_at)
VALUES ('22222222-2222-2222-2222-222222222222', 'BBA', 'Bachelor of Business Administration', 'Faculty of Business', 3, 75000.00, true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- 2. Create BBA modules (Year 1, Semester 1)
INSERT INTO modules (id, qualification_id, code, name, description, credits, year, semester, is_active, created_at, updated_at)
VALUES
  ('20000001-0001-4000-8000-000000000001', '22222222-2222-2222-2222-222222222222', 'BUS511', 'Business Management 511', 'Introduction to business management principles', 16, 1, 1, true, NOW(), NOW()),
  ('20000002-0002-4000-8000-000000000002', '22222222-2222-2222-2222-222222222222', 'ACC511', 'Accounting 511', 'Financial accounting fundamentals', 14, 1, 1, true, NOW(), NOW()),
  ('20000003-0003-4000-8000-000000000003', '22222222-2222-2222-2222-222222222222', 'ECO511', 'Economics 511', 'Microeconomics and macroeconomics basics', 12, 1, 1, true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

-- 3. Assign John Smith to teach BBA modules
INSERT INTO module_lecturers (id, module_id, lecturer_id, semester_id, is_primary, created_at, updated_at)
VALUES
  ('80000002-0001-4000-8000-000000000001', '20000001-0001-4000-8000-000000000001', '32000001-0000-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', true, NOW(), NOW()),
  ('80000002-0002-4000-8000-000000000001', '20000002-0002-4000-8000-000000000002', '32000001-0000-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', true, NOW(), NOW()),
  ('80000002-0003-4000-8000-000000000001', '20000003-0003-4000-8000-000000000003', '32000001-0000-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Create new students for BBA
-- Student 1: BBA only
INSERT INTO users (id, email, password_hash, role, account_status, is_verified, created_at, updated_at)
VALUES ('30000001-0000-4000-8000-000000000001', 'michael.jones@student.eduhub.ac.za', '$2b$10$YourHashHere', 'student', 'active', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_details (user_id, first_name, last_name, phone, date_of_birth, created_at, updated_at)
VALUES ('30000001-0000-4000-8000-000000000001', 'Michael', 'Jones', '+27821234567', '2004-03-15', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
VALUES ('43000001-0000-4000-8000-000000000001', '30000001-0000-4000-8000-000000000001', '2610000100', '22222222-2222-2222-2222-222222222222', 1, '2026-02-01', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Student 2: BBA only
INSERT INTO users (id, email, password_hash, role, account_status, is_verified, created_at, updated_at)
VALUES ('30000002-0000-4000-8000-000000000002', 'sarah.williams@student.eduhub.ac.za', '$2b$10$YourHashHere', 'student', 'active', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_details (user_id, first_name, last_name, phone, date_of_birth, created_at, updated_at)
VALUES ('30000002-0000-4000-8000-000000000002', 'Sarah', 'Williams', '+27821234568', '2003-07-22', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
VALUES ('43000002-0000-4000-8000-000000000002', '30000002-0000-4000-8000-000000000002', '2610000200', '22222222-2222-2222-2222-222222222222', 1, '2026-02-01', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Student 3: Double major (BSC-IT + BBA)
INSERT INTO users (id, email, password_hash, role, account_status, is_verified, created_at, updated_at)
VALUES ('30000003-0000-4000-8000-000000000003', 'david.nkosi@student.eduhub.ac.za', '$2b$10$YourHashHere', 'student', 'active', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_details (user_id, first_name, last_name, phone, date_of_birth, created_at, updated_at)
VALUES ('30000003-0000-4000-8000-000000000003', 'David', 'Nkosi', '+27821234569', '2003-11-08', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Create student record for BSC-IT (primary)
INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
VALUES ('43000003-0000-4000-8000-000000000003', '30000003-0000-4000-8000-000000000003', '2610000300', '11111111-1111-1111-1111-111111111111', 1, '2026-02-01', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Enroll BBA students in BBA modules
-- Michael Jones - all 3 BBA modules
INSERT INTO registrations (id, student_id, module_id, semester_id, status, registration_date, created_at, updated_at)
VALUES
  ('70000001-0001-4000-8000-000000000001', '43000001-0000-4000-8000-000000000001', '20000001-0001-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
  ('70000001-0002-4000-8000-000000000001', '43000001-0000-4000-8000-000000000001', '20000002-0002-4000-8000-000000000002', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
  ('70000001-0003-4000-8000-000000000001', '43000001-0000-4000-8000-000000000001', '20000003-0003-4000-8000-000000000003', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sarah Williams - all 3 BBA modules
INSERT INTO registrations (id, student_id, module_id, semester_id, status, registration_date, created_at, updated_at)
VALUES
  ('70000002-0001-4000-8000-000000000001', '43000002-0000-4000-8000-000000000002', '20000001-0001-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
  ('70000002-0002-4000-8000-000000000001', '43000002-0000-4000-8000-000000000002', '20000002-0002-4000-8000-000000000002', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
  ('70000002-0003-4000-8000-000000000001', '43000002-0000-4000-8000-000000000002', '20000003-0003-4000-8000-000000000003', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- David Nkosi - Double major: 2 BSC-IT modules + 2 BBA modules
INSERT INTO registrations (id, student_id, module_id, semester_id, status, registration_date, created_at, updated_at)
VALUES
  -- BSC-IT modules
  ('70000003-0001-4000-8000-000000000001', '43000003-0000-4000-8000-000000000003', '10000001-0001-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
  ('70000003-0002-4000-8000-000000000001', '43000003-0000-4000-8000-000000000003', '10000002-0002-4000-8000-000000000002', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
  -- BBA modules
  ('70000003-0003-4000-8000-000000000001', '43000003-0000-4000-8000-000000000003', '20000001-0001-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW()),
  ('70000003-0004-4000-8000-000000000001', '43000003-0000-4000-8000-000000000003', '20000002-0002-4000-8000-000000000002', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Make existing BSC-IT students take multiple modules from John
-- Let's update Thabo Molefe to take 2 modules (PROG511 + WEB511)
INSERT INTO registrations (id, student_id, module_id, semester_id, status, registration_date, created_at, updated_at)
VALUES
  ('70000004-0001-4000-8000-000000000001', '42000001-0000-4000-8000-000000000001', '10000002-0002-4000-8000-000000000002', '99000001-0000-4000-8000-000000000001', 'approved', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verification output
SELECT
  'John Smith teaches these programmes:' as info,
  q.code,
  q.name,
  COUNT(DISTINCT ml.module_id) as modules_count
FROM module_lecturers ml
JOIN modules m ON ml.module_id = m.id
JOIN qualifications q ON m.qualification_id = q.id
WHERE ml.lecturer_id = '32000001-0000-4000-8000-000000000001'
GROUP BY q.code, q.name;

SELECT
  'Student enrollments summary:' as info,
  COUNT(*) as total_registrations,
  COUNT(DISTINCT r.student_id) as unique_students
FROM registrations r
WHERE r.status = 'approved';
