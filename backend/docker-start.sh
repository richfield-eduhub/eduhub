#!/bin/sh
echo "📦 Installing packages..."
npm install

echo "✅ Database is ready (confirmed by Docker healthcheck)"

echo "🔄 Running migrations..."
node src/database/migrate.js

echo "🌱 Running seeds..."
node src/database/seed.js

echo "🚀 Starting server..."
node src/app.js
