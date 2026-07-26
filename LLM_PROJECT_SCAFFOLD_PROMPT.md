# Universal LLM Project Scaffolding Prompt

> **Purpose:** Generate new projects using EduHub's proven architecture patterns
>
> **Foundation:** All generated projects inherit EduHub's battle-tested structure, security, and DevOps practices

---

## Quick Start - Copy & Use

**Paste this into any LLM (Claude, ChatGPT, etc.):**

```
I want you to scaffold a new project based on the EduHub architecture template.

Project Description: [YOUR PROJECT IDEA HERE]

MANDATORY ARCHITECTURE REQUIREMENTS (from EduHub):

1. **GitHub Workflows (CI/CD):**
   - test.yml - Runs on every PR and push (MUST pass before merge)
   - deploy.yml - Automated deployment on merge to main with health checks
   - backend-tests.yml - Reusable test workflow
   - Change detection (only deploy changed services)
   - Automated rollback on health check failure

2. **Docker Architecture:**
   - docker-compose.yml (local development)
   - docker-compose.prod.yml (production with GHCR images)
   - docker-compose.test.yml (isolated test database)
   - Multi-service setup: backend, database, redis, nginx
   - Health checks for all services
   - Proper dependency ordering (db → redis → backend → nginx)

3. **Database Migrations:**
   - Custom migration runner (src/db/migrator.js pattern)
   - Migrations run AUTOMATICALLY on backend startup
   - Migration tracking table to prevent re-running
   - Transactional migrations (rollback on failure)
   - Migrations in chronological order (YYYY-MM-DD-description.js)
   - NEVER use sequelize-cli sync() in production

4. **Testing Strategy (ENFORCED):**
   - Unit tests (no database, fast)
   - Integration tests (with test database)
   - Security tests (IDOR, JWT, rate limiting)
   - Tests MUST pass before deployment (CI/CD blocks merge)
   - Test database isolated on different port
   - Coverage reporting in GitHub Actions
   - Makefile commands: make test, make test-unit, make test-integration

5. **3-Layer Architecture:**
   - Routes → Controllers → Services (strict separation)
   - Routes: Define endpoints, apply middleware
   - Controllers: Handle request/response, minimal logic
   - Services: Business logic, database operations
   - NEVER put business logic in controllers or routes

6. **Security Patterns (NON-NEGOTIABLE):**
   - IDOR protection with ownership middleware on ALL :id routes
   - Server-side enforcement ONLY (never trust frontend)
   - Per-user rate limiting with Redis (if expensive operations exist)
   - JWT with blacklisting, JTI, and refresh tokens
   - Input sanitization middleware (global)
   - Audit logging for sensitive operations
   - Security headers (helmet, CORS, CSP)
   - Error handling without leaking sensitive data

7. **Middleware Stack (EXACT ORDER):**
   ```javascript
   app.set('trust proxy', 1);
   app.use(securityHeaders);
   app.use(globalRateLimit);
   app.use(cors);
   app.use(express.json());
   app.use(sanitizeInputs);
   app.use(morgan());
   // ... routes ...
   app.use(errorHandler); // MUST be last
   ```

8. **Development Workflow:**
   - Makefile with common commands (init, up, down, test, logs, migrate)
   - Hot reload in development
   - Environment variables (.env.example provided)
   - Secrets NEVER in code (GitHub Secrets for CI/CD)

9. **Deployment Pattern:**
   - Build Docker images → Push to GHCR → Deploy via SSH with health checks
   - Tailscale VPN for secure deployment access
   - Let's Encrypt SSL/TLS automation
   - Log persistence with rotation
   - Automated health checks (24 retries, 5s interval)

10. **File Structure (MANDATORY):**
    ```
    project/
    ├── .github/workflows/      # CI/CD pipelines
    ├── backend/
    │   ├── src/
    │   │   ├── app.js          # Entry point with migration runner
    │   │   ├── config/         # DB, Redis, Security config
    │   │   ├── middleware/     # Auth, ownership, rate limit, sanitize
    │   │   ├── controllers/    # Request handlers
    │   │   ├── services/       # Business logic
    │   │   ├── routes/         # API definitions
    │   │   ├── models/         # ORM models
    │   │   ├── database/migrations/  # Schema changes
    │   │   ├── db/migrator.js  # Migration runner
    │   │   └── utils/          # Helpers
    │   ├── tests/
    │   │   ├── unit/
    │   │   ├── integration/
    │   │   └── security/       # MUST include IDOR, JWT, rate limit tests
    │   └── Dockerfile
    ├── frontend/               # Static or framework-based
    ├── nginx/                  # Reverse proxy config
    ├── docker-compose*.yml     # All 3 variants
    ├── Makefile               # Development commands
    └── .env.example           # Template
    ```

Before generating code, please:
1. Ask me clarifying questions about my specific needs (tech stack preferences, scale, features)
2. Recommend optimal technologies based on my answers AND the EduHub patterns
3. Explain which EduHub patterns apply and which can be adapted
4. Get my approval

Then generate a COMPLETE, PRODUCTION-READY project with:
- All files listed above
- Working Docker setup
- Automated migrations on startup
- CI/CD pipelines that enforce tests
- Security middleware
- Example CRUD operations following 3-layer pattern
- README with setup instructions
- Makefile with all commands

Ready to start? Please ask me about my project requirements.
```

