# EduHub Implementation Plan: June 13-28, 2026
**Goal:** Complete missing features from 75% → 95%+ completion
**Deadline:** June 28, 2026 (Git push + deployment)
**Submission:** June 29, 2026 (morning)
**Presentation:** After June 29, 2026

---

## 📊 Current Status

**Implementation Completion:** 75% (from MISSING_FEATURES.md)
**Target Completion:** 95%+
**Time Available:** 15 days (June 13-28)
**Strategy:** Focus on CRITICAL and HIGH priority features first

---

## 🎯 Features to Implement (Prioritized)

### ✅ CRITICAL Priority (MUST HAVE)
1. **File Upload System** - Applications can't work without documents
2. **Emergency Contacts Table + Endpoints** - Student safety/compliance
3. **Email Notification Integration** - Critical user communication
4. **Database Backup System** - Disaster recovery

### ✅ HIGH Priority (SHOULD HAVE)
5. **System Settings Table** - Configuration management
6. **Grade Entry System** - Core academic functionality
7. **Application Rejection Reason** - User feedback
8. **Security Features** - Rate limiting, CSRF protection, security headers
9. **Missing Database Columns** - Profile photos, academic status fields

### ✅ MEDIUM Priority (NICE TO HAVE - if time permits)
10. **MFA (Multi-Factor Authentication)** - Enhanced security
11. **Email Verification** - Account validation
12. **Prerequisite Enforcement** - Verify existing logic works
13. **Schedule Conflict Detection** - Verify existing logic works
14. **Advanced Reporting** - Dashboard enhancements

### ❌ LOW Priority (Future/Post-Submission)
- Alumni portal features
- Profile photos
- Attendance tracking
- Bulk actions for admin

---

## 📅 15-DAY SPRINT PLAN

### **Sprint 1: June 13-16 (4 days) - CRITICAL FEATURES**

#### Day 1 (June 13) - File Upload System Setup
**Target:** Backend file upload infrastructure

**Backend Tasks:**
- [ ] Install multer package (`npm install multer`)
- [ ] Create `uploads/` directory structure
- [ ] Create file upload middleware (`src/middleware/upload.middleware.js`)
  - File type validation (PDF, JPG, PNG)
  - File size validation (5MB max)
  - Filename sanitization
  - Unique filename generation (uuid + timestamp)
- [ ] Create `application_documents` table migration
  ```sql
  CREATE TABLE application_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(application_id),
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
- [ ] Run migration
- [ ] Create ApplicationDocument model (`src/models/ApplicationDocument.js`)

**Estimated Time:** 6-8 hours

---

#### Day 2 (June 14) - File Upload Endpoints + Frontend
**Target:** Complete file upload functionality

**Backend Tasks:**
- [ ] Create file upload endpoints in `src/routes/applications.routes.js`:
  - POST `/api/applications/:id/documents` - Upload document
  - GET `/api/applications/:id/documents` - List documents
  - DELETE `/api/applications/:id/documents/:docId` - Delete document
- [ ] Create document service (`src/services/document.service.js`)
- [ ] Add virus scanning placeholder (ClamAV integration - optional)
- [ ] Test with Postman

**Frontend Tasks:**
- [ ] Update `frontend/public/apply.html` - Add file upload inputs
- [ ] Create file upload UI with progress bar
- [ ] Add file type/size validation on frontend
- [ ] Display uploaded documents list
- [ ] Test complete application submission with documents

**Estimated Time:** 8 hours

---

#### Day 3 (June 15) - Emergency Contacts Table + Endpoints
**Target:** Emergency contacts functionality

**Backend Tasks:**
- [ ] Create `emergency_contacts` table migration
  ```sql
  CREATE TABLE emergency_contacts (
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id),
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
- [ ] Run migration
- [ ] Create EmergencyContact model (`src/models/EmergencyContact.js`)
- [ ] Create emergency contacts endpoints:
  - POST `/api/students/:id/emergency-contacts` - Add contact
  - GET `/api/students/:id/emergency-contacts` - List contacts
  - PUT `/api/students/:id/emergency-contacts/:contactId` - Update
  - DELETE `/api/students/:id/emergency-contacts/:contactId` - Delete
