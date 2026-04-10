# EduHub Database

This folder contains all database infrastructure and configuration files for the EduHub project.

## Structure

```
database/
├── docker/
│   └── docker-compose.yml      # PostgreSQL & pgAdmin Docker configuration
├── docs/
│   ├── DATABASE_SETUP.md       # Team onboarding and setup guide
│   ├── database-setup-summary.md  # Detailed session summary
│   └── team-update-whatsapp.txt   # Quick team update message
├── schema/
│   ├── schema.sql              # PostgreSQL schema export
│   └── eduhub-schema.dbml      # DBML for dbdiagram.io visualization
└── README.md                   # This file
```

## Quick Reference

### Database Configuration
- **Type:** PostgreSQL 16
- **Host:** localhost
- **Port:** 5433 (host) → 5432 (container)
- **Database:** eduhub
- **User:** postgres

### Docker Services
- **PostgreSQL:** `localhost:5433`
- **pgAdmin:** `http://localhost:5050`

### Common Commands

All commands should be run from the **project root** (not this folder):

```bash
# Start database services
make up

# Run migrations (schema + reference data)
make migrate

# Seed test data (dev/test only)
make seed

# Connect via psql
make psql

# Export schema
make schema

# Stop services
make stop

# Clean database (removes all data)
make clean
```

## Backend Database Files

Database-related code in the backend folder:

```
backend/
├── migrations/          # Schema migrations and reference data
├── seeds/              # Test data (dev/test only)
├── migrate.js          # Migration runner
└── seed.js             # Seed runner
```

## Data Separation

### Production-Safe (Migrations)
Located: `backend/migrations/`
- Schema changes
- Reference data (qualifications, modules, semesters)
- Runs in ALL environments

### Dev/Test Only (Seeds)
Located: `backend/seeds/`
- Test users, lecturers, students
- Sample registrations
- BLOCKED in production

## Connection Strings

### From Host Machine
```
postgresql://postgres:yourpassword@localhost:5433/eduhub
```

### From Docker Containers
```
postgresql://postgres:yourpassword@db:5432/eduhub
```

## Documentation

- **Setup Guide:** `docs/DATABASE_SETUP.md`
- **Full Summary:** `docs/database-setup-summary.md`
- **Team Update:** `docs/team-update-whatsapp.txt`

## Visualization

Import schema files to visualize the database:
- Use `schema/eduhub-schema.dbml` at https://dbdiagram.io
- Or import `schema/schema.sql` to any PostgreSQL tool

## Test Credentials

Default password for all test users: **`Password123!`**

- Admin: `admin@eduhub.ac.za`
- Lecturers: `john.smith@eduhub.ac.za`, `sarah.jones@eduhub.ac.za`, `david.naidoo@eduhub.ac.za`
- Students: `thabo.molefe@student.eduhub.ac.za`, `lerato.khumalo@student.eduhub.ac.za`, `sipho.dlamini@student.eduhub.ac.za`

---

For detailed setup instructions, see `docs/DATABASE_SETUP.md`
