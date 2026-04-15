# EduHub Database Setup - Session Summary
**Date:** March 26, 2026
**Status:** ✅ Complete

---

## Overview

Successfully designed and implemented a complete PostgreSQL database for EduHub with proper separation between production-safe reference data and development-only test data.

---

## What We Built

### 1. Database Schema (14 Tables)

Created a comprehensive database structure with proper dependency ordering:

1. **Users** - Authentication and core user data
2. **User_Details** - Personal information (normalized, separate from auth)
3. **Qualifications** - Academic programmes (BSc IT, BCom, etc.)
4. **Modules** - Course modules with prerequisites
5. **Semesters** - Academic periods
6. **Students** - Student-specific data
7. **Lecturers** - Lecturer-specific data
8. **Emergency_Contacts** - Emergency contact information
9. **Module_Lecturers** - Module assignments (junction table)
10. **Applications** - Programme applications
11. **Application_Documents** - Application supporting docs
12. **Registrations** - Student module registrations
13. **Audit_Logs** - System audit trail
14. **Notifications** - User notifications

**Key Design Decisions:**
- ✅ UUID primary keys for all tables
- ✅ Hybrid normalization (Users/User_Details split for performance)
- ✅ Three status types: `role`, `account_status`, `lifecycle_status`
- ✅ Password management with `is_default_password` flag
- ✅ Proper foreign key relationships with CASCADE/SET NULL

---

### 2. Reference Data (Production-Safe)

**File:** `backend/migrations/2026-03-29-seed-reference-data.js`