- [ ] Add validation (max 3 contacts per student)
- [ ] Test with Postman

**Frontend Tasks:**
- [ ] Create `frontend/student/emergency-contacts.html`
- [ ] Add form to add/edit emergency contacts
- [ ] Display contacts list with edit/delete buttons
- [ ] Add to student navigation menu

**Estimated Time:** 6 hours

---

#### Day 4 (June 16) - Email Notification Integration
**Target:** Complete email notification system

**Backend Tasks:**
- [ ] Verify email.service.js exists and configure SMTP
- [ ] Set up environment variables (Gmail SMTP or SendGrid)
  ```
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASSWORD=your-app-password
  EMAIL_FROM=noreply@eduhub.co.za
  ```
- [ ] Wire up email notifications in controllers:
  - Application submission confirmation
  - Application approval notification
  - Application rejection notification
  - Registration confirmation
  - Password reset email
- [ ] Create email templates (`src/templates/emails/`)
  - `application-submitted.html`
  - `application-approved.html`
  - `application-rejected.html`
  - `registration-confirmed.html`
  - `password-reset.html`
- [ ] Test all email triggers

**Testing:**
- [ ] Submit application → receive email
- [ ] Approve application → receive email
- [ ] Register for course → receive email
- [ ] Request password reset → receive email

**Estimated Time:** 6-8 hours

---

### **Sprint 2: June 17-20 (4 days) - HIGH PRIORITY FEATURES**

#### Day 5 (June 17) - System Settings Table + Admin UI
**Target:** Centralized configuration management

