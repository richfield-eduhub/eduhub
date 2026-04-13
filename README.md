# EduHub — Student Portal

A full-stack educational institution portal with a PostgreSQL backend and multi-role HTML frontend.

## Stack

| Layer        | Technology                               |
|--------------|------------------------------------------|
| Backend      | Node.js + Express 4                      |
| Database     | PostgreSQL (via Sequelize ORM)           |
| Auth         | JWT (access + refresh tokens)            |
| Frontend     | Vanilla HTML/CSS/JS + React (Vite)       |

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

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port **5433**
- pgAdmin on port **5050** (admin@eduhub.ac.za / admin)

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env if your DB credentials differ from defaults
```

### 4. Run migrations + seed

```bash
npm run migrate
npm run seed
```

### 5. Start the server

```bash
npm run dev        # development (nodemon)
npm start          # production
```

Visit: **http://localhost:3000**

---

## Demo Accounts

| Role     | Email                              | Password      |
|----------|------------------------------------|---------------|
| Admin    | admin@eduhub.ac.za                 | Password123!  |
| Lecturer | john.smith@eduhub.ac.za            | Password123!  |
| Lecturer | sarah.jones@eduhub.ac.za           | Password123!  |
| Student  | thabo.molefe@student.eduhub.ac.za  | Password123!  |
| Student  | lerato.khumalo@student.eduhub.ac.za | Password123! |

---

## API Endpoints

| Method | Path                          | Description                   | Auth     |
|--------|-------------------------------|-------------------------------|----------|
| POST   | /api/auth/register            | Register new user             | Public   |
| POST   | /api/auth/login               | Login                         | Public   |
| POST   | /api/auth/logout              | Logout                        | Bearer   |
| GET    | /api/auth/profile             | Get current user profile      | Bearer   |
| GET    | /api/users/profile            | Get profile (full details)    | Bearer   |
| PUT    | /api/users/profile            | Update profile                | Bearer   |
| PUT    | /api/users/password           | Change password               | Bearer   |
| GET    | /api/qualifications           | List qualifications           | Public   |
| GET    | /api/modules                  | List modules                  | Bearer   |
| GET    | /api/campuses                 | List campuses                 | Public   |
| GET    | /api/applications             | List applications             | Bearer   |
| POST   | /api/applications             | Submit application            | Public   |
| PUT    | /api/applications/:id/approve | Approve application           | Admin    |
| PUT    | /api/applications/:id/reject  | Reject application            | Admin    |
| GET    | /api/registrations            | List registrations            | Bearer   |
| POST   | /api/registrations            | Register for modules          | Bearer   |
| DELETE | /api/registrations/:id        | Drop registration             | Bearer   |
| GET    | /api/courses                  | List courses (modules)        | Bearer   |
| GET    | /api/students                 | List students                 | Staff    |
| GET    | /api/lecturers                | List lecturers                | Staff    |
| GET    | /api/admin/users              | All users                     | Admin    |
| GET    | /api/admin/statistics         | Dashboard stats               | Admin    |
| GET    | /api/notifications            | User notifications            | Bearer   |
| GET    | /api/health                   | Health check                  | Public   |

---

## Frontend Pages

| URL                    | Page                   | Role       |
|------------------------|------------------------|------------|
| /                      | Home                   | Public     |
| /login                 | Login                  | Public     |
| /register              | Register               | Public     |
| /apply                 | Apply for admission    | Public     |
| /programmes            | Programmes list        | Public     |
| /admin                 | Admin dashboard        | Admin      |
| /admin/applications    | Manage applications    | Admin      |
| /admin/students        | Manage students        | Admin      |
| /student               | Student dashboard      | Student    |
| /student/courses       | Browse courses         | Student    |
| /student/register      | Register modules       | Student    |
| /lecturer              | Lecturer dashboard     | Lecturer   |
| /lecturer/roster       | Class roster           | Lecturer   |

---

## Environment Variables

| Variable           | Default      | Description                     |
|--------------------|--------------|---------------------------------|
| PORT               | 3000         | Server port                     |
| DB_HOST            | localhost    | PostgreSQL host                 |
| DB_PORT            | 5433         | PostgreSQL port                 |
| DB_NAME            | eduhub       | Database name                   |
| DB_USER            | postgres     | Database user                   |
| DB_PASSWORD        | postgres     | Database password               |
| JWT_SECRET         | (required)   | JWT signing secret              |
| JWT_REFRESH_SECRET | (optional)   | Refresh token secret            |
| JWT_EXPIRES_IN     | 7d           | Token expiry                    |