---

## EduHub Architecture Principles Reference

When the LLM generates projects, it MUST follow these specific EduHub patterns:

### 1. Migration on Startup (CRITICAL)

**Pattern from EduHub:**

```javascript
// backend/src/app.js
const { sequelize } = require('./models');
const { runMigrations } = require('./db/migrator');

async function startServer() {
  try {
    // 1. Test DB connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // 2. Run migrations BEFORE starting server
    await runMigrations();
    console.log('✅ Migrations completed');

    // 3. Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1); // Don't start if migrations fail
  }
}
```

**Why:** Ensures database schema is always up-to-date, prevents deployment issues

### 2. GitHub Workflows with Test Enforcement

**Pattern from EduHub:**

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        # ... config
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:all  # BLOCKS merge if fails
```

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  tests:
    uses: ./.github/workflows/backend-tests.yml  # MUST pass first

  deploy:
    needs: [tests]  # Won't run if tests fail
    # ... deployment steps
```

**Why:** Zero-downtime deployments, catches bugs before production

### 3. Docker Health Checks & Dependencies

**Pattern from EduHub:**

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s

  backend:
    depends_on:
      db:
        condition: service_healthy  # Wait for healthy DB
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', ...)"]
      start_period: 40s  # Give time for migrations

  nginx:
    depends_on:
      backend:
        condition: service_healthy  # Only start after backend ready
```

**Why:** Prevents startup race conditions, ensures proper initialization order

### 4. Ownership Middleware (IDOR Protection)

**Pattern from EduHub:**

```javascript
// backend/src/middleware/ownership.middleware.js
const checkOwnership = (model, userIdField = 'user_id', paramName = 'id') => {
  return async (req, res, next) => {
    const recordId = req.params[paramName];
    const userId = req.user.user_id;

    // Staff bypass
    if (['admin', 'lecturer'].includes(req.user.role)) {
      return next();
    }

    const Model = require('../models')[model];
    const record = await Model.findByPk(recordId);

    if (!record) {
      return ResponseHandler.notFound(res, `${model} not found`);
    }

    // Verify ownership
    if (record[userIdField] !== userId) {
      console.warn(`⚠️ IDOR attempt: User ${userId} → ${model}:${recordId}`);
      return ResponseHandler.forbidden(res, 'Access denied');
    }

    req.resource = record; // Avoid double query
    next();
  };
};

