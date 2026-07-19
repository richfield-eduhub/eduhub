---
title: Docker - Getting Started
description: My journey learning Docker from basics to production
---

# Docker - Getting Started

My journey learning Docker from complete beginner to deploying production applications.

## Timeline

- **Week 1:** Docker basics, containers vs VMs
- **Week 2:** Docker Compose, multi-container apps
- **Week 3:** CI/CD with Docker, image optimization
- **Week 4:** Production deployments, monitoring

## Key Concepts I Mastered

### 1. Understanding Containers

Containers are like lightweight VMs that share the host OS kernel.

**Traditional VM:**
```
[App A] [App B]
[Guest OS] [Guest OS]
[Hypervisor]
[Host OS]
[Hardware]
```

**Docker Containers:**
```
[App A] [App B]
[Docker Engine]
[Host OS]
[Hardware]
```

**Benefits:**
- ✅ Faster startup (seconds vs minutes)
- ✅ Less resource usage
- ✅ Better portability
- ✅ Consistent environments

### 2. Dockerfile Best Practices

#### Before (Inefficient)
```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]
```

**Problems:**
- No layer caching
- Large image size
- Security vulnerabilities

#### After (Optimized)
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Production image
FROM node:20-alpine
WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./

# Security: Run as non-root
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 3000
CMD ["node", "server.js"]
```

**Results:**
- Image size: 1.2GB → 180MB (85% reduction!)
- Build time: 5min → 30sec (with cache)
- Security: Running as non-root user

### 3. Docker Compose Orchestration

#### Simple Example
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_PORT=5432
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

**Key Learnings:**
- Use `depends_on` with `condition: service_healthy`
- Always add health checks
- Use named volumes for persistence
- Environment variables for configuration

### 4. Image Optimization Techniques

#### Technique 1: Use Alpine Base Images
```dockerfile
# Before: 900MB
FROM node:20

# After: 180MB
FROM node:20-alpine
```

#### Technique 2: Multi-Stage Builds
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm run build

# Production stage (only runtime dependencies)
FROM node:20-alpine
COPY --from=builder /app/dist ./dist
```

#### Technique 3: Layer Caching
```dockerfile
# ❌ Bad: Everything rebuilds on any change
COPY . .
RUN npm install

# ✅ Good: Package install is cached
COPY package*.json ./
RUN npm ci
COPY . .
```

#### Technique 4: .dockerignore
```
node_modules
.git
.env
*.log
coverage
```

### 5. Production Best Practices

#### Security
```dockerfile
# Don't run as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Use specific versions (not 'latest')
FROM node:20.11.0-alpine

# Scan for vulnerabilities
RUN apk update && apk upgrade
```

#### Monitoring
```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### Logging
```dockerfile
# Log to stdout/stderr (Docker captures these)
CMD ["node", "server.js"]

# View logs
# docker logs container_name
# docker compose logs -f service_name
```

## Real-World Application: EduHub

Applied these concepts to [EduHub project](/projects/eduhub):

```yaml
services:
  backend:
    image: ghcr.io/user/eduhub-backend:latest
    healthcheck:
      test: ["CMD", "node", "-e", "...health check..."]
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  nginx:
    image: ghcr.io/user/eduhub-nginx:latest
    depends_on:
      backend:
        condition: service_healthy
```

**Results:**
- Zero-downtime deployments ✅
- Automatic health check validation ✅
- Container resource management ✅

## Common Mistakes I Made

### Mistake 1: Not Using Volumes
❌ **Problem:** Lost all database data on container restart

✅ **Solution:** Use named volumes
```yaml
services:
  db:
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

### Mistake 2: Exposing Sensitive Data
❌ **Problem:** Hardcoded passwords in Dockerfile

✅ **Solution:** Use environment variables
```yaml
services:
  db:
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
```

### Mistake 3: No Health Checks
❌ **Problem:** Container running but app crashed

✅ **Solution:** Add health checks
```dockerfile
HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/health || exit 1
```

## Useful Commands

```bash
# Build image
docker build -t myapp:latest .

# Run container
docker run -d -p 3000:3000 --name myapp myapp:latest

# View logs
docker logs -f myapp

# Execute command in container
docker exec -it myapp sh

# Clean up
docker system prune -af

# Docker Compose
docker compose up -d
docker compose logs -f
docker compose down -v
```

## Resources That Helped Me

- 📚 [Docker Documentation](https://docs.docker.com)
- 🎥 [Docker Tutorial for Beginners](https://www.youtube.com/watch?v=fqMOX6JJhGo)
- 📖 "Docker Deep Dive" by Nigel Poulton
- 🛠️ Hands-on practice with real projects

## Next Steps

- [ ] Learn Kubernetes (container orchestration)
- [ ] Study Docker networking in depth
- [ ] Explore Docker Swarm
- [ ] Master Docker security scanning
- [ ] Build custom base images

## Projects Using Docker

- [EduHub](/projects/eduhub) - Multi-container production app
- [This Documentation Site](/projects/home-manager) - Astro in Docker

---

**Questions?** Check out my [blog](/blog) for more Docker tutorials or [contact me](/about/contact).