<<<<<<< HEAD
Created real Richfield academic data that runs in ALL environments:
=======
Created real EduHub academic data that runs in ALL environments:
>>>>>>> 531c062 (popi's changes)

- **6 Qualifications:**
  - BSc IT
  - Diploma in IT
  - BCom Accounting
  - BCom AGA-IT (SAICA Endorsed)
  - BBA
  - Diploma in Business Administration

<<<<<<< HEAD
- **33 Modules:** Real Richfield curriculum with:
=======
- **33 Modules:** Real EduHub curriculum with:
>>>>>>> 531c062 (popi's changes)
  - Module codes (IT511, PROG511, ACC511, etc.)
  - Credits, year placement, semester
  - Prerequisites (JSON arrays)
  - Year 1-3 progression paths

- **3 Semesters:**
  - 2026 Semester 1 (active)
  - 2026 Semester 2
  - 2027 Semester 1

**This data is consistent across dev, test, and production.**

---

### 3. Test Data Infrastructure (Dev/Test Only)

**File:** `backend/seeds/dev-users.js`

Created development seed data with production safety blocks:

<<<<<<< HEAD
- **1 Admin:** admin@richfield.ac.za
=======
- **1 Admin:** admin@eduhub.ac.za
>>>>>>> 531c062 (popi's changes)
- **3 Lecturers:**
  - Dr. John Smith (Software Engineering & Cloud Computing)
  - Prof. Sarah Jones (Financial Accounting & Auditing)
  - Mr. David Naidoo (AI & Machine Learning)
- **3 Students:**
  - Thabo Molefe (BSc IT)
  - Lerato Khumalo (BCom Accounting)
  - Sipho Dlamini (Diploma IT)
- **7 Module-Lecturer Assignments**
- **8 Student Registrations**

**Default Password:** `Password123!` (marked as `is_default_password = true`)

---

### 4. Seed Runner with Production Protection

**File:** `backend/seed.js`

Created a dedicated seed runner with **three levels of protection**:

1. **Environment Check:**
   ```javascript
   if (process.env.NODE_ENV === 'production') {
     console.error('❌ BLOCKED: Cannot run seeds in production!');
     process.exit(1);
   }
   ```

2. **Makefile Guard:**
   ```makefile
   @if [ "$$NODE_ENV" = "production" ]; then
     echo "❌ Cannot run seeds in production!";
     exit 1;
   fi
   ```

3. **Clear Documentation:**
   - Seeds are in separate `backend/seeds/` directory
   - Different command: `make seed` vs `make migrate`
   - Clear warning messages

---

## Issues Resolved

### Issue 1: Port Conflict (5432 already in use)
**Problem:** Local PostgreSQL was using port 5432
**Solution:** Changed Docker port mapping to 5433:5432
**Files Updated:**
- `docker-compose.yml`
- `backend/.env` and `.env.example`
- `backend/src/config/database.js`
- `DATABASE_SETUP.md` (3 locations)
- `README.md` (4 locations)
- `Makefile` (2 locations)

### Issue 2: Foreign Key Dependency Order
**Problem:** Students table created before Qualifications table, but Students references Qualifications
**Error:** `relation "Qualifications" does not exist`
**Solution:** Created new migration with proper dependency order:
1. Tables with no dependencies first (Users, Qualifications, Semesters)
2. Tables with dependencies next (User_Details, Modules, Students)
3. Junction tables last (Module_Lecturers, Registrations)

**File:** `backend/migrations/2026-03-27-eduhub-schema-corrected.js`

### Issue 3: Invalid UUID Format in Seed Data
**Problem:** Used simple IDs like `'mod-00001'` instead of proper UUIDs
**Error:** `invalid input syntax for type uuid: "mod-00001"`
**Solution:** Replaced all 75+ simple IDs with proper UUID format using bash script:
```bash
sed -i "s/'mod-00001'/'00000001-0001-4000-8000-000000000001'/g"
```

### Issue 4: Mixed Production and Test Data
**Problem:** Single migration file contained both reference data and test users
**Solution:** Separated into two distinct systems:
- **Migrations** (`backend/migrations/`) → Production-safe reference data
- **Seeds** (`backend/seeds/`) → Dev/test only user data

---

## Commands Added

### NPM Scripts
```json
{
  "scripts": {
    "migrate": "node migrate.js",  // Existing
    "seed": "node seed.js"          // NEW ✨
  }
}
```

### Makefile Targets
```makefile
make migrate  # Run migrations (schema + reference data)
make seed     # Run seeds (test users - dev/test only)
make schema   # Export schema for dbdiagram.io
```

---

## File Structure

```
eduhub/
├── backend/
│   ├── migrations/                    # Production-safe (tracked in DB)
│   │   ├── 2026-03-27-eduhub-schema-corrected.js    # Schema (14 tables)
│   │   └── 2026-03-29-seed-reference-data.js        # Reference data ✨
│   ├── seeds/                         # Dev/test only (not tracked)
│   │   └── dev-users.js               # Test users ✨
│   ├── migrate.js                     # Migration runner
│   ├── seed.js                        # Seed runner ✨
│   └── package.json                   # Updated with seed script
├── database/
│   ├── docker/
│   │   └── docker-compose.yml         # PostgreSQL + pgAdmin containers ✨
│   ├── docs/
│   │   ├── DATABASE_SETUP.md          # Team onboarding guide ✨
│   │   ├── database-setup-summary.md  # This file ✨
│   │   └── team-update-whatsapp.txt   # Team update message ✨
│   ├── schema/
│   │   ├── schema.sql                 # Exported PostgreSQL schema
│   │   └── eduhub-schema.dbml         # DBML for dbdiagram.io
│   └── README.md                      # Database folder documentation ✨
└── Makefile                           # Updated with seed target
```

---

## Usage Examples

### Fresh Setup (Development)
```bash
# 1. Clean everything and start fresh
docker compose down -v
make up

# 2. Run migrations (schema + reference data)
make migrate

# 3. Run seeds (test users)
make seed

# 4. Verify
docker exec eduhub_db psql -U postgres -d eduhub -c "\dt"
```

### Production Deployment
```bash
# Only run migrations - seeds are automatically blocked
make migrate

# Attempting to run seeds in production fails:
NODE_ENV=production make seed
# ❌ Cannot run seeds in production!
```

### Connecting to Database
```bash
# Via psql
make psql

# Via pgAdmin
open http://localhost:5050
# Email: admin@eduhub.co.za
# Password: admin

# Connection string
postgresql://postgres:yourpassword@localhost:5433/eduhub
```

---

## Database Contents (After migrate + seed)

| Table | Count | Source | Environment |
|-------|-------|--------|-------------|
| Users | 7 | Seed | Dev/Test only |
| User_Details | 7 | Seed | Dev/Test only |
| Qualifications | 6 | Migration | All environments ✅ |
| Modules | 33 | Migration | All environments ✅ |
| Semesters | 3 | Migration | All environments ✅ |
| Students | 3 | Seed | Dev/Test only |
| Lecturers | 3 | Seed | Dev/Test only |
| Module_Lecturers | 7 | Seed | Dev/Test only |
| Registrations | 8 | Seed | Dev/Test only |
| Emergency_Contacts | 0 | - | - |
| Applications | 0 | - | - |
| Application_Documents | 0 | - | - |
| Audit_Logs | 0 | - | - |
| Notifications | 0 | - | - |

---

## Test Credentials

All test users have the default password: **`Password123!`**

### Admin
<<<<<<< HEAD
- Email: `admin@richfield.ac.za`
- Member Number: `ADMIN001`

### Lecturers
- `john.smith@richfield.ac.za` (EMP2024001)
- `sarah.jones@richfield.ac.za` (EMP2024002)
- `david.naidoo@richfield.ac.za` (EMP2024003)

### Students
- `thabo.molefe@student.richfield.ac.za` (2026-0001)
- `lerato.khumalo@student.richfield.ac.za` (2026-0002)
- `sipho.dlamini@student.richfield.ac.za` (2026-0003)
=======
- Email: `admin@eduhub.ac.za`
- Member Number: `ADMIN001`

### Lecturers
- `john.smith@eduhub.ac.za` (EMP2024001)
- `sarah.jones@eduhub.ac.za` (EMP2024002)
- `david.naidoo@eduhub.ac.za` (EMP2024003)

### Students
- `thabo.molefe@student.eduhub.ac.za` (2026-0001)
- `lerato.khumalo@student.eduhub.ac.za` (2026-0002)
- `sipho.dlamini@student.eduhub.ac.za` (2026-0003)
>>>>>>> 531c062 (popi's changes)

---

## Key Principles Established

### 1. Separation of Concerns
- **Migrations** = Schema changes + Reference data (production-safe)
- **Seeds** = Test data (dev/test only)

### 2. Production Safety
- Multiple layers of protection against running seeds in production
- Clear error messages and documentation

### 3. Data Consistency
- Reference data (qualifications, modules) same across all environments
- Only users/registrations differ between dev and prod

### 4. Developer Experience
- Simple commands: `make migrate`, `make seed`
- Clear feedback and helpful next-step suggestions
- ON CONFLICT DO NOTHING for idempotency (seeds can be re-run)

---

## Design Documentation Referenced

Throughout this session, we followed the design decisions documented in:
- `/Users/tammynkuna/rnt/school/eduhub/docs/4_design_phase_20260608/`

Key insights applied:
- UUID primary keys
- Normalized data structure (Users/User_Details split)
- Lifecycle status tracking (applicant → student → alumni)
- Academic structure (Qualifications → Modules → Semesters → Registrations)

---

## Next Steps

### Immediate
1. ✅ Database schema complete
2. ✅ Reference data seeded
3. ✅ Test data infrastructure ready
4. ⏭️ Start building backend API endpoints

### Future Enhancements
1. Add Sequelize models for each table
2. Create API routes for CRUD operations
3. Implement authentication middleware (JWT)
4. Add validation middleware
5. Create frontend integration

---

## Technical Notes

### PostgreSQL Version
- PostgreSQL 16 (Docker)
- Port: 5433 (host) → 5432 (container)

### Node.js Dependencies
- Sequelize 6.37.8 (ORM)
- bcrypt 6.0.0 (password hashing)
- pg 8.20.0 (PostgreSQL driver)
- dotenv 17.3.1 (environment variables)

### Migration System
- Custom migrator (not Sequelize migrations)
- Transaction support for rollback safety
- Timestamp-based ordering (YYYY-MM-DD prefix)

---

## Success Metrics

✅ **Schema Migration:** 14 tables created successfully
✅ **Reference Data:** 6 qualifications + 33 modules + 3 semesters
✅ **Test Data:** 7 users + 7 assignments + 8 registrations
✅ **Production Safety:** 3 layers of protection against accidental prod seeding
✅ **Database Verification:** All row counts match expected values
✅ **Port Resolution:** Successfully running on port 5433 without conflicts

---

## Lessons Learned

1. **Dependency Order Matters:** Foreign key relationships require careful table creation order
2. **UUID Validation:** PostgreSQL strictly validates UUID format
3. **Separation is Key:** Different data types need different deployment strategies
4. **Multiple Protections:** Production safety requires defense in depth
5. **Clear Documentation:** Good error messages save debugging time

---

## Team Collaboration

This database setup provides a solid foundation for the entire team:

- **Backend Devs:** Can start building API endpoints immediately
- **Frontend Devs:** Have test data to work with locally
- **QA Team:** Consistent test environment with realistic data
- **DevOps:** Production-safe migrations with clear separation
<<<<<<< HEAD
- **Product Team:** Real Richfield programmes and curriculum structure
=======
- **Product Team:** Real EduHub programmes and curriculum structure
>>>>>>> 531c062 (popi's changes)

---

## Visualization

The database schema can be visualized at https://dbdiagram.io by importing:
- `database/schema/eduhub-schema.dbml` (DBML format)
- `database/schema/schema.sql` (PostgreSQL format)

---

## Support

For questions or issues with the database setup:
1. Check this document first
2. Review `DATABASE_SETUP.md` for onboarding steps
3. Check `README.md` for quick reference
4. Review migration files for implementation details

---

**Database Setup Status:** ✅ Complete and Production-Ready
