# EduHub — Student Management Portal

A digital system for managing student applications, profiles, and course registrations at an educational institution. Built with JavaScript (HTML/CSS frontend + Node.js/Express backend), using the Agile development model.

---

## What It Does

EduHub provides a secure, role-based portal where different users can access and manage institutional information:

| Role          | Capabilities                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Applicant** | Submit applications online                                                                                       |
| **Student**   | Manage personal details, emergency contacts, register for courses, add/remove subjects within the allowed period |
| **Alumni**    | Access records                                                                                                   |
| **Lecturer**  | View class lists and course information                                                                          |
| **Librarian** | Manage library-related records                                                                                   |
| **Admin**     | Approve new student applications, manage all users and data                                                      |

**Key features:**

- Secure login with password reset and MFA
- Role-based access control
- Admin approval workflow — student numbers are auto-generated after approval
- Online course registration with semester-based subject selection
- REST API backend with JWT authentication

---

## Project Structure

```
eduhub/
├── Makefile                    # Dev entry point — start everything from here
├── docker-compose.yml          # Runs PostgreSQL in Docker (no local install needed)
├── database/
│   └── init.sql                # Runs once on first container start (extensions etc.)
├── backend/                    # Node.js + Express REST API
│   ├── migrations/             # Database migration files (schema history)
│   └── src/
│       ├── app.js              # Entry point — runs migrations then starts server
│       ├── db/
│       │   └── migrator.js     # Custom migration runner
│       ├── config/             # Database connection
│       ├── models/             # Sequelize ORM models
│       ├── routes/             # auth, applications, users, qualifications, modules, semesters, registrations
│       └── middleware/         # Auth guards etc.
├── frontend-react/             # React frontend (Vite + TypeScript)
├── frontend-html/              # Plain HTML/CSS prototype
└── docs/                       # Project documentation and diagrams
```

---

## Tech Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Frontend   | React 19, TypeScript, Vite                             |
| Backend    | Node.js, Express 5                                     |
| Database   | PostgreSQL 16 (Docker), Sequelize ORM                  |
| Migrations | Custom migration runner (`backend/src/db/migrator.js`) |
| Auth       | JWT (jsonwebtoken), bcryptjs                           |
| Email      | Nodemailer                                             |
| Dev tools  | nodemon, Docker, Make                                  |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL — no local install needed)
- Make (`sudo apt install make` on WSL/Linux, pre-installed on macOS)

### 1. Clone the repo

```bash
git clone git@github.com:richfield-eduhub/eduhub.git
cd eduhub
```

### 2. Create a new branch

> **Note:** Pushing directly to `main` is not allowed. Always work on a feature branch.

```bash
git checkout -b your-feature-branch
```

Use a descriptive branch name, e.g. `feat/add-login`, `fix/user-auth`, `docs/update-readme`.

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and set your values — at minimum update `DB_PASSWORD` to match `docker-compose.yml`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=eduhub
DB_USER=postgres
DB_PASSWORD=yourpassword

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Optional: email notifications
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=yourpassword
MAIL_FROM="EduHub <no-reply@eduhub.co.za>"
```

### 4. Install dependencies

```bash
make setup
```

### 5. Start everything

```bash
make dev
```

This will:

1. Start PostgreSQL in Docker
2. Start pgAdmin (database GUI)
3. Wait until the database is ready
4. Start the backend — migrations run automatically on startup
5. Start the frontend

| Service      | URL                              |
| ------------ | -------------------------------- |
| Frontend     | http://localhost:5173            |
| Backend API  | http://localhost:3000            |
| Health check | http://localhost:3000/api/health |
| PostgreSQL   | `localhost:5432`                 |
| pgAdmin      | http://localhost:5050            |

> **pgAdmin login:** `admin@eduhub.co.za` / `admin`
>
> To connect pgAdmin to the database, add a new server with host `db`, port `5432`, username `postgres`, and the password from your `.env`.

---

## Makefile Commands

| Command      | What it does                                               |
| ------------ | ---------------------------------------------------------- |
| `make setup` | Install npm dependencies for backend and frontend          |
| `make db`    | Start PostgreSQL + pgAdmin containers and wait until ready |
| `make dev`   | Start DB + backend + frontend (main command)               |
| `make stop`  | Stop Docker containers                                     |
| `make clean` | Stop containers and delete the DB volume (fresh slate)     |

---

## Database Migrations

EduHub uses an explicit migration system instead of `sequelize.sync()`.

**How it works:**

- Migration files live in `backend/migrations/`, named by date: `YYYY-MM-DD-description.js`
- On startup, the migrator checks which migrations have already run (tracked in a `migrations` table in the DB)
- Any new migrations are applied once, in order, each wrapped in a transaction
- Once recorded, a migration never runs again

**Why it's safe to restart or redeploy repeatedly:**

The `migrations` table in the database acts as a persistent checklist — one row per migration that has already run. On every startup the migrator:

1. Reads all migration files (by name)
2. Reads the `migrations` table to see what has already run
3. Compares the two — only runs migrations that are in the files but not yet in the table
4. After each successful migration, inserts a row into the table so it is never run again

Because this log lives in the database itself (not in the code or container), it survives restarts and redeployments. On a prod deploy, old migrations are already recorded in the table and are skipped — only new migrations added since the last deploy will run.

> `make clean` deletes the Docker volume, which wipes the entire database including the tracking table. The next `make dev` starts from a completely blank slate and re-runs all migrations. Use this during development when you want to test your migrations from scratch — never in production.

**To change the database schema:**

1. Create a new file in `backend/migrations/`:

```
backend/migrations/2026-04-01-add-payments-table.js
```

2. Export a migration object:

```js
module.exports = {
  migration: {
    name: "2026-04-01-add-payments-table",
    up: async (queryInterface, Sequelize, transaction) => {
      await queryInterface.createTable(
        "Payments",
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          // ... your columns
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction },
      );
    },
  },
};
```

3. Restart the backend (`make dev`) — the migration runs automatically.

**Rules:**

- Never edit an existing migration file — always create a new one
- Always wrap operations in the provided `transaction`
- Always include `createdAt` and `updatedAt` when creating tables

---

## API Endpoints

| Prefix                | Description                               |
| --------------------- | ----------------------------------------- |
| `/api/auth`           | Login, register, password reset, MFA      |
| `/api/applications`   | Submit and manage student applications    |
| `/api/users`          | User profiles and emergency contacts      |
| `/api/qualifications` | Qualifications/programmes                 |
| `/api/modules`        | Subjects/modules                          |
| `/api/semesters`      | Semester configuration                    |
| `/api/registrations`  | Course registration and subject selection |

---

## SDLC

This project follows the **Agile** model — developed in iterative sprints, with continuous testing and incremental feature delivery.