**Backend Tasks:**
- [ ] Create `system_settings` table migration
  ```sql
  CREATE TABLE system_settings (
    setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(user_id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
- [ ] Run migration
- [ ] Create SystemSetting model
- [ ] Seed default settings:
  - `registration_start_date`
  - `registration_end_date`
  - `add_drop_deadline`
  - `current_semester_id`
  - `max_credits_per_semester`
- [ ] Create settings endpoints:
  - GET `/api/admin/settings` - List all settings
  - PUT `/api/admin/settings/:key` - Update setting
  - GET `/api/settings/public` - Public settings (registration dates)
- [ ] Create settings service to fetch/cache settings

**Frontend Tasks:**
- [ ] Create `frontend/admin/settings.html`
- [ ] Display settings in editable form
- [ ] Add save/update functionality
- [ ] Restrict access to Admin only

**Estimated Time:** 6 hours

---

#### Day 6 (June 18) - Grade Entry System
**Target:** Lecturers can enter grades

**Backend Tasks:**
- [ ] Verify `grade` column exists in `registrations` table
  - If not, create migration to add it
- [ ] Create grade entry endpoint:
  - PUT `/api/registrations/:id/grade` (Lecturer only)
  - Validation: A, B, C, D, F grades
  - Update `grade` and `grade_updated_at` fields
- [ ] Create bulk grade entry endpoint:
  - PUT `/api/modules/:moduleId/grades` (upload CSV)
- [ ] Add lecturer authorization check

**Frontend Tasks:**
- [ ] Update `frontend/lecturer/roster.html`
- [ ] Add grade input fields for each student
- [ ] Add "Save Grades" button
- [ ] Show grade history (if applicable)
- [ ] Add CSV upload for bulk grades (optional)

**Testing:**
- [ ] Lecturer can view roster
- [ ] Lecturer can enter/update grades
- [ ] Student cannot enter grades
- [ ] Grades persist in database

**Estimated Time:** 6 hours

---

#### Day 7 (June 19) - Missing Database Columns
**Target:** Add missing fields to existing tables

**Backend Tasks:**
- [ ] Create migration to add missing columns:

  **Users table:**
  ```sql
  ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
  ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  ```

  **Students table:**
  ```sql
  ALTER TABLE students ADD COLUMN profile_photo_url VARCHAR(255);
  ALTER TABLE students ADD COLUMN year_of_study INTEGER;
  ALTER TABLE students ADD COLUMN expected_graduation DATE;
  ALTER TABLE students ADD COLUMN graduation_date DATE;
  ```

  **Applications table:**
  ```sql
  ALTER TABLE applications ADD COLUMN rejection_reason TEXT;
  ALTER TABLE applications ADD COLUMN reviewed_by UUID REFERENCES users(user_id);
  ALTER TABLE applications ADD COLUMN reviewed_at TIMESTAMP;
  ```

- [ ] Run migrations
- [ ] Update models to include new fields
- [ ] Update validation schemas

**Backend Logic:**
- [ ] Update login to set `last_login`
- [ ] Update application rejection to require `rejection_reason`
- [ ] Update application approval/rejection to set `reviewed_by` and `reviewed_at`

**Frontend Tasks:**
- [ ] Update application rejection form to include reason textarea
- [ ] Display rejection reason to applicant
- [ ] Show last login in admin user list (optional)

**Estimated Time:** 4-6 hours

---

#### Day 8 (June 20) - Security Features
**Target:** Rate limiting, CSRF, security headers

**Backend Tasks:**
- [ ] Install security packages:
  ```bash
  npm install express-rate-limit helmet csurf
  ```

- [ ] Implement rate limiting (`src/middleware/rate-limit.middleware.js`)
  ```javascript
  const rateLimit = require('express-rate-limit');

  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests, please try again later.'
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts
    message: 'Too many login attempts, please try again later.'
  });
  ```

- [ ] Add security headers with Helmet
  ```javascript
  const helmet = require('helmet');
  app.use(helmet());
  ```

- [ ] Add CSRF protection (optional - complex with JWT)

- [ ] Update server.js to use middleware

**Testing:**
- [ ] Test rate limiting with 101 requests
- [ ] Verify security headers in response (DevTools)
- [ ] Test login rate limiting (6 attempts)

**Estimated Time:** 4 hours

---

### **Sprint 3: June 21-25 (5 days) - MEDIUM PRIORITY + TESTING**

#### Day 9 (June 21) - Database Backup System
**Target:** Automated backups

**Backend Tasks:**
- [ ] Create backup script (`scripts/backup-database.js`)
  ```javascript
  const { exec } = require('child_process');
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupFile = `backups/eduhub_${timestamp}.sql`;

  exec(`pg_dump -U postgres -h localhost -p 5433 eduhub > ${backupFile}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error('Backup failed:', error);
      } else {
        console.log('Backup successful:', backupFile);
      }
    }
  );
  ```

- [ ] Create `backups/` directory
- [ ] Add backup script to package.json:
  ```json
  "scripts": {
    "backup": "node scripts/backup-database.js",
    "backup:cron": "node scripts/backup-cron.js"
  }
  ```

- [ ] Set up cron job for daily backups (production)
- [ ] Test backup and restore

**Estimated Time:** 3-4 hours

---

#### Day 10 (June 22) - MFA Implementation (Optional)
**Target:** Two-factor authentication

**Backend Tasks:**
- [ ] Install packages:
  ```bash
  npm install speakeasy qrcode
  ```

- [ ] Add MFA columns to users table:
  ```sql
  ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE;
  ALTER TABLE users ADD COLUMN mfa_secret VARCHAR(255);
  ```

- [ ] Create MFA endpoints:
  - POST `/api/auth/mfa/enable` - Generate QR code
  - POST `/api/auth/mfa/verify` - Verify setup
  - POST `/api/auth/mfa/validate` - Validate during login

- [ ] Update login flow to check MFA

**Frontend Tasks:**
- [ ] Create MFA setup page
- [ ] Display QR code for Google Authenticator
- [ ] Add MFA code input on login (if enabled)

**Note:** This is optional - skip if time is tight

**Estimated Time:** 6-8 hours (OPTIONAL)

---

#### Day 11 (June 23) - Email Verification System
**Target:** Verify email addresses on registration

**Backend Tasks:**
- [ ] Generate verification token on registration
  ```javascript
  const token = crypto.randomBytes(32).toString('hex');
  ```

- [ ] Store token in database (add `verification_token` column or use separate table)

- [ ] Send verification email with link:
  ```
  http://localhost:3000/verify-email?token=xxxxx
  ```

- [ ] Create verification endpoint:
  - GET `/api/auth/verify-email?token=xxxxx`
  - Set `is_verified = TRUE`

- [ ] Block login if not verified (optional enforcement)

**Frontend Tasks:**
- [ ] Create `frontend/public/verify-email.html`
- [ ] Show "Check your email" message after registration
- [ ] Handle verification success/failure

**Estimated Time:** 4-5 hours

---

#### Day 12-13 (June 24-25) - TESTING & BUG FIXES
**Target:** Test all new features thoroughly

**Testing Checklist:**
- [ ] **File Uploads:**
  - [ ] Upload PDF (success)
  - [ ] Upload JPG (success)
  - [ ] Upload >5MB file (fail)
  - [ ] Upload .exe file (fail)
  - [ ] Delete uploaded document
  - [ ] View document list

- [ ] **Emergency Contacts:**
  - [ ] Add contact (success)
  - [ ] Add 4th contact (fail - max 3)
  - [ ] Edit contact
  - [ ] Delete contact
  - [ ] Set primary contact

- [ ] **Email Notifications:**
  - [ ] Application submitted → email received
  - [ ] Application approved → email received
  - [ ] Application rejected → email received (with reason)
  - [ ] Registration confirmed → email received

- [ ] **System Settings:**
  - [ ] Admin can view settings
  - [ ] Admin can update settings
  - [ ] Student cannot access settings
  - [ ] Registration dates enforced

- [ ] **Grade Entry:**
  - [ ] Lecturer can view roster
  - [ ] Lecturer can enter grades
  - [ ] Student can view own grades
  - [ ] Invalid grades rejected

- [ ] **Security:**
  - [ ] Rate limiting works (101st request fails)
  - [ ] Login rate limiting (6th attempt fails)
  - [ ] Security headers present

- [ ] **Database Backups:**
  - [ ] Run backup script
  - [ ] Verify backup file created
  - [ ] Test restore

**Bug Fixes:**
- [ ] Fix any bugs found during testing
- [ ] Update error messages
- [ ] Improve validation

**Estimated Time:** 2 full days

---

### **Sprint 4: June 26-28 (3 days) - DOCUMENTATION + DEPLOYMENT**

#### Day 14 (June 26) - Update Documentation
**Target:** Update implementation-phase-FINAL.md

**Tasks:**
- [ ] Read current implementation-phase-FINAL.md
- [ ] Update Section 5.1 Introduction:
  - Change completion from 75% → 95%
  - Add new features implemented
- [ ] Update Section 5.2 Coding:
  - Add file upload system details
  - Add emergency contacts table
  - Add system settings table
  - Add application_documents table
  - Update to 9 database tables (was 6)
  - Add new endpoints (document uploads, emergency contacts, settings, grades)
- [ ] Update Section 5.3 Testing:
  - Add test results for new features
  - Update code coverage if changed
- [ ] Update Section 5.4 System Testing:
  - Add test cases for new features
  - Update evaluation summary
- [ ] Update TEST_PACK.md with new test cases
- [ ] Update ENDPOINTS_SUMMARY.md with new endpoints

**Estimated Time:** 6-8 hours

---

#### Day 15 (June 27) - Final Testing + Deployment Prep
**Target:** Ensure everything works in production

**Tasks:**
- [ ] Run full test suite
- [ ] Test all user flows end-to-end:
  - [ ] Register → Apply → Upload Docs → Submit
  - [ ] Admin approve application
  - [ ] Student register for courses
  - [ ] Lecturer enter grades
  - [ ] Admin manage settings
- [ ] Check all email notifications working
- [ ] Verify security features active
- [ ] Run backup script
- [ ] Review error logs
- [ ] Fix any critical bugs

**Production Deployment:**
- [ ] Update environment variables on Railway.app
- [ ] Push final code to main branch
- [ ] Deploy to Railway
- [ ] Run database migrations on production
- [ ] Seed production data (if needed)
- [ ] Test production deployment
- [ ] Verify HTTPS working
- [ ] Check domain/URL accessible

**Estimated Time:** 8 hours

---

#### Day 16 (June 28) - FINAL PUSH + BUFFER DAY
**Target:** Final deployment + documentation

**Morning:**
- [ ] Final code review
- [ ] Final git commit and push
- [ ] Deploy to Railway.app
- [ ] Verify production is working
- [ ] Test all features on production URL

**Afternoon:**
- [ ] Final documentation review
- [ ] Create README.md with:
  - Installation instructions
  - How to run locally
  - Production URL
  - Test credentials
- [ ] Prepare for submission next morning
- [ ] Create presentation slides (for post-submission demo)

**Evening:**
- [ ] Buffer time for any last-minute issues
- [ ] Sleep well!

---

## 📦 June 29 (Submission Day)

**Morning (before 9 AM):**
- [ ] Final check - production is running
- [ ] Submit implementation-phase-FINAL.md
- [ ] Submit any other required documents
- [ ] Confirm submission received

**You're done!** 🎉

---

## 🎯 Success Criteria

By June 28, you should have:

✅ **Database Tables:** 9 tables (was 6)
- users
- students
- applications
- qualifications
- modules
- semesters
- registrations
- **emergency_contacts** (NEW)
- **application_documents** (NEW)
- **system_settings** (NEW)

✅ **New Features:**
- File upload system (CRITICAL)
- Emergency contacts management
- Email notifications (fully integrated)
- System settings management
- Grade entry for lecturers
- Database backups
- Security features (rate limiting, helmet)
- Missing database columns added

✅ **Endpoints:** 35+ (was 27)
- All original 27 endpoints
- 4 emergency contact endpoints
- 3 document upload endpoints
- 3 system settings endpoints
- 1 grade entry endpoint

✅ **Completion:** 95%+ (was 75%)

✅ **Documentation:** Updated implementation-phase-FINAL.md

✅ **Deployment:** Working on Railway.app

✅ **Testing:** All new features tested

---

## ⚠️ Risk Management

### If You Fall Behind:

**Priority Dropping Order** (drop these first if time runs out):
1. MFA (Day 10) - OPTIONAL, can skip
2. Email Verification (Day 11) - OPTIONAL, can skip
3. Database backups (Day 9) - Can do post-submission
4. Security features (Day 8) - Reduce scope (just helmet)

**NEVER DROP:**
- File uploads (CRITICAL)
- Emergency contacts (HIGH)
- Email notifications (HIGH)
- Grade entry (HIGH)
- Testing (Days 12-13)
- Documentation update (Day 14)
- Deployment (Day 15-16)

### If You're Ahead of Schedule:

**Bonus Features:**
- Alumni portal features
- Advanced reporting
- Bulk actions for admin
- Profile photo uploads
- Attendance tracking

---

## 📊 Daily Standup Questions

Ask yourself each morning:
1. What did I complete yesterday?
2. What am I working on today?
3. Are there any blockers?
4. Am I on track with the schedule?

**If you get stuck >2 hours:**
- Ask for help (me, teammates, Stack Overflow)
- Move to next task
- Come back later

---

## 🔧 Development Best Practices

1. **Commit often** - After each feature works
2. **Test before committing** - Don't break main branch
3. **Use feature branches** - `feature/file-uploads`, `feature/emergency-contacts`
4. **Write clear commit messages** - "Add file upload system with validation"
5. **Keep Railway.app in sync** - Deploy at end of each day

---

## 📝 Notes

- This plan is AMBITIOUS but ACHIEVABLE
- You have 15 days = 120 hours (8 hours/day)
- Total estimated time: ~100 hours
- Buffer: 20 hours for unexpected issues
- **Stay focused, one feature at a time!**

---

## 🚀 LET'S GO!

**Next Step:** Start Day 1 (June 13) - File Upload System Setup

Ready to begin? Let me know and I'll help you with the first task! 💪

---

**Generated:** June 13, 2026
**Deadline:** June 28, 2026 (deployment)
**Submission:** June 29, 2026 (morning)
**You've got this!** 🎓
