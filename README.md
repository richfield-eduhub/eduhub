# EduHub Database Design

Database schema and setup for the EduHub Student Management System. This branch contains the PostgreSQL database design, pgAdmin configuration, and ERD documentation for managing student applications, registrations, and institutional data.

---

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Make (pre-installed on macOS, `sudo apt install make` on Linux/WSL)

### Start the Database

```bash
make up
```

This will:
- Start PostgreSQL 16 on port 5433 (host) → 5432 (container)
- Start pgAdmin 4 on port 5050
- Auto-configure the database connection

**Note:** Using port 5433 to avoid conflicts with local PostgreSQL installations.

### Access pgAdmin

Open http://localhost:5050 and log in:
- **Email:** `admin@eduhub.co.za`
- **Password:** `admin`

The **EduHub Database** connection is pre-configured under **Databases** → **EduHub Database**. Just click to connect!

---

## Make Commands

| Command        | Description                                           |
| -------------- | ----------------------------------------------------- |
| `make up`      | Start PostgreSQL + pgAdmin (main command)             |
| `make start`   | Alias for `make up`                                   |
| `make setup`   | Install backend dependencies (needed for migrations)  |
| `make migrate` | Run database migrations (no server needed)            |
| `make db`      | Start PostgreSQL only (no pgAdmin)                    |
| `make psql`    | Connect to database via command line                  |
| `make logs`    | View container logs in real-time                      |
| `make stop`    | Stop containers                                       |
| `make restart` | Restart containers (after config changes)             |
| `make clean`   | Stop containers and delete all data (fresh start)     |

---

## Database Connection Details

### From Your Machine (Host)

```
Host:     localhost
Port:     5433  ← Using 5433 to avoid conflict with local PostgreSQL
Database: eduhub
Username: postgres
Password: yourpassword
```

**Connection String:**
```
postgresql://postgres:yourpassword@localhost:5433/eduhub
```

### From Docker Containers (Internal)

```
Host:     db
Port:     5432  ← Internal container port
Database: eduhub
Username: postgres
Password: yourpassword
```

**Connection String:**
```
postgresql://postgres:yourpassword@db:5432/eduhub
```

### Using psql

```bash
# Via Docker (recommended)
make psql

# Or manually
docker exec -it eduhub_db psql -U postgres -d eduhub
```

---

## Project Structure

```
eduhub/
├── Makefile                      # Database commands
├── docker-compose.yml            # PostgreSQL + pgAdmin containers
├── database/
│   └── init.sql                  # Database initialization script
├── pgadmin-config/
│   ├── servers.json              # Auto-configures pgAdmin connection
│   ├── pgpass                    # Password file
│   └── setup-pgadmin.sh          # pgAdmin entrypoint script
├── logs/
│   └── pgadmin/                  # pgAdmin log files
├── README.md                     # This file
└── DATABASE_SETUP.md             # Detailed setup guide for the team
```

---

## EduHub Database Schema

The database supports a role-based student management system with the following entities:

### Core Tables

| Table              | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| `roles`            | System roles (Admin, Lecturer, Student, etc.)     |
| `users`            | Central user accounts (all roles)                 |
| `admins`           | Admin staff profiles                              |
| `lecturers`        | Lecturer profiles and assignments                 |
| `students`         | Student profiles and lifecycle status             |
| `qualifications`   | Academic programmes (BSc IT, Diploma IT, etc.)    |
| `semesters`        | Semester structure within qualifications          |
| `subjects`         | Subjects/modules offered per semester             |
| `applications`     | Student applications for qualifications           |
| `registrations`    | Student course/subject registrations              |

### Key Relationships

- **One user → One role** (can be enhanced to many-to-many later)
- **One qualification → Many semesters**
- **One semester → Many subjects**
- **One lecturer → Many subjects**
- **Students have a lifecycle status:** New → Registered → Alumni
- **Applications link:** User + Qualification + Admin approval
- **Registrations link:** Student + Subject + Admin approval

### Design Philosophy

1. **Central users table** - Single login/account model for all roles
2. **Role-based access** - Roles table controls system permissions
3. **Profile tables** - Extended data for admins, lecturers, students
4. **Student lifecycle** - `student_status` field tracks progression
5. **Application-driven** - Students apply for specific qualifications
6. **Academic hierarchy** - Qualification → Semester → Subject

---

## Database Design Workflow

### 1. Design Your ERD

