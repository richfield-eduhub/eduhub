# EduHub Deployment Guide

## Docker Compose Architecture

EduHub uses different compose files for different environments:

### Local Development
```bash
# Start everything (includes all services)
docker compose up -d

# With dev overrides (hot reload, etc.)
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

**Files used:**
- `docker-compose.yml` - All services (db, pgadmin, backend, nginx)
- `docker-compose.override.yml` - Dev-specific settings (auto-applied when using `docker compose up`)

---

### Production Deployment

Production uses a **layered approach** to separate infrastructure from application:

#### 1. Infrastructure Layer (Deploy Once Manually)
```bash
# First-time setup only
docker compose -f docker-compose.infrastructure.yml up -d
```

**Includes:**
- **db** (PostgreSQL) - Stateful, rarely changes
- **pgadmin** - Management UI, rarely changes
- **certbot** - SSL certificates, rarely changes

**When to redeploy:**
- Initial server setup
- Postgres version upgrade (rare)
- Debugging infrastructure issues

#### 2. Application Layer (Auto-deployed via CI/CD)
```bash
# CI/CD deploys this automatically on every push to main
docker compose -f docker-compose.infrastructure.yml -f docker-compose.app.yml -f docker-compose.prod.yml up -d backend nginx
```

**Includes:**
- **backend** - Node.js API (changes frequently)
- **nginx** - Reverse proxy + static files (changes frequently)

**When deployed:**
- ✅ Automatically on every push to `main` branch
- ✅ Only rebuilds changed services (backend OR nginx)
- ✅ Runs migrations automatically on backend startup

---

## GitHub Actions Workflow

### Automatic Triggers

The workflow monitors these paths and rebuilds accordingly:

| Path Changed | Rebuilds | Example |
|-------------|----------|---------|
| `backend/**` | Backend only | New API endpoint, migration |
| `nginx/**` or `frontend/**` | Nginx only | Updated HTML, nginx config |
| `docker-compose*.yml`, `database/**` | Both | Infrastructure changes |

### First-Time Production Setup

On the **first deployment**, the workflow will:
1. Create `docker-compose.infrastructure.yml` on the server
2. Start db, pgadmin, certbot containers
3. Deploy backend and nginx

On **subsequent deployments**, it:
1. Skips infrastructure (already running)
2. Only updates backend/nginx as needed
3. Runs health checks before confirming success

---

## Manual Production Deployment

If you need to deploy manually (not recommended, use CI/CD):

```bash
# 1. SSH into production server
ssh user@your-server

# 2. Navigate to app directory
cd ~/prod/eduhub

# 3. Login to GitHub Container Registry
echo $GHCR_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# 4. Pull latest images
docker compose -f docker-compose.infrastructure.yml -f docker-compose.app.yml -f docker-compose.prod.yml pull

# 5. Deploy only changed service
docker compose -f docker-compose.infrastructure.yml -f docker-compose.app.yml -f docker-compose.prod.yml up -d --no-deps backend
# or
docker compose -f docker-compose.infrastructure.yml -f docker-compose.app.yml -f docker-compose.prod.yml up -d --no-deps nginx
```

---

## Upgrading Infrastructure (Rare)

If you need to upgrade PostgreSQL or pgAdmin:

```bash
# 1. Backup database first!
docker exec eduhub_db pg_dump -U postgres eduhub > backup_$(date +%Y%m%d).sql

# 2. Update version in docker-compose.infrastructure.yml
# Example: postgres:16 -> postgres:17

# 3. Redeploy infrastructure
docker compose -f docker-compose.infrastructure.yml up -d --force-recreate db

# 4. Test thoroughly before proceeding
```

---

## File Reference

| File | Purpose | Used In |
|------|---------|---------|
| `docker-compose.yml` | All services for local dev | Development |
| `docker-compose.override.yml` | Dev overrides (hot reload) | Development |
| `docker-compose.infrastructure.yml` | DB, pgAdmin, Certbot | Production (once) |
| `docker-compose.app.yml` | Backend, Nginx | Production (CI/CD) |
| `docker-compose.prod.yml` | Production image overrides | Production |

---

## Troubleshooting

### Migrations not running in production?

Check backend logs:
```bash
docker logs eduhub_backend | grep migrator
```

You should see:
```
[migrator] Checking migrations (6 found, 6 already applied)...
[migrator] All migrations up to date ✓
```

### Need to rebuild everything?

```bash
# Production
docker compose -f docker-compose.infrastructure.yml -f docker-compose.app.yml -f docker-compose.prod.yml up -d --build --force-recreate

# Development
docker compose up -d --build --force-recreate
```

### View running containers

```bash
docker ps -a | grep eduhub
```

Expected containers:
- `eduhub_db` (healthy)
- `eduhub_pgadmin` (up)
- `eduhub_certbot` (up)
- `eduhub_backend` (healthy)
- `eduhub_nginx` (healthy)
