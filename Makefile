.PHONY: setup db dev stop clean

# Install dependencies for both services
setup:
	cd backend && npm install
	cd frontend-react && npm install

# Start PostgreSQL and pgAdmin and wait until they're ready
db:
	docker compose up -d db pgadmin
	@echo "Waiting for PostgreSQL..."
	@until docker compose exec db pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo "PostgreSQL is ready."

# Start everything: DB first, then backend + frontend in parallel
dev: db
	@trap 'kill 0' SIGINT; \
	(cd backend && npm run dev) & \
	(cd frontend-react && npm run dev) & \
	wait

# Stop Docker containers
stop:
	docker compose stop

# Stop containers and delete the DB volume (fresh slate)
clean:
	docker compose down -v
