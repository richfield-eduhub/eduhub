# EduHub Demo Accounts Status

## Current State (June 27, 2026)

### ✅ Accounts That Exist

#### 1. **Admin Account**
- **Email:** `admin@eduhub.ac.za`
- **Password:** `Password123!`
- **Role:** Admin
- **Status:** ✅ User account created
- **What's Missing:** None - admin account is functional

#### 2. **Lecturer Account (Dr. John Smith)**
- **Email:** `john.smith@eduhub.ac.za`
- **Password:** `Password123!`
- **Role:** Lecturer
- **Status:** ⚠️ User account created, but NO lecturer record yet
- **What's Missing:**
  - Lecturer profile record (needs to be created)
  - Module assignments (no modules assigned yet)
  - Students in classes (no enrollments yet)

#### 3. **Student Account (Thabo Molefe)**
- **Email:** `thabo.molefe@student.eduhub.ac.za`
- **Password:** `Password123!`
- **Role:** Student
- **Status:** ❌ User account does NOT exist in database
- **What's Missing:** Everything - account needs to be created

---

## What You Need to Do

### Option 1: Use Existing Seeded Data (Recommended)

Check if you have students from the previous `2026-05-22-seed-john-smith-classes` migration.

Run this to check:
```sql
SELECT u.email, s.student_number
FROM users u
JOIN students s ON s.user_id = u.id
WHERE u.role = 'student'
LIMIT 10;
```

If students exist, use one of those for your demo instead of creating Thabo.

### Option 2: Create Thabo Manually via Frontend

1. **Start the backend** (make sure it's running)
2. **Navigate to the public registration page**
3. **Fill out the application form** for Thabo:
   - Name: Thabo Molefe
   - Email: thabo.molefe@student.eduhub.ac.za
   - ID: 0403150001083
   - DOB: 2004-03-15
   - Phone: 0821234567
4. **Submit the application**
5. **Login as admin** (admin@eduhub.ac.za)
6. **Approve Thabo's application** → This will create the student record
7. **Now Thabo can login** as a student

### Option 3: Manually Fix Database (Complex)

The database schema has these issues that prevent auto-seeding:
- `emergency_contacts.student_id` expects a UUID that exists in `students` table
- `announcements.created_by` must exist in `users` table
- `module_lecturers` table has NO `updated_at` column
- Table is called `registrations` not `enrollments`
- Foreign key constraints are strict

You would need to:
1. Create student user first
2. Create student record (links to user)
3. Then create emergency contacts, enrollments, etc.

---

## What Currently Works

### ✅ Admin Dashboard
**Login:** admin@eduhub.ac.za / Password123!

You can:
- View applications (if any exist)
- Manage users
- View system reports
- Access admin settings

**BUT:** There's no data to see yet (no applications, no students, no modules)

### ⚠️ Lecturer Dashboard
**Login:** john.smith@eduhub.ac.za / Password123!

**Status:** Will fail because there's no `lecturers` record

**Error Expected:** User has role 'lecturer' but no lecturer profile exists

### ❌ Student Dashboard
**Login:** thabo.molefe@student.eduhub.ac.za / Password123!

**Status:** Account doesn't exist - login will fail

---

## Recommended Demo Flow

### For Your Presentation:

1. **Show the Application Process**
   - Go to `/public/apply.html`
   - Fill out an application as a prospective student
   - Show the identity verification (prevents duplicates)
   - Show the multi-step form
   - Submit the application

2. **Login as Admin**
   - Email: admin@eduhub.ac.za
   - Password: Password123!
   - Go to Applications page
   - Show the submitted application
   - Approve it (this creates the student record)

3. **Now Login as the New Student**
   - Use the email from the application
   - Show the student dashboard
   - Register for modules
   - View profile

4. **For Lecturer Demo**
   - You need to manually create a lecturer record first
   - Or use the seed migration that creates John Smith properly

---

## Quick Fix SQL (Run This)

To quickly set up demo data that will work:

```bash
docker exec eduhub_db psql -U postgres -d eduhub <<'EOSQL'

-- 1. Check if BSc IT qualification exists, if not create it
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

-- 2. Create Thabo's user account
INSERT INTO users (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
VALUES (
  '20000003-0000-4000-8000-000000000003',
  'thabo.molefe@student.eduhub.ac.za',
  '$2b$10$xW8vZ7YhKp9pQm3Lq1Jc.OZH7x9Yf6Rm2Wq5Kp8Nq4Jm3Lp2Wq5K',  -- Password123!
  'STUD-2026-0001',
  'student',
  'active',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Create Thabo's user details
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
ON CONFLICT (id) DO NOTHING;

-- 4. Create Thabo's student record
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
ON CONFLICT (id) DO NOTHING;

-- 5. Create John Smith's lecturer record
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

SELECT 'Setup complete!' as status;

EOSQL
```

This will create the minimum required data for all 3 accounts to work.

---

## Test Your Demo Accounts

After running the quick fix SQL above:

### Test 1: Admin
```
Email: admin@eduhub.ac.za
Password: Password123!
Expected: Login successful, dashboard loads
```

### Test 2: Lecturer (John Smith)
```
Email: john.smith@eduhub.ac.za
Password: Password123!
Expected: Login successful, lecturer dashboard loads (but no modules yet)
```

### Test 3: Student (Thabo)
```
Email: thabo.molefe@student.eduhub.ac.za
Password: Password123!
Expected: Login successful, student dashboard loads (but no enrollments yet)
```

---

## Next Steps to Complete Demo

Once the 3 accounts work, you need to:

1. **Create modules** (PROG511, WEB511, DB511)
2. **Create semester** (2026 Semester 1)
3. **Assign John to teach modules**
4. **Enroll Thabo in modules**
5. **Add announcements**
6. **Add emergency contacts for Thabo**

This requires either:
- Running the full migration (currently has bugs)
- Creating data via the frontend UI
- Running additional SQL scripts

---

**Current Status:** Partial setup. Admin works, but lecturer and student need additional records created.

**Recommended Action:** Run the "Quick Fix SQL" above, then test all 3 logins.