Use [dbdiagram.io](https://dbdiagram.io) to design your schema visually:

1. Go to https://dbdiagram.io
2. Use DBML syntax (see example below)
3. Export SQL when ready

**Example DBML:**

```dbml
Table roles {
  role_id int [pk, increment]
  role_name varchar [not null]
  created_at timestamp
  updated_at timestamp
}

Table users {
  user_id int [pk, increment]
  role_id int [ref: > roles.role_id]
  first_name varchar
  last_name varchar
  email varchar [unique, not null]
  password_hash varchar
  account_status varchar
  created_at timestamp
  updated_at timestamp
}

Table students {
  student_id int [pk, increment]
  user_id int [ref: > users.user_id]
  qualification_id int [ref: > qualifications.qualification_id]
  student_number varchar [unique]
  student_status varchar // New, Registered, Alumni
  phone varchar
  emergency_contact varchar
  created_at timestamp
  updated_at timestamp
}
```

### 2. Implement the Schema

Add your SQL to `database/init.sql`:

```sql
-- This file runs once when the database is first created

CREATE TABLE roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add more tables...
```

### 3. Apply Changes

```bash
# Delete existing database and start fresh
make clean
make up
```

### 4. Verify in pgAdmin

1. Open http://localhost:5050
2. Navigate to: **Databases** → **EduHub Database** → **Schemas** → **public** → **Tables**
3. Right-click tables to view data or structure

---

## Database Migrations

This project uses a **custom migration system** built with Sequelize that tracks schema changes over time.

### Why Migrations?

Instead of manually running SQL scripts, migrations provide:
- ✅ **Version control** for your database schema
- ✅ **Automated tracking** of what changes have been applied
- ✅ **Team synchronization** - everyone gets the same schema
- ✅ **Rollback capability** (with proper down migrations)
- ✅ **Production safety** - same migrations work in dev and prod

### How It Works

1. **Migration files** live in `backend/migrations/`
2. Each file is named by date: `YYYY-MM-DD-description.js`
3. A `migrations` table in the database tracks what's been run
4. When you run `make migrate`, only new migrations execute
5. Each migration runs in a **transaction** (all-or-nothing)

### First Time Setup

```bash
# 1. Start the database
make up

# 2. Install dependencies (includes Sequelize)
make setup

# 3. Run migrations
make migrate
```

### Running Migrations

```bash
# Run all pending migrations
make migrate

# Or directly via npm
cd backend && npm run migrate
```

**Output example:**
```
🔄 Starting database migrations...

[migrator] running: 2026-03-09-initial-schema
[migrator] done:    2026-03-09-initial-schema

✅ All migrations completed successfully
```

### Creating a New Migration

**1. Create a new file in `backend/migrations/`:**

```bash
# Use today's date
touch backend/migrations/2026-03-23-add-enrollment-table.js
```

**2. Write the migration:**

```javascript
/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-03-23-add-enrollment-table',

    up: async (queryInterface, Sequelize, transaction) => {
      // Create a new table
      await queryInterface.createTable(
        'Enrollments',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          studentId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Students', key: 'id' },
            onDelete: 'CASCADE',
          },
          moduleId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Modules', key: 'id' },
            onDelete: 'CASCADE',
          },
          status: {
            type: Sequelize.ENUM('active', 'dropped', 'completed'),
            defaultValue: 'active',
          },
          enrolledAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('NOW()'),
          },
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction }
      );

      // Add an index
      await queryInterface.addIndex(
        'Enrollments',
        ['studentId', 'moduleId'],
        {
          unique: true,
          name: 'enrollments_student_module_unique',
          transaction,
        }
      );
    },
  },
};
```

**3. Run the migration:**

```bash
make migrate
```

**4. Verify in pgAdmin:**

Navigate to: **Databases** → **EduHub Database** → **Schemas** → **public** → **Tables**

You should see your new `Enrollments` table!

### Migration Best Practices

#### ✅ DO

- **Use transactions** - Always pass `{ transaction }` to queries
- **Include timestamps** - Add `createdAt` and `updatedAt` to new tables
- **Name by date** - Format: `YYYY-MM-DD-description.js`
- **One purpose per migration** - Keep migrations focused
- **Test before committing** - Run on a clean database first
- **Add foreign keys** - Reference related tables properly
- **Include indexes** - Add indexes for performance

#### ❌ DON'T

- **Never edit existing migrations** - Create a new one to fix issues
- **Don't hardcode data** - Seed data should be separate
- **Avoid raw SQL** - Use queryInterface methods when possible
- **Don't skip transactions** - They protect against partial failures
- **Don't delete old migrations** - They're your schema history

### Common Migration Operations

#### Add a Column

```javascript
await queryInterface.addColumn(
  'Users',
  'phoneNumber',
  {
    type: Sequelize.STRING(15),
    allowNull: true,
  },
  { transaction }
);
```

#### Remove a Column

```javascript
await queryInterface.removeColumn(
  'Users',
  'oldColumn',
  { transaction }
);
```

#### Change a Column

```javascript
await queryInterface.changeColumn(
  'Users',
  'email',
  {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  { transaction }
);
```

#### Add an Index

```javascript
await queryInterface.addIndex(
  'Users',
  ['email'],
  {
    unique: true,
    name: 'users_email_unique',
    transaction,
  }
);
```

#### Create a Table

```javascript
await queryInterface.createTable(
  'TableName',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // ... more columns
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  },
  { transaction }
);
```

### Migration Workflow for Teams

**Junior Developer Workflow:**

1. Pull latest code: `git pull origin main`
2. Start database: `make up`
3. Run migrations: `make migrate`
4. Work on your feature
5. Create new migration if needed
6. Test: `make clean && make up && make migrate`
7. Commit and push

**When Merging Branches:**

If two people create migrations on the same day:
- Rename one to the next day
- Or add a suffix: `2026-03-23-a-feature.js`, `2026-03-23-b-other.js`

### Testing Schema from Scratch

```bash
# Delete everything and start fresh
make clean

# Start database
make up

# Run all migrations
make migrate

# Check in pgAdmin
```

This ensures all migrations work correctly from a blank database!

### Migration Files Location

```
backend/
├── migrate.js              # Standalone migration runner
├── migrations/             # All migration files
│   └── 2026-03-09-initial-schema.js
└── src/
    ├── db/
    │   └── migrator.js    # Migration engine
    └── app.js             # Server (also runs migrations on startup)
```

### Dual-Entry System

Migrations can run in two ways:

**1. Standalone (Database Team):**
```bash
make migrate
# Runs migrations WITHOUT starting the Express server
```

**2. Server Startup (Backend Team):**
```bash
cd backend && npm run dev
# Runs migrations THEN starts the API server
```

Both use the **same migration files** and **same tracking table** - no duplication!

---

## Team Collaboration

### For Junior Developers

This setup ensures **zero manual configuration**:

1. Clone the repo
2. Ensure Docker Desktop is running
3. Run `make up`
4. Access pgAdmin at http://localhost:5050
5. Database connection is already configured!

### Best Practices

- **Never commit production passwords** to git
- **Always use branches** - don't push directly to main
- **Use `make clean`** when you need to test schema changes from scratch
- **Check `make logs`** if something doesn't work
- **Read DATABASE_SETUP.md** for detailed troubleshooting

### Branch Naming

Use descriptive branch names:
- `db/add-enrollment-table`
- `db/refactor-user-roles`
- `db/seed-test-data`

---

## pgAdmin Configuration

This repository includes pre-configured pgAdmin setup so the entire team has consistent access:

- **Auto-configured server:** "EduHub Database" appears automatically
- **Password stored:** No need to enter credentials
- **Group name:** "Databases" (not "Development")
- **Logging enabled:** Debug logs saved to `./logs/pgadmin/`

Configuration files:
- `pgadmin-config/servers.json` - Server connection details
- `pgadmin-config/pgpass` - Password file
- `docker-compose.yml` - Environment variables and volumes

---

## Database Design Resources

### Recommended Tools

- **ERD Design:** [dbdiagram.io](https://dbdiagram.io)
- **Database Client:** pgAdmin (included) or [DBeaver](https://dbeaver.io/)
- **Documentation:** [PostgreSQL Docs](https://www.postgresql.org/docs/16/)

### Design Considerations

This database is designed for an academic project. Current simplifications:

- Single role per user (can be enhanced to many-to-many)
- Plain text status fields (can be converted to lookup tables)
- One lecturer per subject (can be many-to-many)
- No audit trail tables (can be added for compliance)
- No MFA/password reset tables yet
- No academic year/intake tracking

These are **intentional simplifications** suitable for Phase 2 of the project. Future phases can add:
- Status lookup tables (`student_statuses`, `application_statuses`)
- Many-to-many relationships (`user_roles`, `lecturer_subjects`)
- Audit/compliance tables (`approval_logs`, `password_reset_tokens`)
- Academic structure (`academic_years`, `intakes`, `faculties`, `departments`)

---

## Troubleshooting

### Database won't start

```bash
# Check Docker is running
docker ps

# Check PostgreSQL health
docker exec eduhub_db pg_isready -U postgres

# View logs
make logs

# Fresh restart
make clean
make up
```

### pgAdmin won't connect

```bash
# Restart pgAdmin with clean state
docker compose stop pgadmin
docker compose rm -f pgadmin
docker volume rm eduhub_eduhub_pgadmin
docker compose up -d pgadmin
```

### Port already in use

**Note:** This project uses port **5433** for PostgreSQL (not the default 5432).

If ports 5433 or 5050 are taken:

```bash
# Check what's using the port
lsof -i :5433
lsof -i :5050

# Option 1: Stop the conflicting service
# Option 2: Change ports in docker-compose.yml
```

### Need detailed help?

See `DATABASE_SETUP.md` for comprehensive troubleshooting and team onboarding guide.

---

## License

This is an educational project for Richfield Graduate Institute of Technology.

---

**Happy database designing! 🗄️**
