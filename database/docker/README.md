# ⚠️ DEPRECATED - Old Docker Configuration

This directory contained the **old** database-only docker-compose setup.

## 🔄 Migration Complete

The database configuration has been **migrated** to the root-level `docker-compose.yml`:

```
/Users/tammynkuna/rnt/school/it_project_700/database/eduhub/docker-compose.yml
```

## 📋 What Changed

### Before (OLD - database/docker/):
- ❌ Only PostgreSQL + pgAdmin
- ❌ No backend
- ❌ No Nginx
- ❌ Manual setup required

### After (NEW - root docker-compose.yml):
- ✅ PostgreSQL + pgAdmin
- ✅ Backend (Node.js + Express)
- ✅ Nginx (reverse proxy + static files)
- ✅ Complete full-stack setup
- ✅ Development & production modes
- ✅ Makefile for easy management

## 🚀 How to Use New Setup

### From Project Root:
```bash
cd /Users/tammynkuna/rnt/school/it_project_700/database/eduhub

# Development mode
make init

# Or manually
docker-compose up -d
```

### Old Commands (DO NOT USE):
```bash
# ❌ OLD - Don't use anymore
cd database/docker
docker compose up -d
```

### New Commands (USE THESE):
```bash
# ✅ NEW - Use these
cd /Users/tammynkuna/rnt/school/it_project_700/database/eduhub
make up          # Start all services
make down        # Stop all services
make logs        # View logs
make help        # See all commands
```

## 📁 Files in This Directory

- `docker-compose.yml.OLD` - Archived old configuration (backup)
- `database/` - Database initialization scripts (still used)
- `README.md` - This file

## ⚙️ Configuration

All configuration is now centralized in:
- **docker-compose.yml** (root) - Service definitions
- **.env** (root) - Environment variables
- **Makefile** (root) - Management commands

## 🗑️ Safe to Delete?

You can safely delete this entire `docker/` directory if you want, but we've kept it with:
- Archived old docker-compose for reference
- This README for documentation

The database initialization scripts in `database/init.sql` are still used by the new setup.

## 📚 Documentation

See root-level documentation:
- [QUICKSTART.md](../../QUICKSTART.md)
- [DEPLOYMENT.md](../../DEPLOYMENT.md)
- [SETUP_COMPLETE.md](../../SETUP_COMPLETE.md)