// Usage in routes
router.get('/:id', checkOwnership('Application'), controller.getById);
router.patch('/:id', checkOwnership('Application'), controller.update);
router.delete('/:id', checkOwnership('Application'), controller.delete);
```

**Why:** Prevents users from accessing/modifying other users' data (OWASP A01)

### 5. Per-User Rate Limiting with Redis

**Pattern from EduHub:**

```javascript
// backend/src/middleware/perUserRateLimit.middleware.js
const perUserRateLimit = (operation, maxPerHour, maxPerDay, costPerRequest = 0) => {
  return async (req, res, next) => {
    const userId = req.user?.user_id || req.ip;
    const hourKey = `ratelimit:${operation}:${userId}:hour:${getHourTimestamp()}`;
    const dayKey = `ratelimit:${operation}:${userId}:day:${getDayTimestamp()}`;

    const [hourCount, dayCount] = await Promise.all([
      redis.incr(hourKey),
      redis.incr(dayKey),
    ]);

    if (hourCount === 1) await redis.expire(hourKey, 3600);
    if (dayCount === 1) await redis.expire(dayKey, 86400);

    if (hourCount > maxPerHour) {
      return ResponseHandler.error(res, {
        message: `Rate limit exceeded. Max ${maxPerHour}/${operation} per hour.`,
      }, 429);
    }

    if (dayCount > maxPerDay) {
      return ResponseHandler.error(res, {
        message: `Daily limit exceeded. Max ${maxPerDay}/${operation} per day.`,
      }, 429);
    }

    // Track costs for expensive operations
    if (costPerRequest > 0) {
      const costKey = `cost:${userId}:${getDayTimestamp()}`;
      const totalCost = await redis.incrby(costKey, costPerRequest);
      if (totalCost > 10000) { // $100 alert
        console.warn(`🚨 User ${userId} exceeded $100 in daily costs`);
      }
    }

    next();
  };
};

// Usage
router.post('/send-email',
  authenticateToken,
  perUserRateLimit('email_send', 5, 20, 10), // 5/hour, 20/day, $0.10 each
  controller.sendEmail
);
```

**Why:** Prevents cost overruns, API abuse, DoS attacks

### 6. Smart Deployment with Change Detection

**Pattern from EduHub:**

```yaml
# .github/workflows/deploy.yml
jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.filter.outputs.backend }}
      nginx: ${{ steps.filter.outputs.nginx }}
    steps:
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            backend:
              - 'backend/**'
            nginx:
              - 'nginx/**'
              - 'frontend/**'

  deploy:
    needs: [changes, build-backend, build-nginx]
    steps:
      - name: Deploy changed services only
        run: |
          SERVICES_TO_RESTART=""
          [ "${{ needs.changes.outputs.backend }}" = "true" ] && SERVICES_TO_RESTART="$SERVICES_TO_RESTART backend"
          [ "${{ needs.changes.outputs.nginx }}" = "true" ] && SERVICES_TO_RESTART="$SERVICES_TO_RESTART nginx"

          if [ -n "$SERVICES_TO_RESTART" ]; then
            docker compose -f docker-compose.prod.yml up -d $SERVICES_TO_RESTART
          fi
```

**Why:** Faster deployments, less downtime, only restart what changed

### 7. Makefile Development Commands

**Pattern from EduHub:**

```makefile
.PHONY: init up down test migrate logs health

init: ## Complete setup (link, build, start)
	make up
	@echo "✅ Project initialized"

up: ## Start all services
	docker compose up -d --wait

down: ## Stop all services
	docker compose down

test: ## Run all tests (auto-starts test DB)
	cd backend && npm run test:all

test-unit: ## Unit tests only
	cd backend && npm run test:unit

test-integration: ## Integration tests (auto-starts test DB)
	cd backend && npm run test:integration

migrate: ## Run database migrations
	docker compose exec backend npm run migrate

logs: ## View all logs
	docker compose logs -f

logs-backend: ## Backend logs only
	docker compose logs -f backend

health: ## Check service health
	@docker compose ps
	@curl -s http://localhost/api/health | jq .

shell-backend: ## Open backend shell
	docker compose exec backend sh

shell-db: ## Open PostgreSQL shell
	docker compose exec db psql -U postgres -d myapp
