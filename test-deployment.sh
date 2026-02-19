#!/bin/bash

# Post-Deployment Test Script
# Tests all critical Talon functionality

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <render-app-url>"
    echo "Example: $0 https://talon.onrender.com"
    exit 1
fi

URL="$1"
echo "🧪 Testing Talon Deployment: $URL"
echo "=============================="

# Test basic connectivity
echo "📡 Testing basic connectivity..."
if curl -s --fail "${URL}/" > /dev/null; then
    echo "✅ Main page loads"
else
    echo "❌ Main page failed to load"
    exit 1
fi

# Test health endpoint
echo "🏥 Testing health endpoint..."
HEALTH=$(curl -s "${URL}/api/health" | jq -r '.status // "unknown"')
if [ "$HEALTH" = "ok" ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed: $HEALTH"
fi

# Test API endpoints
echo "🔌 Testing API endpoints..."
API_ENDPOINTS=("/api/agents" "/api/sessions" "/api/system/health")

for endpoint in "${API_ENDPOINTS[@]}"; do
    if curl -s --fail "${URL}${endpoint}" > /dev/null; then
        echo "✅ ${endpoint} responding"
    else
        echo "⚠️  ${endpoint} issues detected"
    fi
done

echo
echo "🎉 Deployment test completed!"
echo "📊 Visit $URL to use Talon dashboard"
