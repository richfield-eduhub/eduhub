---
title: EduHub - Student Management System
description: A comprehensive multi-tenant educational institution portal
---

# EduHub - Student Management System

A comprehensive full-stack educational institution portal with PostgreSQL backend, RESTful API, and responsive frontend.

:::tip[Status]
🟢 **Live in Production** - [View Live Site](https://eduhub.example.com)
:::

## Overview

EduHub is a complete student management system built to handle the entire student lifecycle from application to graduation. It features role-based access control, document management, and comprehensive reporting capabilities.

## Key Achievements

- **150+ RESTful API endpoints** - Complete CRUD operations for all entities
- **38 responsive pages** - Multi-role frontend (Admin, Student, Lecturer)
- **10 database models** - Normalized schema with migrations
- **275 automated tests** - 72% test coverage with Jest & Supertest
- **Zero-downtime CI/CD** - Automated testing and deployment
- **5 containerized services** - Docker-based architecture

## Tech Stack

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express 4.18
- **ORM:** Sequelize 6.35
- **Database:** PostgreSQL 16
- **Authentication:** JWT (access + refresh tokens)
- **Security:** MFA/TOTP support

### Frontend
- **HTML/CSS/JavaScript** (migrating to React)
- **Bootstrap 5.3** for responsive design
- **Vanilla JS** for interactivity

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **CI/CD:** GitHub Actions
- **Registry:** GitHub Container Registry (GHCR)
- **SSL:** Let's Encrypt (Certbot)

### Testing
- **Framework:** Jest 29.x
- **API Testing:** Supertest
- **Coverage:** 72% (245 unit tests, 30 integration tests)

## Architecture

```
User Request
     ↓
  Nginx Gateway
     ↓
┌────┴────┐
│         │
Frontend  Backend API
│         │
│    ┌────┴────┐
│    │         │
│  PostgreSQL  │
│    │         │
│  PgAdmin     │
└────┬────┬────┘
     │    │
  Certbot │
     └────┘
```

### Services

1. **Backend API** (Node.js/Express)
   - Port: 3000
   - Health checks enabled
   - Graceful shutdown handling

2. **Frontend** (Nginx)
   - Port: 80/443
   - Static file serving
   - SPA routing support

3. **PostgreSQL Database**
   - Port: 5433
   - Persistent volumes
   - Automated backups

4. **PgAdmin** (Database Management)
   - Port: 5050
   - Web-based administration

5. **Certbot** (SSL Management)
   - Automated certificate renewal
   - Let's Encrypt integration

## Key Features

### Multi-Role System
- **Admin:** Full system access and management
- **Student:** Applications, registrations, profile management
- **Lecturer:** Course management, student records

### Application Management
- Online application submission
- Document upload (ID, certificates, transcripts)
- Application status tracking
- Automated email notifications

### Student Registration
- Course enrollment
- Semester management
- Academic records
- Student number generation (Luhn algorithm)

### Security Features
- JWT-based authentication
- Refresh token rotation
- Password hashing (bcrypt)
- CSRF protection
- Rate limiting
- Security headers (Helmet.js)
- Input validation
- SQL injection prevention

### File Management
- Document upload with validation
- File type restrictions (PDF, JPG, PNG)
- Size limits (5MB)
- Secure storage
- Path traversal prevention

## Database Schema

### Core Models
- **Users** - Authentication and profiles
- **Students** - Student information
- **Lecturers** - Staff information
- **Courses** - Course catalog
- **Modules** - Course modules
- **Applications** - Application records
- **Registrations** - Student enrollments
- **Documents** - File attachments
- **EmergencyContacts** - Emergency information
- **Announcements** - System notifications

### Relationships
- One-to-Many: Student → Applications
- One-to-Many: Course → Modules
- Many-to-Many: Students ↔ Courses (via Registrations)
- One-to-Many: Application → Documents

## CI/CD Pipeline

### Workflow

```
Git Push → main
    ↓
Path Detection
    ↓
┌───────┴────────┐
│                │
Unit Tests   Integration Tests
│                │
└───────┬────────┘
    ↓
Build Docker Images
    ↓
Push to GHCR
    ↓
Deploy to Server
    ↓
Health Check
    ↓
Rollback if Failed
```

### Pipeline Features
- **Parallel test execution** - Unit + Integration + Coverage
- **Smart path detection** - Only rebuild changed services
- **Zero-downtime deployments** - Health check validation
- **Automatic rollback** - Reverts on failure
- **Manual workflow dispatch** - Force deploy all services

### Test Results
- **Unit tests:** 245 passing
- **Integration tests:** 30 passing
- **Total execution time:** ~8 seconds (parallel)
- **Coverage:** 72% overall

## Challenges & Solutions

### Challenge 1: Zero-Downtime Deployments
**Problem:** Service downtime during updates
**Solution:**
- Implemented health checks in containers
- Added `--force-recreate` with health check validation
- Automatic rollback on failed health checks

### Challenge 2: Docker Image Caching
**Problem:** Frontend changes not deploying
**Solution:**
- Added `no-cache: true` to Docker builds
- Dual tagging (`:latest` + `:commit-sha`)
- Force pull with `--ignore-buildable`

### Challenge 3: CI/CD Port Conflicts
**Problem:** Parallel jobs conflicting on same port
**Solution:**
- Use GitHub Actions services (isolated runners)
- Skip docker-compose db in CI (`CI=true` env var)
- Each job gets own isolated database

### Challenge 4: Test Database Management
**Problem:** Integration tests needed separate database
**Solution:**
- docker-compose.test.yml for test DB (port 5434)
- Automated setup/teardown in Makefile
- CI detection to skip local DB setup

## What I Learned

### Technical Skills
- **API Design:** RESTful patterns, versioning, error handling
- **Database Design:** Normalization, migrations, relationships
- **Testing:** Unit tests, integration tests, test coverage
- **Docker:** Multi-container apps, networking, volumes
- **CI/CD:** GitHub Actions, automated deployments
- **Security:** Authentication, authorization, input validation
- **DevOps:** Monitoring, logging, zero-downtime deployments

### Best Practices
- **Test-Driven Development:** Write tests first
- **Git Workflow:** Feature branches, PR reviews
- **Documentation:** Code comments, API docs, README
- **Error Handling:** Consistent error responses
- **Logging:** Structured logging for debugging
- **Monitoring:** Health checks, uptime monitoring

### Product Thinking
- **User Experience:** Role-based workflows
- **Performance:** Query optimization, caching
- **Scalability:** Horizontal scaling with Docker
- **Maintainability:** Clean code, modular architecture

## Performance Metrics

- **API Response Time:** <100ms average
- **Database Queries:** Optimized with indexes
- **Uptime:** 99.9% over 3 months
- **Container Memory:** ~500MB total
- **Build Time:** 8 seconds
- **Deploy Time:** <2 minutes

## Future Improvements

- [ ] Migrate frontend to React
- [ ] Add Redis caching layer
- [ ] Implement WebSocket for real-time updates
- [ ] Add Kubernetes orchestration
- [ ] Implement GraphQL API
- [ ] Add comprehensive monitoring (Prometheus/Grafana)
- [ ] Multi-region deployment
- [ ] Mobile app (React Native)

## Links

- 🔗 [Live Demo](https://eduhub.example.com)
- 🐙 [GitHub Repository](https://github.com/yourusername/eduhub)
- 📚 [API Documentation](/docs/eduhub/api) (Coming soon)
- 📊 [Architecture Diagrams](/docs/eduhub/architecture) (Coming soon)

## Related Projects

- [Home Manager](/projects/home-manager) - Similar architecture patterns
- [Portal 2](/projects/portal2) - Multi-tenant design inspiration

---

**Questions?** Feel free to [reach out](/about/contact) or check the [GitHub repo](https://github.com/yourusername/eduhub).
