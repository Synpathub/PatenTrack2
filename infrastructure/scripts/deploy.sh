#!/bin/bash
set -e

echo "🚀 Deploying PatenTrack..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build all packages
echo "🔨 Building packages..."
pnpm build

# Run database migrations
echo "📊 Running database migrations..."
pnpm db:migrate

# Reload PM2 services
echo "🔄 Reloading services..."
pm2 reload infrastructure/pm2/ecosystem.config.js

# Wait for services to be ready
echo "⏳ Waiting for services to stabilize..."
sleep 10

# Run health check
echo "🏥 Running health check..."
./infrastructure/scripts/health-check.sh

echo "✅ Deployment completed successfully!"
