--
-- Complete Demo Data Setup for EduHub
-- Run this to set up the 3 main demo accounts with complete data
--

-- ═══════════════════════════════════════════════════════════
-- STEP 1: Ensure the 3 demo accounts exist
-- ═══════════════════════════════════════════════════════════

-- Check if users exist
DO $$
DECLARE
  admin_id UUID := '20000001-0000-4000-8000-000000000001';
  lecturer_id UUID := '20000002-0000-4000-8000-000000000002';
  student_id UUID := '20000003-0000-4000-8000-000000000003';
BEGIN
  RAISE NOTICE 'Demo accounts should already exist from previous migration';
  RAISE NOTICE 'Admin: admin@eduhub.ac.za';
  RAISE NOTICE 'Lecturer: john.smith@eduhub.ac.za';
  RAISE NOTICE 'Student: thabo.molefe@student.eduhub.ac.za';
END$$;

-- ═══════════════════════════════════════════════════════════
-- STEP 2: Ensure BSc IT qualification exists
-- ═══════════════════════════════════════════════════════════

INSERT INTO qualifications (id, code, name, faculty, duration_years, total_fee, is_active, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'BSC-IT', 'Bachelor of Science in Information Technology', 'Faculty of Information Technology', 3, 85000.00, true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- ═══════════════════════════════════════════════════════════
-- STEP 3: Create/update Thabo's student record
-- ═══════════════════════════════════════════════════════════

INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
VALUES (
  '42000001-0000-4000-8000-000000000001',
  '20000003-0000-4000-8000-000000000003',
  'STUD-2026-0001',
  '11111111-1111-1111-1111-111111111111',
  1,
  '2026-02-01',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET academic_status = 'active', updated_at = NOW();

-- ═══════════════════════════════════════════════════════════
-- STEP 4: Create 3 modules (use UPDATE instead of INSERT to avoid duplicates)
-- ═══════════════════════════════════════════════════════════

INSERT INTO modules (id, qualification_id, code, name, description, credits, year, semester, is_active, created_at, updated_at)
VALUES
  ('10000001-0001-4000-8000-000000000001', '11111111-1111-1111-1111-111111111111', 'PROG511', 'Programming 511', 'Introduction to programming using Python and Java', 16, 1, 1, true, NOW(), NOW()),
  ('10000002-0002-4000-8000-000000000002', '11111111-1111-1111-1111-111111111111', 'WEB511', 'Web Development 511', 'HTML5, CSS3, JavaScript, and responsive design', 12, 1, 1, true, NOW(), NOW()),
  ('10000003-0003-4000-8000-000000000003', '11111111-1111-1111-1111-111111111111', 'DB511', 'Database Systems 511', 'SQL, database design, and data management', 14, 1, 1, true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

-- ═══════════════════════════════════════════════════════════
-- STEP 5: Create 2026 Semester 1
-- ═══════════════════════════════════════════════════════════

INSERT INTO semesters (id, name, year, semester_number, start_date, end_date, registration_open, registration_start_date, registration_end_date, add_drop_deadline, is_active, created_at, updated_at)
VALUES ('99000001-0000-4000-8000-000000000001', '2026 Semester 1', 2026, 1, '2026-02-01', '2026-06-30', true, '2025-11-01', '2026-02-15', '2026-03-15', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET registration_open = true, updated_at = NOW();

-- ═══════════════════════════════════════════════════════════
-- STEP 6: Get lecturer ID for John Smith
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  john_lecturer_id UUID;
BEGIN
  -- Get or create lecturer record for John Smith
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
  ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO john_lecturer_id;

  -- Assign John to teach the 3 modules
  INSERT INTO module_lecturers (id, module_id, lecturer_id, semester_id, is_primary, created_at, updated_at)
  VALUES
    ('80000001-0001-4000-8000-000000000001', '10000001-0001-4000-8000-000000000001', '32000001-0000-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', true, NOW(), NOW()),
    ('80000001-0002-4000-8000-000000000001', '10000002-0002-4000-8000-000000000002', '32000001-0000-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', true, NOW(), NOW()),
    ('80000001-0003-4000-8000-000000000001', '10000003-0003-4000-8000-000000000003', '32000001-0000-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', true, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'John Smith assigned to 3 modules';
END$$;

-- ═══════════════════════════════════════════════════════════
-- STEP 7: Enroll Thabo in all 3 modules
-- ═══════════════════════════════════════════════════════════

INSERT INTO enrollments (id, student_id, module_id, semester_id, status, enrollment_date, created_at, updated_at)
VALUES
  ('60000001-0001-4000-8000-000000000001', '42000001-0000-4000-8000-000000000001', '10000001-0001-4000-8000-000000000001', '99000001-0000-4000-8000-000000000001', 'active', '2026-02-01', NOW(), NOW()),
  ('60000001-0002-4000-8000-000000000001', '42000001-0000-4000-8000-000000000001', '10000002-0002-4000-8000-000000000002', '99000001-0000-4000-8000-000000000001', 'active', '2026-02-01', NOW(), NOW()),
  ('60000001-0003-4000-8000-000000000001', '42000001-0000-4000-8000-000000000001', '10000003-0003-4000-8000-000000000003', '99000001-0000-4000-8000-000000000001', 'active', '2026-02-01', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET status = 'active', updated_at = NOW();

-- ═══════════════════════════════════════════════════════════
-- STEP 8: Add emergency contacts for Thabo
-- ═══════════════════════════════════════════════════════════

INSERT INTO emergency_contacts (id, student_id, name, relationship, phone, is_primary, created_at, updated_at)
VALUES
  ('90000001-0001-4000-8000-000000000001', '42000001-0000-4000-8000-000000000001', 'Mary Molefe', 'Mother', '+27829876543', true, NOW(), NOW()),
  ('90000002-0002-4000-8000-000000000002', '42000001-0000-4000-8000-000000000001', 'Peter Molefe', 'Father', '+27829876544', false, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- ═══════════════════════════════════════════════════════════
-- STEP 9: Add announcements from John Smith
-- ═══════════════════════════════════════════════════════════

INSERT INTO announcements (id, module_id, user_id, title, content, priority, created_at, updated_at)
VALUES
  ('85000001-0001-4000-8000-000000000001', '10000001-0001-4000-8000-000000000001', '20000002-0000-4000-8000-000000000002', 'Welcome to Programming 511!', 'Welcome to Programming 511! This semester we will cover Python and Java fundamentals. Please ensure you have your development environment set up by next week.', 'normal', NOW(), NOW()),
  ('85000002-0002-4000-8000-000000000002', '10000001-0001-4000-8000-000000000001', '20000002-0000-4000-8000-000000000002', 'Assignment 1 Due Date', 'Assignment 1 is due on March 15th, 2026. Please submit via the online portal. Late submissions will incur a 10% penalty per day.', 'high', NOW(), NOW()),
  ('85000003-0003-4000-8000-000000000003', '10000002-0002-4000-8000-000000000002', '20000002-0000-4000-8000-000000000002', 'Web Development Project Guidelines', 'Your final project for Web Development 511 requires building a responsive website. Form groups of 3-4 students by next week.', 'normal', NOW(), NOW()),
  ('85000004-0004-4000-8000-000000000004', '10000003-0003-4000-8000-000000000003', '20000002-0000-4000-8000-000000000002', 'Database Lab Sessions', 'Additional lab sessions for Database Systems will be held on Fridays 15:00-17:00 in IT Lab 303. These are optional but highly recommended.', 'low', NOW(), NOW()),
  ('85000005-0005-4000-8000-000000000005', '10000001-0001-4000-8000-000000000001', '20000002-0000-4000-8000-000000000002', 'URGENT: Midterm Exam Schedule', 'The Programming 511 midterm exam will be held on April 10th, 2026 at 09:00 in the Main Exam Hall. This is a 2-hour exam. No rescheduling will be allowed.', 'urgent', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

-- ═══════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════

\echo '\n✅ DEMO DATA SETUP COMPLETE!\n'

\echo '📊 Summary:'
SELECT 'Users' as category, COUNT(*) as count FROM users WHERE email LIKE '%@eduhub.ac.za'
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Lecturers', COUNT(*) FROM lecturers
UNION ALL
SELECT 'Modules', COUNT(*) FROM modules WHERE code IN ('PROG511', 'WEB511', 'DB511')
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM enrollments WHERE student_id = '42000001-0000-4000-8000-000000000001'
UNION ALL
SELECT 'Announcements', COUNT(*) FROM announcements
UNION ALL
SELECT 'Emergency Contacts', COUNT(*) FROM emergency_contacts WHERE student_id = '42000001-0000-4000-8000-000000000001';

\echo '\n🔐 Login Credentials:'
\echo 'Admin: admin@eduhub.ac.za / Password123!'
\echo 'Lecturer: john.smith@eduhub.ac.za / Password123!'
\echo 'Student: thabo.molefe@student.eduhub.ac.za / Password123!'
\echo ''
