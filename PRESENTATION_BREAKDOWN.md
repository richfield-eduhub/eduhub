# EduHub Presentation Breakdown (30 Minutes)

## Presentation Flow - 6 Team Members

---

## **1. Mokgadi (Richfield Mokgadi Mamabolo) - 2-3 mins: Introduction & Context**

### **Talk about:**

#### **Team Introduction** (30 sec)
- Introduce the 6 members and their roles

#### **Product Overview** (1 min)
- EduHub: Comprehensive student management system for higher education
- Handles entire student lifecycle: Application → Enrollment → Academic management

#### **Problem Statement** (1 min)
- Manual application processing is slow and error-prone
- Students lack self-service portals
- No centralized communication system
- Institutions need real-time reporting

#### **Solution** (30 sec)
- Web-based platform with role-based access
- "Now let Popi show you the student experience..."

---

## **2. Popi - 5 mins: Student Portal (Strong Technical Start)**

### **Talk about:**

#### **Student Dashboard Overview** (1 min)
- Complete self-service portal for students

#### **Profile Management** (1.5 mins)
- **Profile photo upload**:
  - Frontend: `handleAvatarUpload()` function with FormData API
  - Backend: `POST /api/students/:id/profile-photo` using Multer
  - Validation: File type check (images only), 5MB size limit
  - Storage: Files in `/uploads/profiles/`, URL saved to database
- **Personal info updates**: Real-time sync with database

#### **Emergency Contacts** (1 min)
- Full CRUD operations: Add, edit, delete contacts
- Business rules: Max 3 contacts, must designate one as primary
- API: `GET/POST/PUT/DELETE /api/students/:id/emergency-contacts`
- Backend validation: Express-validator for phone format, required fields

#### **Module Registration (Technical Deep-Dive)** (2 mins)
- **Self-service registration with validation**:
  - API: `POST /api/students/:id/registrations`
  - **Prerequisite validation**:
    ```sql
    SELECT mp.* FROM module_prerequisites mp
    WHERE mp.module_id = ?
    AND mp.prerequisite_module_id NOT IN (
      SELECT module_id FROM enrollments
      WHERE student_id = ? AND status='completed'
    )
    ```
  - **Credit limit enforcement**: System reads `max_credits_per_semester` setting
  - **Schedule conflict detection**: Checks time slot overlaps
  - Frontend: Real-time credit calculator, visual progress bar, disabled states

#### **View Announcements** (30 sec)
- Priority-based filtering (urgent, high, normal, low)
- Auto-receives announcements for enrolled modules

### **Show:**
Live demo - Upload photo, register for module (show prerequisite blocking), add emergency contact

---

## **3. Thendo - 5 mins: New Application System**

### **Talk about:**

#### **Public Application Portal** (1 min)
- Multi-step wizard: Identity → Personal Info → Education → Documents → Payment → Review
- Accessible without login

#### **Identity Verification & Duplicate Prevention** (2 mins)
- **Prevents duplicate applications**:
  - `GET /api/applications/identity/status?id_number=...`
  - Checks both SA ID and passport numbers
  - Returns existing application history, draft status
- **SA ID Auto-parsing**:
  - Extracts date of birth from first 6 digits
  - Format: YYMMDD → validates and converts to full date
- SQL query handles both identity types:
  ```sql
  WHERE (nationality = 'South African' AND id_number = ?)
     OR (nationality <> 'South African' AND passport_number = ?)
  ```

#### **Draft System** (1.5 mins)
- `POST /api/applications/drafts/start`
- Saves progress at any step
- State management: JSON storage of partial form data
- Resume with reference number
- Database: `applications` table with `status='draft'`

#### **Email Verification** (30 sec)
- After submission, verification email sent
- Token-based verification (24hr expiry)
- Updates `email_verified` flag

### **Show:**
Identity check finding existing application, fill partial form, save as draft, resume later

---

## **4. Ellamel - 5 mins: Lecturer Portal**

### **Talk about:**

#### **Lecturer Dashboard** (1 min)
- View assigned modules: `GET /api/lecturers/:id/modules`
- Student enrollment lists per module
- Module details: Code, name, credits, schedule

