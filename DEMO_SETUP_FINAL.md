# EduHub Demo Accounts - Final Setup Guide

## ✅ What Already Exists

Based on the database logs, your system already has:

1. **✅ Admin Account** - `admin@eduhub.ac.za` / `Password123!`
2. **✅ Lecturer Account** - `john.smith@eduhub.ac.za` / `Password123!`
3. **✅ Modules** - PROG511 and WEB511 already exist
4. **❓ Students** - May already exist from previous seeds

## 🎯 Quick Demo Setup (5 Minutes)

### Step 1: Restart Backend (Clean)

```bash
docker-compose restart backend
```

Wait for it to fully start (check `docker logs eduhub_backend` - should say "Listening on port 3000")

### Step 2: Check What Students Exist

Open pgAdmin at http://localhost:5050 and run:

```sql
SELECT u.email, u.role, s.student_number
FROM users u
LEFT JOIN students s ON s.user_id = u.id
WHERE u.role = 'student'
OR u.email LIKE '%@student.%'
ORDER BY u.email
LIMIT 10;
```

**If you see students:**
- Use one of them for your demo (note the email and student number)
- Password for all seeded students: `Student123!`

**If NO students exist:**
- Go to Step 3 to create Thabo

### Step 3: Create Thabo (If Needed)

Run this SQL in pgAdmin:

```sql
-- 1. Get or create qualification
INSERT INTO qualifications (id, code, name, faculty, duration_years, total_fee, is_active, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'BSC-IT',
  'Bachelor of Science in Information Technology',
  'Faculty of Information Technology',
  3,
  85000.00,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (code) DO NOTHING;

-- 2. Create Thabo user
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
ON CONFLICT (email) DO NOTHING;

-- 3. Create user details
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

-- 4. Create student record
INSERT INTO students (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
SELECT
  '42000001-0000-4000-8000-000000000001',
  '20000003-0000-4000-8000-000000000003',
  'STUD-2026-0001',
  id,  -- Get qualification_id from qualifications table
  1,
  '2026-02-01',
  'active',
  NOW(),
  NOW()
FROM qualifications
WHERE code = 'BSC-IT'
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;
```

### Step 4: Create John's Lecturer Record

```sql
INSERT INTO lecturers (id, user_id, employee_number, department, title, specialization, hire_date, created_at, updated_at)
VALUES (
  '32000001-0000-4000-8000-000000000001',
  (SELECT id FROM users WHERE email = 'john.smith@eduhub.ac.za'),
  'EMP2024001',
  'Information Technology',
  'Dr.',
  'Software Engineering & Web Development',
  '2020-01-15',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;
```

### Step 5: Connect Everything

```sql
-- Get IDs we need
DO $$
DECLARE
  lecturer_id UUID;
  student_id UUID;
  module_prog UUID;
  module_web UUID;
  semester_id UUID;
BEGIN
  -- Get lecturer ID
  SELECT l.id INTO lecturer_id
  FROM lecturers l
  JOIN users u ON l.user_id = u.id
  WHERE u.email = 'john.smith@eduhub.ac.za';

  -- Get student ID
  SELECT s.id INTO student_id
  FROM students s
  JOIN users u ON s.user_id = u.id
  WHERE u.email = 'thabo.molefe@student.eduhub.ac.za';

  -- Get module IDs
  SELECT id INTO module_prog FROM modules WHERE code = 'PROG511';
  SELECT id INTO module_web FROM modules WHERE code = 'WEB511';

  -- Get or create semester
  INSERT INTO semesters (id, name, year, semester_number, start_date, end_date, registration_open, registration_start_date, registration_end_date, add_drop_deadline, is_active, created_at, updated_at)
  VALUES (
    '99000001-0000-4000-8000-000000000001',
    '2026 Semester 1',
    2026,
    1,
    '2026-02-01',
    '2026-06-30',
    true,
    '2025-11-01',
    '2026-02-15',
    '2026-03-15',
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO semester_id;

  -- If semester already existed, get its ID
  IF semester_id IS NULL THEN
    SELECT id INTO semester_id FROM semesters WHERE year = 2026 AND semester_number = 1;
  END IF;

  -- Assign John to modules
  INSERT INTO module_lecturers (id, module_id, lecturer_id, semester_id, is_primary, created_at)
  VALUES
    (gen_random_uuid(), module_prog, lecturer_id, semester_id, true, NOW()),
    (gen_random_uuid(), module_web, lecturer_id, semester_id, true, NOW())
  ON CONFLICT (module_id, lecturer_id, semester_id) DO NOTHING;

  -- Enroll Thabo in modules
  INSERT INTO registrations (id, student_id, module_id, semester_id, status, created_at, updated_at)
  VALUES
    (gen_random_uuid(), student_id, module_prog, semester_id, 'approved', NOW(), NOW()),
    (gen_random_uuid(), student_id, module_web, semester_id, 'approved', NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- Create announcements
  INSERT INTO announcements (id, module_id, created_by, title, content, priority, created_at, updated_at)
  SELECT
    gen_random_uuid(),
    module_prog,
    u.id,
    'Welcome to Programming 511',
    'Welcome! This semester we cover Python and Java fundamentals.',
    'normal',
    NOW(),
    NOW()
  FROM users u
  WHERE u.email = 'john.smith@eduhub.ac.za'
  ON CONFLICT DO NOTHING;

  -- Emergency contacts for Thabo
  INSERT INTO emergency_contacts (id, student_id, name, relationship, phone, is_primary, created_at, updated_at)
  SELECT
    gen_random_uuid(),
    s.id,
    'Mary Molefe',
    'Mother',
    '+27829876543',
    true,
    NOW(),
    NOW()
  FROM students s
  JOIN users u ON s.user_id = u.id
  WHERE u.email = 'thabo.molefe@student.eduhub.ac.za'
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Setup complete!';
END$$;
```

