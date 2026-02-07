#!/bin/bash
set -e

echo "🚀 Starting PatenTrack services..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Copying from .env.example..."
  cp .env.example .env
  echo "📝 Please update .env with your configuration before proceeding."
  exit 1
fi

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL, Redis)..."
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Run migrations
echo "📊 Running database migrations..."
pnpm db:migrate

# Start application services with PM2
echo "🎯 Starting application services..."
pm2 start infrastructure/pm2/ecosystem.config.js

echo "✅ All services started successfully!"
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🌐 API Server: http://localhost:4200"
echo "🏥 Health Check: http://localhost:4200/health"
echo "📚 API Docs: http://localhost:4200/docs"
