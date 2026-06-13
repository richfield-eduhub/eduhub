# EduHub Project - Comprehensive Architecture Analysis

## Executive Summary

EduHub is a full-stack educational institution portal built with Node.js/Express, PostgreSQL, and vanilla HTML/CSS/JavaScript frontend. The system supports multi-role access (Admin, Lecturer, Student) with complete admission, registration, and course management workflows.

---

## 1. PROJECT STRUCTURE & ORGANIZATION

### Directory Layout (Both versions are structurally identical)

```
eduhub/
├── backend/                          # Node.js/Express API server
│   ├── src/
│   │   ├── app.js                   # Main Express application
│   │   ├── config/
│   │   │   └── database.js          # Sequelize configuration
│   │   ├── controllers/             # Route handlers (8 files)
│   │   │   ├── auth.controller.js
│   │   │   ├── application.controller.js
│   │   │   ├── admin.controller.js
│   │   │   ├── campus.controller.js
│   │   │   ├── lecturer.controller.js
│   │   │   ├── module.controller.js
│   │   │   ├── qualification.controller.js
│   │   │   └── student.controller.js
│   │   ├── models/                  # Sequelize ORM models
│   │   │   ├── User.js              # Users with roles
│   │   │   ├── Application.js       # Admission applications
│   │   │   ├── Qualification.js     # Programs/degrees
│   │   │   ├── Module.js            # Course modules
│   │   │   ├── Semester.js          # Academic periods
│   │   │   ├── Registration.js      # Student enrollments
│   │   │   └── index.js             # Model associations
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── cors.middleware.js   # CORS configuration
│   │   │   ├── errorHandler.middleware.js
│   │   │   ├── validator.middleware.js
│   │   │   └── roleCheck.middleware.js
│   │   ├── routes/                  # API endpoint definitions (26 files)
│   │   │   ├── auth.routes.js
│   │   │   ├── application.routes.js
│   │   │   ├── applications.compat.routes.js
│   │   │   ├── admin.routes.js
│   │   │   ├── student.routes.js
│   │   │   ├── lecturer.routes.js
│   │   │   ├── module.routes.js
│   │   │   ├── courses.routes.js
│   │   │   ├── registrations.routes.js
│   │   │   └── [others]
│   │   ├── services/                # Business logic (9 services)
│   │   │   ├── auth.service.js
│   │   │   ├── application.service.js
│   │   │   ├── student.service.js
│   │   │   ├── lecturer.service.js
│   │   │   ├── module.service.js
│   │   │   ├── campus.service.js
│   │   │   ├── qualification.service.js
│   │   │   ├── semester.service.js
│   │   │   └── email.service.js
│   │   ├── database/
│   │   │   ├── migrations/          # Schema changes (19+ migration files)
│   │   │   ├── seeds/               # Seeding scripts
│   │   │   └── seed.js
│   │   ├── studentNumber/           # Specialized module
│   │   │   ├── generator.js         # Generate student IDs
│   │   │   ├── validator.js         # Validate student numbers
│   │   │   ├── store.js
│   │   │   ├── index.js
│   │   │   └── luhn.js              # Luhn algorithm for validation
│   │   └── utils/
│   │       └── constants.js
│   │       └── responseHandler.js
│   ├── package.json                 # Dependencies
│   └── .env                         # Environment config (git-ignored)
├── frontend/                        # Vanilla HTML/CSS/JS frontend
│   ├── public/
│   │   ├── Home.html
│   │   ├── Login.html
│   │   ├── Register.html
│   │   ├── Apply.html               # Admission application form
│   │   ├── Programmes.html          # Program listing
│   │   ├── ForgotPassword.html
│   │   └── images/
│   ├── admin/                       # Admin pages
│   │   ├── Dashboard.html
│   │   ├── Applications.html
│   │   ├── Registrations.html
│   │   ├── Allocations.html
│   │   ├── Students.html
│   │   ├── Courses.html
│   │   ├── Users.html
│   │   └── Reports.html
│   ├── student/                     # Student pages
│   │   ├── Dashboard.html
│   │   ├── Courses.html
│   │   ├── Register.html
│   │   ├── MyCourses.html
│   │   ├── Profile.html
│   │   └── Applications.html
│   ├── lecturer/                    # Lecturer pages
│   │   ├── Dashboard.html
│   │   ├── MyCourses.html
│   │   ├── Roster.html
│   │   └── Announcements.html
│   ├── shared.js                    # Frontend API client (1,382 lines)
│   ├── shared.css                   # Global styles (11,930 lines)
│   └── index.html                   # SPA entry point
├── database/                        # Database initialization
│   └── init.sql
├── nginx/                           # Web server configuration
│   ├── nginx.conf
│   └── Dockerfile
├── pgadmin-config/                  # pgAdmin auto-configuration
│   ├── servers.json
│   ├── pgpass
│   └── setup-pgadmin.sh
├── postman/                         # API documentation
│   └── collections/
├── docker-compose.yml               # Local development services
├── docker-compose.prod.yml          # Production overrides
├── docker-compose.override.yml      # Local overrides
├── Makefile                         # Development commands
├── migrations.js                    # Database migration runner
├── README.md                        # Project documentation
├── DATABASE_SETUP.md                # Database guide
├── systems_runBook.md               # Operational guide
└── .github/
    └── workflows/
        └── deploy.yml               # CI/CD pipeline

```

