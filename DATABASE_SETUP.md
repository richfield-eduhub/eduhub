# EduHub Database Setup Guide

This guide will help you set up the PostgreSQL database and pgAdmin for the EduHub project.

## Prerequisites

- Docker Desktop installed and running
- Make (comes with macOS)

## Quick Start

### 1. Start the Database and pgAdmin

```bash
make db-full
```

This command will:
- Start PostgreSQL 16 on port 5433 (host) → 5432 (container)
- Start pgAdmin 4 on port 5050
- Wait for PostgreSQL to be ready
- Display access information

### 2. Access pgAdmin

1. Open your browser and go to: **http://localhost:5050**
2. Login with:
   - **Email:** `admin@eduhub.co.za`
   - **Password:** `admin`

### 3. Database is Pre-Configured!

The **EduHub Database** server connection is automatically configured. You should see it in the left sidebar under "Development > EduHub Database".

Just click on it to connect - no manual setup needed!

## Database Connection Details

### From Your Machine (Host)
- **Host:** `localhost`
- **Port:** `5433` ← **Note: Using 5433 to avoid conflict with local PostgreSQL**
- **Database:** `eduhub`
- **Username:** `postgres`
- **Password:** `yourpassword`

### From Within Docker Containers
- **Host:** `db`
- **Port:** `5432` (internal container port)
- **Database:** `eduhub`
- **Username:** `postgres`
- **Password:** `yourpassword`

## Available Make Commands

| Command | Description |
|---------|-------------|
| `make db-full` | Start PostgreSQL and pgAdmin |
| `make db` | Start PostgreSQL only |
| `make logs` | View logs from both services |
| `make stop` | Stop all containers |
| `make clean` | Stop containers and delete all data (fresh start) |

## Using psql (Command Line)

### Connect to PostgreSQL via Docker

```bash
docker exec eduhub_db psql -U postgres -d eduhub
```

### Common psql Commands

```sql
\dt              -- List all tables
\d table_name    -- Describe a table structure
\l               -- List all databases
\q               -- Quit psql
```

## Viewing Logs

### View all logs in real-time
```bash
make logs
```

### View individual container logs
```bash
docker logs eduhub_db         # PostgreSQL logs
docker logs eduhub_pgadmin    # pgAdmin logs
```

### Log files location
- pgAdmin logs are also saved in: `./logs/pgadmin/`

## Configuration Files

The following files ensure consistent setup across the team:

- **`docker-compose.yml`** - Docker services configuration
- **`pgadmin-config/servers.json`** - Auto-configures the database server in pgAdmin
- **`pgadmin-config/pgpass`** - Stores database password for automatic login
- **`database/init.sql`** - SQL script that runs on first database startup

## Troubleshooting

### pgAdmin doesn't show the server connection

If you don't see "EduHub Database" in pgAdmin:

```bash
# Clean restart pgAdmin
docker compose rm -f -s -v pgadmin
docker compose up -d pgadmin
```

Then refresh your browser and log in again.

### Can't connect to PostgreSQL

```bash
# Check if containers are running
docker ps

# Check PostgreSQL health
docker exec eduhub_db pg_isready -U postgres

# Restart everything
make stop
make db-full
```

### Port already in use

**Note:** This project uses port **5433** for PostgreSQL to avoid conflicts with local PostgreSQL installations.

If port 5433 or 5050 is already in use:

```bash
# Check what's using the port
lsof -i :5433
lsof -i :5050

# Stop the conflicting service or change ports in docker-compose.yml
```

### Fresh start (delete all data)

```bash
make clean
make db-full
```

⚠️ **Warning:** This will delete all database data!

## Design Your Database

1. Visit [dbdiagram.io](https://dbdiagram.io)
2. Use the ERD design from `/docs/database-design.md` or your notes
3. Export the SQL and add it to `database/init.sql`
4. Restart the database: `make clean && make db-full`

## Project Structure

```
eduhub/
├── docker-compose.yml           # Docker services configuration
├── Makefile                     # Convenient commands
├── database/
│   └── init.sql                # Database initialization script
├── pgadmin-config/
│   ├── servers.json            # pgAdmin server auto-config
│   └── pgpass                  # Database password file
└── logs/
    └── pgadmin/                # pgAdmin log files
```

## Security Note

⚠️ **For Development Only**: The passwords in this setup are for local development.

**Never commit production passwords to git!**

For production:
- Use environment variables
- Use strong passwords
- Use `.env` files (and add them to `.gitignore`)
- Consider using Docker secrets

## Need Help?

- Check the logs: `make logs`
- Verify containers are running: `docker ps`
- Restart everything: `make stop && make db-full`
- Ask the team on Slack/Teams

---

Happy coding! 🚀
