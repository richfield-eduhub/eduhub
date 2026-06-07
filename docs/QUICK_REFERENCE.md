# EduHub - Quick Reference Guide

## Project Overview
- **Type**: Full-stack educational management system
- **Backend**: Node.js/Express + PostgreSQL (Sequelize ORM)
- **Frontend**: Vanilla HTML/CSS/JavaScript (SPA)
- **Deployment**: Docker + GitHub Actions
- **Status**: Production-ready

## Critical Paths to Know

### Backend Entry Point
**File**: `/backend/src/app.js` (Main Express application)
- Sets up middleware (CORS, JSON parser, logging, auth)
- Registers all API routes
- Serves static frontend HTML
- Configures error handling

### API Design Pattern
All API routes follow: `Routes → Controllers → Services → Models → Database`

### Core Services (Business Logic)
1. **auth.service.js** - Login, registration, token management
2. **application.service.js** - Admission workflow (78 KB - most complex)
3. **student.service.js** - Student profile, courses, registrations
4. **module.service.js** - Module listing and qualification mapping
5. **email.service.js** - Email notifications

### Database Models (6 core entities)
1. **User** - Accounts with roles (admin/student/lecturer)
2. **Application** - Admission applications with status workflow
3. **Qualification** - Academic programs (degrees)
4. **Module** - Individual courses with credits
5. **Semester** - Academic periods
6. **Registration** - Student module enrollments

### Frontend Architecture
- Single `shared.js` file (1,382 lines) handles ALL API communication
- Pages are static HTML files that load shared.js
- localStorage stores auth token and user data
- No frontend framework (vanilla JavaScript)

### Key Workflows

#### Admission
```
Student applies → Admin reviews → Approves → Creates user account → Sends notification
```

#### Registration
```
Student views courses → Admin allocates modules → Student enrolls → Admin approves
```

#### Authentication
```
Login → JWT tokens (access + refresh) → Store in localStorage → Include in API headers
```

## Quick Commands

### Local Development
```bash
docker-compose up -d          # Start all services
make logs                      # View logs
make health                    # Check health
make rebuild                   # Full rebuild
```

### Database Access
```bash
docker compose exec db psql -U postgres -d eduhub
\dt                           # List tables
\d tablename                  # Describe table
```

### Testing
```bash
make test-api                 # Test API endpoints
curl http://localhost/api/health  # Quick health check
```

## Demo Accounts
- **Admin**: admin@eduhub.ac.za / Password123!
- **Lecturer**: john.smith@eduhub.ac.za / Password123!
- **Student**: thabo.molefe@student.eduhub.ac.za / Password123!

## Important URLs

### Local Development
- Frontend: http://localhost/
- API: http://localhost/api/
- pgAdmin: http://localhost:5050/
- Backend logs: `make logs-backend`

### Production
- Domain: edu-hub.duckdns.org
- HTTPS enabled with Let's Encrypt
- Deployed via GitHub Actions on push to main

## Database Schema Highlights

### User Table
```sql
id, studentNumber, firstName, lastName, email, password, role, isPasswordChanged, createdAt, updatedAt
```

### Application Table
```sql
id, referenceNumber, firstName, lastName, idNumber, dateOfBirth, gender, nationality, 
phone, email, address*, qualification*, documents (JSONB), status, userId, ...
```

### Key Relationships
```
User (1) ──→ (M) Application      -- Applicant links to user on approval
User (1) ──→ (M) Registration     -- Student enrolls in modules
Qualification (1) ──→ (M) Module  -- Program contains modules
Semester (1) ──→ (M) Registration -- Period has enrollments
```

## Technology Stack Summary

### Backend
| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Framework | Express.js 5.2.1 |
| Database | PostgreSQL 16 |
| ORM | Sequelize 6.37.8 |
| Auth | JWT (7d access, 30d refresh) |
| Password | bcrypt (10 rounds) |
| Validation | express-validator |
| Email | Nodemailer |
| Logging | Morgan |

### Frontend
| Component | Technology |
|-----------|-----------|
| Language | Vanilla JavaScript (ES6+) |
| Styling | CSS3 (custom variables) |
| State | localStorage |
| API | Fetch API |
| Framework | None (no build tool) |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Containerization | Docker Compose |
| Web Server | Nginx |
| Registry | GitHub Container Registry |
| CI/CD | GitHub Actions |
| SSL/TLS | Let's Encrypt + Certbot |
| Network | Tailscale (SSH) |