```

**Why:** Consistent developer experience, easy onboarding, discoverability

---

## Technology Decision Matrix

When the LLM asks questions, use this matrix to recommend:

### Database Choice

| If Project Has... | Recommend | Why (EduHub Pattern) |
|------------------|-----------|---------------------|
| Structured data, transactions, ACID needed | **PostgreSQL 16** | EduHub uses this, proven reliable |
| Flexible schema, rapid prototyping | MongoDB | EduHub uses PostgreSQL but can adapt |
| Simple app, no complexity | SQLite | Not production-ready for multi-user |
| Time-series, analytics | TimescaleDB | Extension of PostgreSQL |
| **DEFAULT** | **PostgreSQL** | Most versatile, EduHub-proven |

### Redis Usage

| If Project Has... | Redis Required? | Why |
|------------------|----------------|-----|
| Email/SMS/AI operations | **YES (CRITICAL)** | Cost tracking, per-user limits |
| User authentication | **YES** | JWT blacklisting on logout |
| > 1000 users | **YES** | Rate limiting, caching |
| File uploads | **YES** | Per-user upload limits |
| < 100 users, simple CRUD | OPTIONAL | But recommended anyway (cheap) |

### Authentication Method

| Scenario | Recommend | Implementation |
|----------|-----------|----------------|
| Internal company tool | **Keycloak** | SSO with Google/Microsoft AD |
| < 10K users, custom flow | **Custom JWT** | EduHub pattern (enhanced) |
| Social login needed | **Auth0** or **Keycloak** | Pre-built providers |
| > 50K users, compliance | **Keycloak** | Enterprise-grade |

### Frontend Framework

| Scenario | Recommend | Why |
|----------|-----------|-----|
| Simple CRUD, small team | **Vanilla JS (MPA)** | EduHub pattern, no build step |
| Complex UI, large team | **React** or **Vue** | Component reusability |
| SEO critical | **Next.js** (React) | SSR for search engines |
| Real-time heavy | **React + Socket.io** | Live updates |

---

## Mandatory Generated Files

Every project MUST include these files (from EduHub):

### Backend Files

```
backend/
├── src/
│   ├── app.js                        # ✅ MUST call runMigrations()
│   ├── config/
│   │   ├── database.js               # ✅ MUST support DATABASE_URL + individual vars
│   │   └── redis.js                  # ✅ If using Redis
│   ├── middleware/
│   │   ├── auth.middleware.js        # ✅ JWT verification
│   │   ├── ownership.middleware.js   # ✅ IDOR protection
│   │   ├── rateLimit.middleware.js   # ✅ Global limits
│   │   ├── perUserRateLimit.middleware.js  # ✅ If Redis
│   │   ├── sanitize.middleware.js    # ✅ XSS prevention
│   │   ├── validator.middleware.js   # ✅ express-validator
│   │   ├── errorHandler.middleware.js # ✅ Error handling
│   │   └── securityHeaders.middleware.js # ✅ Helmet config
│   ├── db/
│   │   └── migrator.js               # ✅ Custom migration runner
│   ├── database/
│   │   └── migrations/               # ✅ YYYY-MM-DD-*.js files
│   └── utils/
│       ├── responseHandler.js        # ✅ Consistent API responses
│       └── appError.js               # ✅ Custom error class
├── tests/
│   ├── unit/
│   ├── integration/
│   │   ├── env.js                    # ✅ Test environment
│   │   └── globalSetup.js            # ✅ Test DB setup
│   └── security/
│       └── vulnerabilities.test.js   # ✅ IDOR, JWT, rate limit tests
├── Dockerfile                        # ✅ Multi-stage, non-root user
├── package.json                      # ✅ Scripts: start, dev, test, migrate
└── jest.config.js                    # ✅ Separate unit/integration projects
```

### DevOps Files

```
.github/workflows/
├── test.yml                          # ✅ Run on PR
├── deploy.yml                        # ✅ Deploy on main merge
└── backend-tests.yml                 # ✅ Reusable

