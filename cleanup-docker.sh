#!/bin/bash
echo "🧹 Stopping and removing old EduHub containers..."

docker stop eduhub_db eduhub_pgadmin eduhub_backend 2>/dev/null
docker rm eduhub_db eduhub_pgadmin eduhub_backend 2>/dev/null

echo "✅ Done. Now run: docker-compose up -d"