#### **Announcements System (Core Feature)** (3.5 mins)
- **Create module-specific announcements**:
  - API: `POST /api/announcements`
  - Request body:
    ```json
    {
      "module_id": 5,
      "title": "Exam Schedule Changed",
      "content": "Final exam moved to...",
      "priority": "urgent"
    }
    ```
- **Priority levels**:
  - Urgent (red badge) - Critical deadlines
  - High (orange) - Important updates
  - Normal (blue) - General info
  - Low (gray) - Optional reading

- **Database Design**:
  - `announcements` table with `module_id` foreign key
  - Students receive based on enrollment
  - SQL join: `announcements → modules → enrollments → students`

- **Full CRUD Operations**:
  - **Edit**: `PUT /api/announcements/:id` - Update existing
  - **Delete**: `DELETE /api/announcements/:id` - Remove announcement
  - Frontend: Edit form pre-fills data, inline delete buttons

- **How Students Receive**:
  - Automatic filtering by enrolled modules
  - Real-time priority-based sorting
  - Students see announcement immediately after creation

### **Show:**
Create urgent announcement, edit existing one, show student view with priority filtering

---

## **5. Joel - 5 mins: Admin Dashboard**

### **Talk about:**

#### **Application Management** (2.5 mins)
- **View all applications**: `GET /api/admin/applications`
- **Filtering by status**: pending, approved, rejected, draft
- **Bulk Actions Feature**:
  - UI: Checkboxes appear on pending applications
  - Select all functionality
  - Bulk approve/reject: `POST /api/admin/applications/bulk-update`
  - Request:
    ```json
    {
      "applicationIds": [1, 2, 3, 5, 8],
      "status": "approved"
    }
    ```
  - Response shows success/failure counts per application
  - Transaction-based: If one fails, others still process
- **Individual Review**:
  - View full application details
  - Add admin notes
  - Approve/reject with reason

#### **Reporting Dashboard** (2 mins)
- **Three report types** (parallel API calls):
  1. **Enrollment Report**: `GET /api/admin/reports/enrollment`
     - Breakdown by qualification, year level, campus
     - Student count trends
  2. **Application Funnel**: `GET /api/admin/reports/applications`
     - Draft → Submitted → Approved → Rejected conversion rates
     - Application status distribution
  3. **System Usage**: `GET /api/admin/reports/system-usage`
     - Active users by role
     - Login activity, peak times
- Dynamic chart rendering from real data
- Export functionality (CSV ready)

#### **System Settings** (30 sec)
- Manage global configurations
- Categories: Academic, Application, System
- Examples: `max_credits_per_semester`, `application_deadline`
- `POST /api/admin/settings/bulk-update`

### **Show:**
Bulk approve 5 applications, reports dashboard with enrollment chart

---

## **6. Tammy (You) - 7-8 mins: Backend Architecture, Security & System Integration**

### **Talk about:**

#### **System Architecture Overview** (2 mins)
- **Tech Stack**:
  - Backend: Node.js + Express.js (RESTful API architecture)
  - Database: PostgreSQL with raw SQL queries via Sequelize
  - Frontend: Vanilla HTML/CSS/JavaScript (Fetch API)

- **Database Schema** (15 tables):
  - **Core**: users, students, lecturers, applications, modules, enrollments
  - **Supporting**: announcements, emergency_contacts, module_prerequisites, email_verification_tokens, system_settings, application_documents
  - **Relationships**: Proper foreign keys with cascading rules

- **API Structure**:
  - `/api/auth` - Authentication (login, register, refresh, MFA)
  - `/api/students` - Student operations
  - `/api/lecturers` - Lecturer operations
  - `/api/admin` - Admin management
  - `/api/applications` - Application workflow
  - `/api/modules` - Module management
  - `/api/announcements` - Announcement system

#### **Authentication & Security** (2.5 mins)
- **JWT Authentication System**:
  - **Access tokens**: 15-minute expiry, stored in localStorage
  - **Refresh tokens**: 7-day expiry, stored in `refresh_tokens` table
  - Renewal flow: `POST /api/auth/refresh` with expired access token
  - Middleware: `authenticateToken()` validates on every protected route