docker-compose.yml                    # ✅ Development
docker-compose.prod.yml               # ✅ Production (GHCR images)
docker-compose.test.yml               # ✅ Test DB (different port)

Makefile                              # ✅ Common commands

.env.example                          # ✅ All required vars documented
```

### Documentation Files

```
README.md                             # ✅ Setup, architecture, commands
docs/
├── API.md                           # ✅ Endpoint documentation
├── SECURITY.md                      # ✅ Security policy
└── DEPLOYMENT.md                    # ✅ Deploy instructions
```

---

## Example LLM Conversation

**User:**
```
I want you to scaffold a new project based on the EduHub architecture template.

Project Description: A recipe sharing platform where users can post recipes, rate others' recipes, and save favorites. Users need accounts.

recommend for me
```

**LLM:**
```
Perfect! Based on your recipe sharing platform and EduHub patterns:

**Recommended Stack (Following EduHub):**
- Backend: Node.js + Express (same as EduHub)
- Frontend: React (more dynamic than EduHub's MPA, good for recipe browsing UX)
- Database: PostgreSQL 16 (same as EduHub - great for structured recipe data)
- Redis: YES (rate limiting for recipe posts, user activity tracking)
- Auth: Custom JWT (< 10K expected users, same pattern as EduHub)
- File Storage: S3/CloudFlare R2 (recipe images)
- Deployment: Docker + Railway/AWS (same as EduHub)

**EduHub Patterns Applied:**
✅ Migrations run on startup
✅ 3-layer architecture (Routes → Controllers → Services)
✅ Ownership middleware (users can only edit their own recipes)
✅ Per-user rate limiting (prevent recipe spam)
✅ GitHub workflows with test enforcement
✅ Docker health checks
✅ Security middleware stack
✅ Makefile commands

**Adaptations from EduHub:**
- Frontend: React instead of Vanilla JS (better for recipe browsing)
- File uploads: S3 integration (EduHub uses local, but you need images)
- Search: PostgreSQL full-text search for recipes
- Ratings: New table not in EduHub, but follows same patterns

**Architecture:**
```
Recipes (user_id, title, ingredients, instructions, image_url)
Ratings (user_id, recipe_id, rating, comment)
Favorites (user_id, recipe_id)
Users (EduHub pattern)
AuditLogs (EduHub pattern)
FileUploads (EduHub pattern)
```

**Security (EduHub-based):**
- Ownership checks: Can only edit/delete own recipes
- Rate limits: 10 recipe posts/hour, 50/day
- Image upload: 5MB max, validated file types
- Audit log: Track recipe edits, deletions

**Testing (EduHub standard):**
- Unit tests for recipe service logic
- Integration tests for API endpoints
- Security tests for IDOR (can't edit others' recipes)

Should I proceed with this setup?
```

**User:** yes

**LLM:** [Generates complete project with all EduHub patterns adapted]

---

## Quality Assurance

Every generated project will be checked against:

**EduHub Compliance Checklist:**
- [ ] Migrations run automatically on backend startup
- [ ] Tests run before deployment (GitHub Actions blocks merge)
- [ ] Docker health checks with proper dependency order
- [ ] Ownership middleware on all `:id` routes
- [ ] Per-user rate limiting on expensive operations
- [ ] 3-layer architecture strictly followed
- [ ] Security middleware in correct order
- [ ] Makefile with all common commands
- [ ] `.env.example` documents all variables
- [ ] Migration tracking prevents re-runs
- [ ] Test database on separate port
- [ ] Error handling without data leakage
- [ ] Audit logging for sensitive operations
- [ ] Docker non-root user
- [ ] CI/CD with change detection

---

## Version History

- **v1.0** - Initial scaffold prompt based on EduHub architecture
- **Foundation:** EduHub Student Management System (production-proven)
- **Last Updated:** 2026-07-26

---

**Ready to use! Copy the "Quick Start" section above and paste into any LLM.**