## File Organization

```
backend/src/
├── app.js                  # Express setup & routes
├── config/database.js      # Sequelize config
├── controllers/            # 8 endpoint handlers
├── models/                 # 6 database entities
├── services/               # 9 business logic services
├── routes/                 # 26 API endpoint definitions
├── middleware/             # Auth, validation, error handling
├── database/               # Migrations (19+) and seeds
└── studentNumber/          # Student ID generation (Luhn)

frontend/
├── shared.js               # API client + utilities (1,382 lines)
├── shared.css              # All styling (11,930 lines)
├── public/                 # Login, apply, programmes pages
├── admin/                  # 8 admin dashboard pages
├── student/                # 6 student pages
└── lecturer/               # 4 lecturer pages
```

## Common Development Tasks

### Add New API Endpoint
1. Create route in `/routes/filename.routes.js`
2. Create controller method in `/controllers/filename.controller.js`
3. Add business logic in `/services/filename.service.js`
4. Register route in `/app.js`
5. Update frontend `shared.js` API call

### Modify Database Schema
1. Create migration in `/database/migrations/YYYY-MM-DD-description.js`
2. Update Sequelize model in `/models/filename.js`
3. Run: `docker compose exec backend npm run migrate`
4. Update frontend if needed

### Add Frontend Page
1. Create HTML file in `frontend/{role}/PageName.html`
2. Add route in `backend/src/app.js` (app.get)
3. Add shared.js call for navigation
4. Import shared.js and shared.css

## Performance Notes
- Frontend: No build process = instant load
- Backend: Middleware pipeline optimized for throughput
- Database: Sequelize lazy loading + eager loading controls
- Caching: Reference data cached 24h in browser
- Deployment: Selective service updates (only changed services)

## Security Checklist
- Password hashing: bcrypt 10 rounds ✓
- JWT tokens: Access (7d) + Refresh (30d) ✓
- CORS: Configured ✓
- Input validation: Express-validator ✓
- SQL injection: Sequelize ORM protects ✓
- HTTPS: Let's Encrypt in production ✓
- Environment secrets: GitHub Secrets ✓
- Role-based access: Middleware checks ✓

## Deployment Pipeline
1. **Push to main** → GitHub Actions triggered
2. **Change detection** → Identify backend/nginx/frontend changes
3. **Build images** → Docker builds ghcr.io images
4. **Deploy** → SSH to prod server via Tailscale
5. **Health check** → Wait for services healthy (2 min timeout)
6. **Rollback** → Auto-revert if health check fails
7. **SSL renewal** → Let's Encrypt certificate automation

## Troubleshooting

### "Port already in use"
```bash
lsof -i :5433    # Find what's using port
docker compose down  # Stop containers
```

### "Database connection failed"
```bash
docker compose logs db  # Check DB logs
docker exec eduhub_db pg_isready -U postgres
```

### "Backend not responding"
```bash
docker compose logs backend
docker compose restart backend
make health  # Check if it recovers
```

### "pgAdmin not configured"
```bash
docker compose rm -f -s -v pgadmin
docker compose up -d pgadmin
```

## Critical Files Map

| Task | File |
|------|------|
| Start Express | `/backend/src/app.js` |
| User auth | `/backend/src/services/auth.service.js` |
| Admissions | `/backend/src/services/application.service.js` |
| Student data | `/backend/src/models/User.js` |
| Applications | `/backend/src/models/Application.js` |
| Frontend API | `/frontend/shared.js` |
| Styling | `/frontend/shared.css` |
| DB config | `/backend/src/config/database.js` |
| Migrations | `/backend/src/database/migrations/` |
| CI/CD | `/.github/workflows/deploy.yml` |
| Dev commands | `/Makefile` |
| Setup guide | `/DATABASE_SETUP.md` |
| Operations | `/systems_runBook.md` |

## Key Insights for Design Documentation

1. **Architecture is proven and working** - Not theoretical design, actual implementation
2. **Scalable design** - Service layer + middleware pipeline allows adding features easily
3. **Frontend simplicity** - No framework = easier to understand, maintain, modify
4. **Database flexibility** - JSONB fields allow semi-structured data (documents, arrays)
5. **Deployment automation** - GitHub Actions handles all infrastructure needs
6. **Multi-role support** - RBAC embedded at middleware level
7. **Extensible workflows** - Admission/registration pipelines follow common patterns
8. **Educational value** - Clear separation of concerns aids learning