- **Password Security**:
  - bcrypt hashing with 10 salt rounds
  - Never store plaintext passwords
  - Password reset with token expiry

- **Multi-Factor Authentication (MFA)**:
  - TOTP implementation using speakeasy library
  - QR code generation for Google Authenticator/Authy
  - Setup flow: `POST /api/auth/mfa/setup` → returns QR code URL
  - Verification: `POST /api/auth/mfa/verify` with 6-digit code
  - Backup codes: 10 codes generated, bcrypt hashed, one-time use
  - Stored in `mfa_settings` table per user

- **Additional Security Layers**:
  - **Rate Limiting**: In-memory Map implementation, 100 requests/15min per IP
  - **CSRF Protection**: Double-submit cookie pattern
  - **Security Headers**:
    - Content Security Policy (CSP)
    - HTTP Strict Transport Security (HSTS)
    - X-Frame-Options (prevent clickjacking)
  - **Input Validation**: Express-validator on all endpoints

#### **File Upload Security** (1 min)
- **Multer middleware** for handling multipart/form-data
- **Validation rules**:
  - File type checking (MIME type + extension)
  - Size limits (5MB for photos, 10MB for documents)
  - Filename sanitization (prevent path traversal)
- Storage: Organized folders (`/uploads/profiles/`, `/uploads/applications/`)
- Database links: Store file paths in relevant tables

#### **DevOps & Disaster Recovery** (1 min)
- **Automated Backup System**:
  - `backup.sh` script: Daily PostgreSQL dumps
  - **AES-256 encryption** for sensitive data
  - Gzip compression for storage efficiency
  - SHA-256 checksums for integrity verification
- **Restore Process**:
  - `restore.sh` with checksum validation
  - Point-in-time recovery capability
- `.env` configuration: Separate dev/prod environments

#### **System Integration - How It All Connects** (1 min)
- **Application Flow**:
  1. Thendo's public form → creates application record
  2. Triggers email verification system → token sent
  3. On approval (Joel's admin action) → creates student record
  4. Popi's student portal becomes accessible → can upload photo, add contacts
  5. Student registers for modules → receives Ellamel's announcements
  6. All activity tracked → appears in Joel's reports

- **Data Flow**:
  - Single PostgreSQL database maintains consistency
  - Foreign keys enforce referential integrity
  - All modules communicate via REST API
  - No direct database access from frontend

#### **Technical Highlights** (30 sec)
- **50+ API endpoints** across 7 route files
- **15 database tables** with proper normalization
- **Role-based access control** (RBAC) via JWT claims
- **Comprehensive error handling** with user-friendly messages
- **Production-ready** with proper logging, validation, security

#### **Wrap-up & Q&A Transition** (15 sec)
- "We've built a secure, scalable system that handles the complete student lifecycle"
- "Every feature is backed by proper validation, authentication, and error handling"
- "Happy to answer technical questions about implementation, architecture, or specific features"

### **Show:**
Architecture diagram, database schema, MFA setup flow with QR code, backup script running

---

## **Why This Flow Works:**

1. **Mokgadi sets context** - Audience understands the "why"
2. **Popi establishes technical credibility** - Hardest validations (prerequisites, credits)
3. **Thendo shows the entry point** - Where all users start
4. **Ellamel demonstrates communication** - Important feature for user engagement
5. **Joel shows admin power** - Bulk actions and insights
6. **You tie it all together** - The technical backbone that makes everything work

---

## **Your Q&A Advantages:**

- You just presented the architecture, so you can answer "how does X work with Y?"
- You covered security, so you handle "is this secure?" questions
- You heard all 5 presentations, can redirect:
  - "Popi, can you show the prerequisite validation again?"
  - "Joel, elaborate on the application funnel data sources?"
  - "Thendo, walk us through the draft resume process?"
- You're positioned as **technical lead** who orchestrates the system

---

## **Key Talking Points Template** (30 seconds each)

- "I built [feature], which allows [user] to [action]"
- "Technically, this uses [tech] and calls [API endpoint]"
- "For validation, we [specific check/rule]"
- "This integrates with [other module] by [how]"
- "Let me show you..." [demo]

This positions the team as technically competent and you as the architect who understands the full picture.
