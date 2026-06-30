# EduHub — Student Management System

A comprehensive full-stack educational institution portal with PostgreSQL backend, RESTful API, and multi-role HTML frontend.

**Implementation Achievement:** 150% of original scope delivered

- 150+ RESTful API endpoints
- 38 responsive HTML pages
- 10 complete database models
- 72% test coverage (50 test files)

## Stack

| Layer            | Technology                               |
| ---------------- | ---------------------------------------- |
| Backend          | Node.js 20.x + Express 4.18              |
| Database         | PostgreSQL 16 (via Sequelize 6.35 ORM)   |
| Auth             | JWT (access + refresh tokens) + MFA/TOTP |
| Frontend         | Vanilla HTML/CSS/JS + Bootstrap 5.3      |
| Testing          | Jest 29.x + Supertest                    |
| Containerization | Docker + Docker Compose                  |

## Project Structure

```
eduhub/
├── backend/                  ← Express API server (serves frontend too)
│   ├── src/
│   │   ├── app.js            ← Main entry point
│   │   ├── config/           ← Database config
│   │   ├── controllers/      ← Route handlers
│   │   ├── middleware/       ← Auth, CORS, validation, errors
│   │   ├── models/           ← Sequelize models
│   │   ├── routes/           ← API route definitions
│   │   ├── services/         ← Business logic
│   │   ├── database/         ← Migrations & seeds
│   │   └── utils/            ← Constants, response helpers
│   ├── .env                  ← Environment variables (git-ignored)
│   └── package.json
├── frontend-html/            ← Static HTML/CSS/JS frontend
├── frontend-react/           ← React/Vite frontend (optional)
├── database/                 ← SQL schema, Docker compose
└── docker-compose.yml        ← Start PostgreSQL + pgAdmin
```

## Quick Start

### Method 1: Using Makefile (Recommended)

The project includes a **Makefile with 40+ commands** for simplified deployment:

```bash
# Clone and navigate to project
git clone <repository-url>
cd eduhub

# Initialize everything with ONE command
make init

# This automatically:
# - Links frontend files
# - Builds Docker containers
# - Starts all services (backend, database, nginx, pgAdmin)
```

**Services Available:**

- **Frontend:** http://localhost
- **Backend API:** http://localhost/api
- **pgAdmin:** http://localhost:5050

**Common Commands:**

```bash
make help           # Show all available commands
make up             # Start all services
make down           # Stop all services
make test           # Run all tests (auto-starts test DB)
make test-coverage  # Run tests with coverage
make health         # Check service health
make logs-backend   # View backend logs
make shell-db       # Access database shell
make backup         # Backup database
```

### Method 2: Manual Setup (Alternative)

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env if needed

# 4. Run migrations + seed
npm run migrate
npm run seed

# 5. Start server
npm run dev        # development (nodemon)
npm start          # production
```

Visit: **http://localhost:3000**

---

## CI/CD Pipeline & Production Deployment

### GitHub Actions Workflows

The project implements a **production-grade CI/CD pipeline** with automated testing, building, and deployment:

#### 1. Continuous Integration (`.github/workflows/backend-tests.yml`)

**Automated Testing on Every Push:**

- **Unit Tests:** Runs 43 unit test files (no database required)
- **Integration Tests:** Runs 7 integration test files with PostgreSQL 16 test database
- **Coverage Report:** Generates code coverage (72% achieved)
- **Test Matrix:** Tests across multiple Node.js versions
- **Make Integration:** Uses `make test-unit`, `make test-integration`, `make test-coverage`

**Features:**

- PostgreSQL test database automatically provisioned via GitHub Services
- Test results published to GitHub Actions summary
- Coverage artifacts uploaded for review (14-day retention)
- Parallel test execution for faster feedback

#### 2. Continuous Deployment (`.github/workflows/deploy.yml`)

**Automated Deployment Pipeline:**

**Trigger:** Push to `main` branch

**Pipeline Stages:**

1. **Change Detection**
   - Detects which components changed (backend, nginx, root config)
   - Only builds/deploys affected services (optimization)

2. **Automated Testing**
   - Runs full test suite before deployment
   - Deployment blocked if tests fail
   - Coverage report generated

3. **Docker Image Building**
   - Builds Docker images for changed components
   - Pushes to GitHub Container Registry (GHCR)
   - Tagged as `ghcr.io/richfield-eduhub/eduhub-backend:latest`
   - Tagged as `ghcr.io/richfield-eduhub/eduhub-nginx:latest`

4. **Secure Deployment**
   - **VPN:** Connects via Tailscale for secure server access
   - **SSH:** Deploys via SSH with private key authentication
   - **Secrets:** Uses GitHub Secrets for sensitive data (passwords, tokens, SMTP credentials)

5. **Production Deployment Process**
   - Pulls latest Docker images from GHCR
   - Generates production docker-compose files on server
   - Writes .env with secrets from GitHub
   - Performs rolling deployment (zero-downtime)
   - Health checks before marking deployment successful
   - **Automatic Rollback** if health checks fail

6. **SSL/TLS Management**
   - Automatic Let's Encrypt certificate issuance
   - Certificate auto-renewal via certbot
   - HTTPS enforcement
   - Domain: edu-hub.duckdns.org

**GitHub Secrets Used:**

- `DB_PASSWORD` - Production database password
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `PGADMIN_PASSWORD` - pgAdmin access password
- `SMTP_USER` - Email service username
- `SMTP_PASS` - Email service password
- `GHCR_TOKEN` - GitHub Container Registry token
- `TS_AUTH_KEY` - Tailscale authentication key
- `SSH_HOST` - Production server hostname
- `SSH_USER` - SSH username
- `SSH_PRIVATE_KEY` - SSH private key
- `SSH_PORT` - SSH port

**Deployment Features:**

- **Change-Based Deployment:** Only deploys modified services
- **Health Checks:** Validates deployment before completion
- **Rollback Support:** Automatically reverts failed deployments
- **Zero-Downtime:** Rolling deployment keeps service available
- **SSL/TLS:** Automatic HTTPS with Let's Encrypt
- **Monitoring:** Docker health checks every 30 seconds
- **Logging:** Persistent logs in `/logs` directory
- **Resource Cleanup:** Automatic Docker image pruning

**Production Infrastructure:**

- **Backend:** Node.js + Express in Docker container
- **Frontend:** Nginx serving static files + reverse proxy
- **Database:** PostgreSQL 16 with persistent volumes
- **Admin Tool:** pgAdmin 4 for database management
- **SSL/TLS:** Let's Encrypt certificates with auto-renewal
- **Network:** Isolated Docker bridge network
- **Volumes:** Persistent data (database, uploads, logs)

### Deployment Workflow

```bash
# 1. Developer commits code to feature branch
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 2. Create pull request to main branch
# GitHub Actions runs tests automatically

