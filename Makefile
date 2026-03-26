.PHONY: up start db logs psql stop clean restart setup migrate seed schema

# Start PostgreSQL and pgAdmin (default command)
up:
	docker compose up -d db pgadmin
	@echo "⏳ Waiting for PostgreSQL..."
	@until docker compose exec db pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo "✅ PostgreSQL is ready at localhost:5433"
	@echo "✅ pgAdmin is available at http://localhost:5050"
	@echo ""
	@echo "📝 pgAdmin login:"
	@echo "   Email: admin@eduhub.co.za"
	@echo "   Password: admin"
	@echo ""
	@echo "💡 Use 'make psql' to connect via command line"
	@echo "💡 Use 'make migrate' to run database migrations"
	@echo "💡 Use 'make logs' to view container logs"

# Alias for 'up' - more intuitive for junior devs
start: up

# Start PostgreSQL only (no pgAdmin)
db:
	docker compose up -d db
	@echo "⏳ Waiting for PostgreSQL..."
	@until docker compose exec db pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo "✅ PostgreSQL is ready at localhost:5433"

# View logs from PostgreSQL and pgAdmin
logs:
	docker compose logs -f db pgadmin

# Connect to PostgreSQL via psql command line
psql:
	docker exec -it eduhub_db psql -U postgres -d eduhub

# Install backend dependencies (needed for migrations)
setup:
	@echo "📦 Installing backend dependencies..."
	@if [ ! -f "backend/.env" ]; then \
		echo "📝 Creating .env file from .env.example..."; \
		cp backend/.env.example backend/.env; \
		echo "✅ .env file created"; \
	fi
	cd backend && npm install
	@echo "✅ Setup complete"
	@echo "💡 Run 'make migrate' to apply database migrations"

# Run database migrations (without starting the server)
migrate:
	@echo "🔄 Running database migrations..."
	@if [ ! -d "backend/node_modules" ]; then \
		echo "❌ Backend dependencies not installed"; \
		echo "💡 Run 'make setup' first"; \
		exit 1; \
	fi
	cd backend && npm run migrate
	@echo "💡 Run 'make seed' to add test users (dev/test only)"
	@echo "💡 Run 'make schema' to export schema for dbdiagram.io"

# Seed test data (DEV/TEST ONLY - blocked in production)
seed:
	@echo "🌱 Seeding test data..."
	@if [ ! -d "backend/node_modules" ]; then \
		echo "❌ Backend dependencies not installed"; \
		echo "💡 Run 'make setup' first"; \
		exit 1; \
	fi
	@if [ "$$NODE_ENV" = "production" ]; then \
		echo "❌ Cannot run seeds in production!"; \
		echo "💡 Use migrations to modify production data"; \
		exit 1; \
	fi
	cd backend && npm run seed

# Export database schema to SQL file (for dbdiagram.io)
schema:
	@echo "📋 Exporting database schema..."
	@mkdir -p database/schema
	docker exec eduhub_db pg_dump -U postgres -d eduhub \
		--schema-only \
		--no-owner \
		--no-privileges \
		--exclude-table=migrations \
		> database/schema/schema.sql
	@echo "✅ Schema exported to: database/schema/schema.sql"
	@echo "💡 Import this file to https://dbdiagram.io for visualization"

# Stop Docker containers
stop:
	docker compose stop
	@echo "🛑 Database containers stopped"

# Restart containers (useful after config changes)
restart:
	docker compose restart
	@echo "🔄 Containers restarted"

# Stop containers and delete all data (fresh start)
clean:
	@echo "⚠️  WARNING: This will delete ALL database data!"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read confirm
	docker compose down -v
	@echo "🧹 All containers and data removed"
	@echo "💡 Run 'make up' to start fresh"
