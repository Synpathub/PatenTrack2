#!/bin/bash
set -e

echo "🏥 Running health checks..."

# Check API health
API_HEALTH=$(curl -s http://localhost:4200/health || echo "failed")
if [[ $API_HEALTH == *"ok"* ]]; then
  echo "✅ API health check passed"
else
  echo "❌ API health check failed"
  exit 1
fi

# Check API readiness
API_READY=$(curl -s http://localhost:4200/health/ready || echo "failed")
if [[ $API_READY == *"ok"* ]]; then
  echo "✅ API readiness check passed"
else
  echo "⚠️  API readiness check failed or degraded"
  echo "$API_READY"
  exit 1
fi

# Check PM2 services
PM2_STATUS=$(pm2 jlist)
if [[ $PM2_STATUS == *"online"* ]]; then
  echo "✅ PM2 services are running"
else
  echo "❌ PM2 services check failed"
  exit 1
fi

echo "✅ All health checks passed!"