# 3. After PR approval and merge to main:
# - Tests run automatically
# - Docker images build automatically
# - Deployment to production happens automatically
# - Health checks validate deployment
# - Rollback occurs if any issues detected

# Manual deployment (if needed):
make deploy  # Pulls latest images and redeploys
```

### Production Monitoring

**Health Checks:**

- Backend API: http://edu-hub.duckdns.org/api/health (30s interval)
- Nginx: http://edu-hub.duckdns.org/healthz (30s interval)
- Database: pg_isready check (5s interval)

**Logs:**

```bash
# View production logs
make logs-backend
make logs-nginx
make logs-db

# On production server:
cd ~/prod/eduhub
docker compose logs -f backend
docker compose logs -f nginx
```

---

## Demo Accounts

| Role     | Email                               | Password     |
| -------- | ----------------------------------- | ------------ |
| Admin    | admin@eduhub.ac.za                  | Password123! |
| Lecturer | john.smith@eduhub.ac.za             | Password123! |
| Lecturer | sarah.jones@eduhub.ac.za            | Password123! |
| Student  | thabo.molefe@student.eduhub.ac.za   | Password123! |
| Student  | lerato.khumalo@student.eduhub.ac.za | Password123! |

---

## API Endpoints

**Total Implemented: 150+ RESTful API endpoints across 18 categories**

For complete endpoint documentation with request/response examples, see:

- `backend/postman/EduHub-API-Collection.json` (Postman collection)
- `docs/5_implementation_phase_20260629/implementation-phase-FINAL.md` (Complete documentation)

### Core API Categories

| Category                      | Endpoints | Description                                                |
| ----------------------------- | --------- | ---------------------------------------------------------- |
| **Authentication & Security** | 16        | Register, login, MFA, password reset, email verification   |
| **Student Management**        | 7         | Student profiles, academic records, search                 |
| **Lecturer Management**       | 6         | Lecturer profiles, workload, assigned modules              |
| **Application Management**    | 26        | Draft, submit, approve, reject, documents, bulk operations |
| **Module Registration**       | 12        | Browse, register, validate, drop, bulk operations          |
| **Document Management**       | 9         | Upload, verify, download, categorize                       |
| **Emergency Contacts**        | 6         | Add, update, delete, set primary                           |
| **Announcements**             | 7         | Create, publish, target by role, read tracking             |
| **Notifications**             | 8         | Real-time delivery, preferences, read status               |
| **Messaging**                 | 6         | Send, inbox, threads, search                               |
| **Admin Management**          | 24        | Users, roles, statistics, system operations                |
| **Qualifications**            | 4         | List programs, requirements, modules                       |
| **Modules/Courses**           | 6         | Catalog, search, prerequisites                             |
| **Campuses**                  | 5         | List, filter by province/qualification                     |
| **Semesters**                 | 4         | List, current semester, calendar                           |
| **Audit Logging**             | 5         | Activity tracking, user trails                             |
| **System Settings**           | 10        | Configuration, categories, history                         |
| **Reference Data**            | 3+        | Countries, provinces, constants                            |

### Key Endpoints (Sample)

| Method | Path                          | Description                           | Auth   |
| ------ | ----------------------------- | ------------------------------------- | ------ |
| POST   | /api/auth/register            | Register new user                     | Public |
| POST   | /api/auth/login               | Login                                 | Public |
| POST   | /api/auth/mfa/setup           | Setup MFA with QR code                | Bearer |
| POST   | /api/auth/password/forgot     | Request password reset                | Public |
| POST   | /api/applications             | Create/submit application             | Bearer |
| POST   | /api/applications/:id/approve | Approve application (creates student) | Admin  |
| POST   | /api/registrations            | Register for modules                  | Bearer |
| GET    | /api/students                 | List students (paginated)             | Staff  |
| GET    | /api/lecturers/:id/modules    | Get lecturer's modules                | Staff  |
| POST   | /api/documents/upload         | Upload document with validation       | Bearer |
| POST   | /api/emergency-contacts       | Add emergency contact                 | Bearer |
| POST   | /api/announcements            | Create announcement                   | Staff  |
| GET    | /api/notifications            | Get user notifications                | Bearer |
| POST   | /api/messages                 | Send message                          | Bearer |
| GET    | /api/admin/statistics         | Dashboard stats                       | Admin  |
| GET    | /api/audit                    | Get audit logs                        | Admin  |
| PATCH  | /api/settings/:key            | Update system setting                 | Admin  |
| GET    | /api/health                   | Health check                          | Public |

---

## Frontend Pages

**Total: 38 responsive HTML pages (17,000+ lines of code)**

### Public Portal (7 pages)

| URL              | Page               | Features                    |
| ---------------- | ------------------ | --------------------------- |
| /                | Home/Landing       | Hero, programs, features    |
| /login           | Login              | Email/password, MFA support |
| /register        | Registration       | Account creation            |
| /apply           | Application Form   | 9-step wizard, draft saving |
| /programmes      | Programmes Catalog | All qualifications, details |
| /forgot-password | Password Reset     | Reset request               |
| /verify-email    | Email Verification | Token validation            |

### Student Portal (11 pages)

| URL                         | Page                | Features                      |
| --------------------------- | ------------------- | ----------------------------- |
| /student                    | Dashboard           | Stats, announcements, courses |
| /student/profile            | Profile Management  | Edit personal info            |
| /student/register           | Module Registration | Browse, select, validate      |
| /student/my-courses         | My Courses          | Enrolled modules              |
| /student/courses            | Course Catalog      | All available modules         |
| /student/modules            | Module Details      | Prerequisites, description    |
| /student/applications       | Application Status  | Track application             |
| /student/announcements      | Announcements       | View, mark read               |
| /student/messages           | Messages/Inbox      | Internal messaging            |
| /student/emergency-contacts | Emergency Contacts  | Manage contacts (max 3)       |
| /student/documents          | Document Management | Upload, view status           |

### Lecturer Portal (5 pages)

| URL                     | Page          | Features                  |
| ----------------------- | ------------- | ------------------------- |
| /lecturer               | Dashboard     | Stats, assigned modules   |
| /lecturer/my-courses    | My Courses    | Assigned modules          |
| /lecturer/roster        | Class Roster  | Enrolled students, search |
| /lecturer/announcements | Announcements | Create, publish           |
| /lecturer/messages      | Messages      | Communication             |

### Admin Portal (12 pages)

| URL                  | Page                        | Features                   |
| -------------------- | --------------------------- | -------------------------- |
| /admin               | Dashboard                   | System statistics, charts  |
| /admin/applications  | Application Review          | Approve, reject, bulk ops  |
| /admin/students      | Student Management          | List, search, edit         |
| /admin/lecturers     | Lecturer Management         | List, edit, workload       |
| /admin/courses       | Course/Module Management    | CRUD operations            |
| /admin/users         | User Management             | Roles, activate/deactivate |
| /admin/registrations | Registration Management     | View all registrations     |
| /admin/allocations   | Lecturer-Module Allocations | Assign lecturers           |
| /admin/reports       | Reports & Analytics         | Generate, export           |
| /admin/audits        | Audit Logs                  | Activity tracking          |
| /admin/messages      | Messages                    | System communication       |
| /admin/settings      | System Settings             | Configuration              |

### Shared Pages (3 pages)

| URL                   | Page                 | Features                   |
| --------------------- | -------------------- | -------------------------- |
| /shared/security      | Security Settings    | MFA setup, backup codes    |
| /shared/settings      | User Settings        | Preferences                |
| /shared/notifications | Notifications Center | View, manage notifications |

---

## Environment Variables

| Variable           | Default    | Description          |
| ------------------ | ---------- | -------------------- |
| PORT               | 3000       | Server port          |
| DB_HOST            | localhost  | PostgreSQL host      |
| DB_PORT            | 5433       | PostgreSQL port      |
| DB_NAME            | eduhub     | Database name        |
| DB_USER            | postgres   | Database user        |
| DB_PASSWORD        | postgres   | Database password    |
| JWT_SECRET         | (required) | JWT signing secret   |
| JWT_REFRESH_SECRET | (optional) | Refresh token secret |
| JWT_EXPIRES_IN     | 7d         | Token expiry         |
