.PHONY: help build up down restart logs ps clean frontend-link frontend-update test backup restore

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)EduHub Docker Management$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

build: ## Build all containers
	@echo "$(BLUE)Building all containers...$(NC)"
	docker-compose build

up: ## Start all services
	@echo "$(GREEN)Starting all services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@make ps

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down
	@echo "$(YELLOW)✓ Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting all services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

restart-backend: ## Restart backend only
	@echo "$(YELLOW)Restarting backend...$(NC)"
	docker-compose restart backend
	@echo "$(GREEN)✓ Backend restarted$(NC)"

restart-nginx: ## Restart nginx only
	@echo "$(YELLOW)Restarting nginx...$(NC)"
	docker-compose restart nginx
	@echo "$(GREEN)✓ Nginx restarted$(NC)"

logs: ## Show logs for all services (follow mode)
	docker-compose logs -f

logs-backend: ## Show backend logs only
	docker-compose logs -f backend

logs-nginx: ## Show nginx logs only
	docker-compose logs -f nginx

logs-db: ## Show database logs only
	docker-compose logs -f db

ps: ## Show running containers
	@echo "$(BLUE)Running containers:$(NC)"
	@docker-compose ps

health: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend API:$(NC)"
	@curl -s http://localhost/api/health | python3 -m json.tool || echo "$(RED)✗ Backend unreachable$(NC)"
	@echo ""
	@echo "$(YELLOW)Frontend:$(NC)"
	@curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost/ || echo "$(RED)✗ Frontend unreachable$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker Services:$(NC)"
	@docker-compose ps

clean: ## Remove all containers, volumes, and images
	@echo "$(RED)Warning: This will remove all data!$(NC)"
	@read -p "Are you sure? (yes/no): " confirm && [ "$$confirm" = "yes" ] || exit 1
	docker-compose down -v --rmi all
	@echo "$(GREEN)✓ Cleaned up$(NC)"

frontend-link: ## Create symlink to frontend directory
	@echo "$(BLUE)Creating symlink to frontend...$(NC)"
	ln -sf /Users/tammynkuna/rnt/school/it_project_700/eduhub-popik-coder-patch/eduhub/frontend-html ./frontend
	@echo "$(GREEN)✓ Symlink created: ./frontend -> frontend-html$(NC)"

frontend-update: ## Update frontend to use shared.js instead of shared-local.js
	@echo "$(BLUE)Updating frontend HTML files...$(NC)"
	@if [ -d "./frontend" ]; then \
		find ./frontend -name "*.html" -exec sed -i '' 's/shared-local\.js/shared.js/g' {} + && \
		echo "$(GREEN)✓ Frontend updated to use shared.js$(NC)"; \
	else \
		echo "$(RED)✗ Frontend directory not found. Run 'make frontend-link' first.$(NC)"; \
	fi

shell-backend: ## Access backend container shell
	docker-compose exec backend sh

shell-db: ## Access database container shell
	docker-compose exec db psql -U postgres -d eduhub

shell-nginx: ## Access nginx container shell
	docker-compose exec nginx sh

test-api: ## Test API endpoints
	@echo "$(BLUE)Testing API endpoints...$(NC)"
	@echo ""
	@echo "$(YELLOW)Health Check:$(NC)"
	@curl -s http://localhost/api/health | python3 -m json.tool
	@echo ""
	@echo "$(YELLOW)Login Test (will fail without credentials):$(NC)"
	@curl -s -X POST http://localhost/api/auth/login \
		-H "Content-Type: application/json" \
		-d '{"email":"test@test.com","password":"test"}' | python3 -m json.tool

backup: ## Backup database to backup.sql
	@echo "$(BLUE)Backing up database...$(NC)"
	docker-compose exec -T db pg_dump -U postgres eduhub > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Database backed up$(NC)"

restore: ## Restore database from backup.sql
	@echo "$(YELLOW)Restoring database...$(NC)"
	@read -p "Enter backup file name: " filename && \
	docker-compose exec -T db psql -U postgres eduhub < $$filename
	@echo "$(GREEN)✓ Database restored$(NC)"

dev: ## Start services in development mode
	@echo "$(BLUE)Starting in development mode...$(NC)"
	docker-compose -f docker-compose.yml up --build

rebuild: ## Rebuild and restart all services
	@echo "$(BLUE)Rebuilding all services...$(NC)"
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "$(GREEN)✓ Services rebuilt and started$(NC)"

rebuild-backend: ## Rebuild and restart backend only
	@echo "$(BLUE)Rebuilding backend...$(NC)"
	docker-compose build --no-cache backend
	docker-compose up -d --force-recreate backend
	@echo "$(GREEN)✓ Backend rebuilt and restarted$(NC)"

stats: ## Show container resource usage
	docker stats --no-stream

prune: ## Remove unused Docker resources
	@echo "$(YELLOW)Pruning unused Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)✓ Pruned$(NC)"

init: frontend-link build up ## Initial setup: link frontend, build, and start
	@echo ""
	@echo "$(GREEN)═══════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  EduHub initialized successfully!$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(BLUE)Services available at:$(NC)"
	@echo "  Frontend:  $(YELLOW)http://localhost$(NC)"
	@echo "  API:       $(YELLOW)http://localhost/api$(NC)"
	@echo "  pgAdmin:   $(YELLOW)http://localhost:5050$(NC)"
	@echo ""
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "  1. Update frontend: $(YELLOW)make frontend-update$(NC)"
	@echo "  2. Check health:    $(YELLOW)make health$(NC)"
	@echo "  3. View logs:       $(YELLOW)make logs$(NC)"
	@echo ""
