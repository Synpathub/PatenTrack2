#!/bin/bash
set -e

echo "🛑 Stopping PatenTrack services..."

# Stop PM2 services
echo "📉 Stopping application services..."
pm2 delete all || true

# Stop Docker services
echo "🐳 Stopping Docker services..."
docker compose -f infrastructure/docker/docker-compose.yml down

echo "✅ All services stopped successfully!"