### Key Differences Between Directories

- **eduhub/**: Working development version with latest migrations and features
- **eduhub-fixed/**: Stable snapshot from May 27, 2026 (missing later John Smith lecturer migration)

---

## 2. TECHNOLOGY STACK

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js 5.2.1
- **ORM**: Sequelize 6.37.8 (PostgreSQL ORM)
- **Database**: PostgreSQL 16
- **Authentication**: JWT (jsonwebtoken 9.0.3)
  - Access tokens: 7 days expiry
  - Refresh tokens: 30 days expiry
- **Password Hashing**: bcrypt/bcryptjs
- **Validation**: express-validator 7.3.2
- **Email**: Nodemailer 8.0.2
- **HTTP Logging**: Morgan 1.10.1
- **Environment Management**: dotenv 17.3.1
- **CORS**: cors 2.8.6
- **Database Client**: pg 8.20.0

### Frontend
- **Language**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Architecture**: Single-Page Application (SPA)
- **API Communication**: Fetch API
- **State Management**: localStorage (currentUser, authToken, reference data)
- **Components**: Vanilla JS components (no framework)
- **Build Tool**: No build tool required (runs as static files)
- **Styling**: Custom CSS with CSS variables for theming

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (reverse proxy + static file server)
- **Database Admin**: pgAdmin 4
- **SSL/TLS**: Let's Encrypt + Certbot (production)
- **CI/CD**: GitHub Actions
- **Container Registry**: GitHub Container Registry (GHCR)
- **Network Connectivity**: Tailscale (for secure SSH)

---

## 3. DATABASE SCHEMA & MODELS

### Core Sequelize Models

#### User
```javascript
{
  id: INTEGER (PK, auto-increment),
  studentNumber: STRING (unique, auto-generated)
  firstName: STRING (required),
  lastName: STRING (required),
  email: STRING (unique, required),
  password: STRING (bcrypt-hashed),
  role: ENUM('admin', 'student', 'lecturer'),
  isPasswordChanged: BOOLEAN (default: false),
  timestamps: (createdAt, updatedAt)
}
```
- **Password Management**: Bcrypt hashing with 10 rounds
- **Student Number Generation**: Automatic generation (format: SD{YEAR}{RANDOM_7_DIGITS})
- **Password Strategy**: Initial temporary passwords, force change on first login

#### Application (Admission)
```javascript
{
  id: INTEGER (PK),
  referenceNumber: STRING (unique),
  firstName, lastName: STRING,
  idNumber: STRING,
  dateOfBirth: DATE,
  gender: ENUM('male', 'female', 'other'),
  nationality: STRING,
  phone, email: STRING,
  addressStreet, addressCity, addressProvince, addressPostalCode: STRING,
  highSchool, matricYear: STRING/INTEGER,
  matricSubjects: JSONB (array of {subject, grade}),
  previousTertiary: JSONB ({institution, qualification, year}),
  payerName, payerRelation, payerPhone, payerEmail: STRING,
  qualificationId, qualificationName: INTEGER/STRING,
  documents: JSONB (filenames/URLs),
  termsAccepted: BOOLEAN,
  status: ENUM('pending', 'approved', 'declined'),
  declineReason: TEXT,
  userId: INTEGER (FK to User, set on approval),
  timestamps
}
```
- **Workflow**: Applications > Admin Review > Approval > User Account Creation
- **Documents**: Stored as JSONB array of object references

#### Module
```javascript
{
  id: INTEGER (PK),
  code: STRING (unique),
  name: STRING,
  credits: INTEGER,
  year: INTEGER (1st, 2nd, 3rd),
  semester: INTEGER (1 or 2),
  qualificationId: INTEGER (FK),
  isActive: BOOLEAN,
  timestamps
}
```

#### Qualification
```javascript
{
  id: INTEGER (PK),
  code: STRING (unique),
  name: STRING,
  faculty: STRING,
  duration: STRING,
  fee: DECIMAL,
  modules: (1:Many relationship)
}
```

#### Semester
```javascript
{
  id: INTEGER (PK),
  year: INTEGER,
  semester: INTEGER (1 or 2),
  startDate: DATE,
  endDate: DATE,
  registrationOpen: BOOLEAN,
  timestamps
}
```

#### Registration (Module Enrollment)
```javascript
{
  id: INTEGER (PK),
  userId: INTEGER (FK),
  semesterId: INTEGER (FK),
  modules: JSONB (array of module IDs),
  quotationAmount: DECIMAL,
  status: ENUM('pending', 'approved', 'declined'),
  declineReason: TEXT,
  timestamps
}
```

### Database Relationships
```
User (1) ──→ (M) Application
User (1) ──→ (M) Registration
Qualification (1) ──→ (M) Module
Semester (1) ──→ (M) Registration
```

### Migrations Framework
- **System**: Sequelize with custom migrator
- **Location**: `backend/src/database/migrations/`
- **Format**: Named by date (YYYY-MM-DD-description.js)
- **19+ Migrations** covering:
  - Schema creation (lowercase naming)
  - Reference data tables
  - Comprehensive program/module setup
  - Nationalities data
  - Application extended fields
  - Default demo accounts
  - Payment/draft statuses
  - Student number allocations
  - John Smith lecturer class assignments (latest)

---

## 4. API ENDPOINTS & ROUTES STRUCTURE

### Authentication Routes (`/api/auth`)
```
POST   /api/auth/register          → Register new user
POST   /api/auth/login             → Login with email/password
POST   /api/auth/logout            → Logout (Bearer token required)
POST   /api/auth/refresh           → Refresh access token
GET    /api/auth/profile           → Get current user profile
```

### Application Routes (`/api/applications`)
```
POST   /api/applications                 → Create admission application (public)
GET    /api/applications/:id             → Get application details (public)
GET    /api/applications                 → List applications (requires auth)
PUT    /api/applications/:id/approve     → Approve application (admin only)
PUT    /api/applications/:id/reject      → Reject application (admin only)
GET    /api/applications/status/:status  → Filter by status
```

### User Routes (`/api/users`)
```
GET    /api/users/profile              → Get full profile
PUT    /api/users/profile              → Update profile
PUT    /api/users/password             → Change password
GET    /api/users                      → List users (admin)
```

### Student Routes (`/api/students`)
```
GET    /api/students               → List all students (staff)
GET    /api/students/:id           → Get student details
GET    /api/students/mycourses     → Get enrolled courses
GET    /api/students/applications  → Get student's applications
```

### Lecturer Routes (`/api/lecturers`)
```
GET    /api/lecturers              → List all lecturers
GET    /api/lecturers/:id          → Get lecturer details
GET    /api/lecturers/:id/classes  → Get assigned classes
GET    /api/lecturers/:id/roster   → Get class roster
```

### Module Routes (`/api/modules`)
```
GET    /api/modules                → List all modules
GET    /api/modules/:id            → Get module details
GET    /api/modules/qualification/:qualId → Get modules for qualification
```

### Qualification Routes (`/api/qualifications`)
```
GET    /api/qualifications         → List all qualifications
GET    /api/qualifications/:id     → Get qualification details
GET    /api/qualifications/:id/modules → Get modules in qualification
```

### Registration Routes (`/api/registrations`)
```
GET    /api/registrations          → List registrations (bearer auth)
POST   /api/registrations          → Create registration
DELETE /api/registrations/:id      → Drop registration
GET    /api/registrations/semester/:semId → Get registrations for semester
```

### Reference Data Routes (`/api/reference`)
```
GET    /api/reference/nationalities     → Get nations list
GET    /api/reference/provinces         → Get SA provinces
GET    /api/reference/genders           → Get gender options
GET    /api/reference/all               → Get all reference data
```

### Campus Routes (`/api/campuses`)
```
GET    /api/campuses               → List campuses (public)
GET    /api/campuses/:id           → Get campus details
```

### Admin Routes (`/api/admin`)
```
GET    /api/admin/users            → All users
GET    /api/admin/statistics       → Dashboard statistics
GET    /api/admin/applications     → Application stats
GET    /api/admin/reports          → Generate reports
```

### Utility Routes
```
GET    /api/health                 → Health check (no auth)
GET    /api/notifications          → Get notifications
```

### Frontend Routes (Served by Express)
```
GET    /                           → Home page
GET    /login                      → Login page
GET    /register                   → Self-registration
GET    /apply                      → Admission application
GET    /programmes                 → Program listing
GET    /admin                      → Admin dashboard
GET    /admin/applications         → Application management
GET    /admin/students             → Student management
GET    /student                    → Student dashboard
GET    /student/courses            → Browse available courses
GET    /student/register           → Module registration
GET    /student/mycourses          → Enrolled courses
GET    /student/profile            → User profile
GET    /lecturer                   → Lecturer dashboard
GET    /lecturer/roster            → Class roster
```

### Authorization Model
- **Public**: `/api/health`, `/api/applications` (POST), `/api/qualifications`, `/api/campuses`
- **Bearer Token Required**: Most `/api/*` endpoints
- **Admin Only**: `/api/admin/*`, approval endpoints
- **Staff Only**: Student/lecturer listing endpoints
- **Self**: User can only modify their own profile

---

## 5. KEY FEATURES & MODULES IMPLEMENTED

### 1. Authentication & Authorization
- JWT-based token system (access + refresh)
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Password change enforcement on first login
- Session management in localStorage
- Automatic token refresh

### 2. Admission & Application Management
- Public application submission (no login required)
- Multi-step form with validation
- Document upload support (JSONB storage)
- Reference number tracking
- Admin approval workflow
- Decline with reason capability
- Automatic user account creation on approval

### 3. Student Management
- Student number auto-generation (with Luhn algorithm validation)
- Student profile management
- Application tracking
- Course registration
- Module enrollment
- Semester-based registration workflow
- Course quota management

### 4. Lecturer Management
- Lecturer account management
- Class/module assignment
- Roster viewing
- Announcement capability

### 5. Module & Qualification Management
- Multi-year, multi-semester curriculum
- Module to qualification mapping
- Credit calculation
- Faculty organization
- Module availability control

### 6. Academic Period Management
- Semester creation and management
- Registration open/close dates
- Academic year tracking

### 7. Admin Dashboard
- Application statistics
- Student enrollment reports
- User management
- Semester management
- System configuration

### 8. Email Notifications
- Nodemailer integration (email.service.js)
- Application status notifications
- Registration confirmations
- Password reset emails

### 9. Reference Data Management
- Nationalities (20+ countries)
- Provinces (9 SA provinces)
- Gender options
- Genders and other dropdowns
- Cached in frontend localStorage

### 10. Student Number Generation
- Format: `SD{YEAR}{7-DIGIT-RANDOM}`
- Luhn algorithm validation
- Role-based prefixes (SD=Student, AM=Admin, LT=Lecturer)
- Unique constraint enforcement

---

## 6. CI/CD CONFIGURATION

### GitHub Actions Workflow (`deploy.yml`)

#### Job 1: Change Detection
- Detects changes to `/backend/**` and `/nginx/**`
- Outputs: `backend`, `nginx` flags

#### Job 2: Build Backend
- Builds Docker image: `ghcr.io/{owner}/eduhub-backend:latest`
- Only runs if backend changed
- Pushes to GitHub Container Registry

#### Job 3: Build Nginx
- Builds Docker image: `ghcr.io/{owner}/eduhub-nginx:latest`
- Only runs if nginx/frontend changed
- Pushes to GitHub Container Registry

#### Job 4: Deploy to Server
- Prerequisites: All builds successful
- **Infrastructure Setup**:
  - Tailscale VPN connection (for secure SSH)
  - SSH to production server
  - SSH credentials from secrets
- **Deployment Steps**:
  1. Generate docker-compose.yml from template
  2. Generate docker-compose.prod.yml with GHCR images
  3. Write .env file with secrets
  4. Create TLS directories for Let's Encrypt
  5. Generate self-signed certificate if missing
  6. Selective service deployment based on changes
  7. Health check monitoring with rollback on failure
  8. Let's Encrypt certificate issuance/renewal
  9. Certbot service startup for auto-renewal
  10. Docker cleanup (prune)

### Deployment Features
- **Conditional Deployment**: Only changed services are redeployed
- **Health Checks**: 24 retries, 5-second intervals (2 minutes max wait)
- **Automatic Rollback**: Reverts to previous image if health check fails
- **SSL/TLS**: Full HTTPS with Let's Encrypt
- **Secrets Management**: GitHub Secrets for passwords and tokens
- **No Downtime**: Health check verification before marking success

### Environment Variables
Production `.env`:
```
DB_NAME=eduhub
DB_USER=postgres
DB_PASSWORD={from secrets}
JWT_SECRET={from secrets}
JWT_REFRESH_SECRET={from secrets}
PGADMIN_PASSWORD={from secrets}
NODE_ENV=production
DOMAIN=edu-hub.duckdns.org
LETSENCRYPT_EMAIL=admin@eduhub.co.za
```

---

## 7. ARCHITECTURAL PATTERNS

### MVC Architecture
```
Routes → Controllers → Services → Models → Database
   ↑
   └─ Middleware (Auth, Validation, Error Handling)
```

### Middleware Pipeline
1. **CORS Middleware** - Enable cross-origin requests
2. **Body Parser** - JSON/urlencoded parsing
3. **Input Sanitization** - Validate all inputs
4. **Morgan Logging** - HTTP request logging
5. **Auth Middleware** - JWT verification
6. **Role Check Middleware** - Authorization
7. **Route Handlers** - Business logic
8. **Error Handler** - Centralized error handling

### Service Layer Pattern
- Business logic separated from controllers
- Reusable across multiple endpoints
- Database abstraction

### Error Handling
- Centralized error handler middleware
- Custom error responses with status codes
- Input validation via express-validator
- Not found handler for 404s

### Authentication Flow
```
Login Credentials
    ↓
AuthService.login()
    ↓
Generate JWT tokens (access + refresh)
    ↓
Return tokens + user data
    ↓
Store in localStorage
    ↓
Include Bearer token in API requests
```

### Frontend State Management
```
User Authentication:
  - localStorage: authToken, currentUser (cached)
  - Fetched from /api/auth/profile on app load

Reference Data:
  - localStorage with TTL (24 hours)
  - Cached qualifications, nationalities, provinces

Cache Versioning:
  - v1, v2 versioning to bust stale cache
```

### Frontend Component Architecture
```
Shared Utilities (shared.js):
  - Auth functions (requireAuth, getAuth, setAuth)
  - API calls (all to /api/*)
  - Data retrieval (getApplications, getUsers, etc.)
  - Cache management
  - UI helpers (toasts, modals, tables)

Page-Specific Scripts:
  - Load shared.js
  - Call renderNavbar(), requireAuth()
  - Fetch data from shared functions
  - Render HTML with DOM manipulation
```

### Data Validation
- **Backend**: express-validator on all routes
- **Frontend**: Client-side HTML5 validation + JS checks
- **Database**: Sequelize model validations
- **Consistency**: Validation on both sides

---

## 8. DEPLOYMENT & INFRASTRUCTURE

### Local Development (docker-compose.yml)
```
Services:
  db (postgres:16)
    - Port 5433
    - Volume: eduhub_pgdata
    - Health check enabled

  pgadmin (dpage/pgadmin4)
    - Port 5050
    - Auto-configured for eduhub DB
    - Depends on db

  backend (Node.js from ./backend Dockerfile)
    - Port 3000
    - Development: npm run dev (nodemon)
    - Health check enabled
    - Depends on db

  nginx
    - Port 80/443
    - Reverse proxy to backend
    - Serves static frontend
    - Health check enabled
    - Depends on backend

Volumes:
  eduhub_pgdata (persistent DB data)
  eduhub_pgadmin (persistent pgAdmin data)

Networks:
  eduhub_network (bridge network)
```

### Production Deployment (docker-compose.prod.yml)
```
Services pull from GHCR:
  backend: ghcr.io/richfield-eduhub/eduhub-backend:latest
  nginx: ghcr.io/richfield-eduhub/eduhub-nginx:latest
  db: postgres:16 (local instance)
  certbot: Let's Encrypt certificate renewal
```

### Development Commands (Makefile)
```
make init              # Initial setup
make up               # Start all services
make down             # Stop all services
make rebuild          # Full rebuild
make dev              # Start with build in foreground
make logs             # View logs
make health           # Health check
make test-api         # Test API endpoints
make backup           # Backup database
make restore          # Restore from backup
make clean            # Delete everything
```

---

## 9. DEMO ACCOUNTS & SEED DATA

### Default Accounts
```
Admin:
  Email: admin@eduhub.ac.za
  Password: Password123!

Lecturer:
  Email: john.smith@eduhub.ac.za
  Password: Password123!

Lecturer:
  Email: sarah.jones@eduhub.ac.za
  Password: Password123!

Student:
  Email: thabo.molefe@student.eduhub.ac.za
  Password: Password123!

Student:
  Email: lerato.khumalo@student.eduhub.ac.za
  Password: Password123!
```

### Seed Data
- **13+ Qualifications** (BSc IT, Dip IT, BBA, BCom, MBA, etc.)
- **100+ Modules** (across all programs)
- **Multiple Campuses**
- **20+ Nationalities**
- **9 SA Provinces**
- **4 Gender Options**

---

## 10. TECHNOLOGY DECISIONS & RATIONALE

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend Framework | Express.js | Lightweight, event-driven, large ecosystem |
| Database | PostgreSQL | Relational, ACID compliance, JSONB support |
| ORM | Sequelize | Mature, migrations support, associations |
| Frontend | Vanilla JS | No build complexity, instant startup, educational value |
| Authentication | JWT | Stateless, scalable, no session storage needed |
| Containerization | Docker | Consistency, isolation, production-ready |
| CI/CD | GitHub Actions | Native to repo, free tier, secrets management |
| Reverse Proxy | Nginx | Performance, SSL termination, static file serving |
| SSL | Let's Encrypt | Free, automated renewal, industry standard |

---

## 11. SECURITY CONSIDERATIONS

### Implemented
- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- CORS middleware for XSS prevention
- Input validation and sanitization
- HTTPS/TLS support (production)
- Environment variables for secrets
- Role-based access control
- SQL injection prevention (Sequelize ORM)

### Recommendations for Enhancement
- CSRF protection (currently basic)
- Rate limiting on auth endpoints
- API key for sensitive operations
- Two-factor authentication
- Audit logging of sensitive operations
- Data encryption at rest
- SQL query logging
- API request throttling

---

## 12. KEY FILES TO UNDERSTAND IMPLEMENTATION

### Critical Configuration Files
- `backend/src/app.js` - Application entry point, route setup
- `backend/src/config/database.js` - Sequelize configuration
- `backend/src/models/index.js` - Model associations
- `migrations.js` - Root-level migration runner
- `docker-compose.yml` - Local development setup
- `.github/workflows/deploy.yml` - Production CI/CD

### Key Service Files
- `backend/src/services/auth.service.js` - Authentication logic (5.7 KB)
- `backend/src/services/application.service.js` - Admission workflow (78.5 KB, largest)
- `backend/src/services/email.service.js` - Email notifications

### Largest & Most Important Files
- `frontend/shared.js` - 1,382 lines - All frontend API logic
- `frontend/shared.css` - 11,930 lines - Complete styling
- `backend/src/services/application.service.js` - 78.5 KB - Complex admission logic
- `migrations.js` - 15.7 KB - Comprehensive seed data
- `.github/workflows/deploy.yml` - 340+ lines - Complete deployment pipeline

---

## 13. DATABASE MIGRATION HISTORY

The project has 19+ migrations tracking:
1. Initial schema creation (lowercase naming convention)
2. Campus data seeding
3. Reference data tables
4. Application extended fields
5. Application campus/applicant relationships
6. Applications extended fields (2 separate migrations)
7. Nationalities reference table
8. Core reference data recovery
9. Comprehensive program/module data
10. Reference modules table
11. Applications draft/payment statuses
12. Metadata for application flow
13. John Smith lecturer class assignments (latest)

---

## 14. REAL-WORLD WORKFLOW EXAMPLES

### Admission Process
```
1. Prospective Student
   └─→ Public Apply Form (/apply)
       └─→ POST /api/applications (validation)
           └─→ Application created with "pending" status
               └─→ Email notification sent
                   └─→ Reference number assigned

2. Admin Reviews Application
   └─→ /admin/applications page
       └─→ Review applicant details
           └─→ Approve: PUT /api/applications/:id/approve
               └─→ Create User account
               └─→ Assign student number
               └─→ Send acceptance email
               └─→ Status → "approved"

3. Student Logs In
   └─→ Use new credentials
       └─→ View /student dashboard
           └─→ See assigned qualifications
               └─→ Wait for module allocation
```

### Course Registration Process
```
1. Student Dashboard
   └─→ Sees "Awaiting Module Allocation"
       └─→ Admin allocates modules via /admin/allocations
           └─→ PUT /api/registrations (create or update)

2. Student Views Courses
   └─→ GET /student/courses (list available)
       └─→ Sees modules by year/semester
           └─→ POST /api/registrations (register for modules)
               └─→ Registration created with "pending" status

3. Admin Approves Registration
   └─→ /admin/registrations
       └─→ Review registered modules
           └─→ Approve: Update status to "approved"
               └─→ Send confirmation email
                   └─→ Calculate quotation amount
```

---

## Conclusion

EduHub is a **production-ready educational management system** demonstrating:
- **Solid architectural patterns** (MVC, Service layer, middleware pipeline)
- **Modern authentication** (JWT with refresh tokens)
- **Scalable deployment** (Docker, Kubernetes-ready, CI/CD automated)
- **Comprehensive business logic** (Admission, registration, enrollment)
- **User-friendly interface** (Role-based dashboards)
- **Data integrity** (Sequelize ORM, migrations, validations)

The implementation accurately reflects the design phase documentation with real, working code handling admissions, registrations, and academic management workflows.