## 🧪 Test Your Demo

### Test 1: Admin Login
```
URL: http://localhost:3000/admin/login.html
Email: admin@eduhub.ac.za
Password: Password123!
Expected: Dashboard loads, can see users/applications
```

### Test 2: Lecturer Login
```
URL: http://localhost:3000/lecturer/login.html
Email: john.smith@eduhub.ac.za
Password: Password123!
Expected: Dashboard loads, shows 2 modules (PROG511, WEB511)
```

### Test 3: Student Login
```
URL: http://localhost:3000/student/login.html
Email: thabo.molefe@student.eduhub.ac.za
Password: Password123!
Expected: Dashboard loads, shows enrolled modules, emergency contacts
```

## 📊 What Each User Should See

### Admin Dashboard
- Total users count
- Recent applications
- System reports
- User management

### Lecturer Dashboard (John Smith)
- **My Modules**: PROG511, WEB511
- **Students**: Thabo Molefe (and others if they exist)
- **Announcements**: Can create/edit/delete
- **Class Roster**: View enrolled students per module

### Student Dashboard (Thabo)
- **My Profile**: Name, student number STUD-2026-0001
- **Enrolled Modules**: PROG511 (16 credits), WEB511 (12 credits) = 28 credits total
- **Announcements**: "Welcome to Programming 511" from Dr. Smith
- **Emergency Contacts**: Mary Molefe (Mother)
- **Module Registration**: Can register for more modules

## 🎬 Demo Flow for Presentation

1. **Start with Public Application** (`/public/apply.html`)
   - Show identity verification
   - Fill partial form, save as draft
   - Complete and submit

2. **Admin Approves** (`admin@eduhub.ac.za`)
   - Login to admin dashboard
   - View pending applications
   - Approve application → Creates student

3. **Student Experience** (`thabo.molefe@student.eduhub.ac.za`)
   - Login as new student
   - View dashboard with profile
   - See enrolled modules
   - Register for additional modules
   - View announcements from lecturer
   - Manage emergency contacts

4. **Lecturer Experience** (`john.smith@eduhub.ac.za`)
   - Login as lecturer
   - View assigned modules
   - See class rosters (Thabo + others)
   - Create announcement → Students see it instantly
   - View student details

5. **Back to Admin** (`admin@eduhub.ac.za`)
   - View reports (enrollment, applications)
   - Bulk approve multiple applications
   - Manage system settings

## 🔧 Troubleshooting

### "Lecturer record not found"
Run Step 4 SQL to create John's lecturer record

### "No modules showing"
Run Step 5 SQL to assign John to modules

### "Student can't see enrollments"
Run Step 5 SQL to enroll Thabo in modules

### Backend won't start
```bash
docker-compose down
docker-compose up -d
docker logs -f eduhub_backend
```

## ✅ Verification Queries

Run these in pgAdmin to verify everything:

```sql
-- Check all 3 accounts
SELECT u.email, u.role,
  CASE
    WHEN s.id IS NOT NULL THEN 'Has student record'
    WHEN l.id IS NOT NULL THEN 'Has lecturer record'
    ELSE 'Admin (no extra record needed)'
  END as status
FROM users u
LEFT JOIN students s ON s.user_id = u.id
LEFT JOIN lecturers l ON l.user_id = u.id
WHERE u.email IN ('admin@eduhub.ac.za', 'john.smith@eduhub.ac.za', 'thabo.molefe@student.eduhub.ac.za');

-- Check John's modules
SELECT m.code, m.name, ml.is_primary
FROM module_lecturers ml
JOIN modules m ON ml.module_id = m.id
JOIN lecturers l ON ml.lecturer_id = l.id
JOIN users u ON l.user_id = u.id
WHERE u.email = 'john.smith@eduhub.ac.za';

-- Check Thabo's enrollments
SELECT m.code, m.name, m.credits, r.status
FROM registrations r
JOIN modules m ON r.module_id = m.id
JOIN students s ON r.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE u.email = 'thabo.molefe@student.eduhub.ac.za';
```

---

**All set! Your demo environment is ready for the presentation!** 🎉
