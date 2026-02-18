#!/bin/bash
# Talon Production Smoke Tests
# Run after deployment: ./scripts/smoke-test.sh <production-url>

set -e

PROD_URL="${1:-https://your-service.render.com}"
AUTH_TOKEN="34eb7aa1fa6aa3c7714fd858a8c2a17526c5592b7d7345567469c96a763fa213"

echo "🧪 Talon Production Smoke Tests"
echo "================================"
echo "Target: $PROD_URL"
echo ""

# Test 1: Health Check
echo "1. Health Check..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/api/health")
if [[ $HTTP_CODE == "200" ]]; then
    echo "   ✅ Health endpoint responding"
else
    echo "   ❌ Health check failed ($HTTP_CODE)"
    exit 1
fi

# Test 2: Dashboard Load
echo "2. Dashboard Load..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL")
if [[ $HTTP_CODE == "200" ]]; then
    echo "   ✅ Dashboard accessible"
else
    echo "   ❌ Dashboard failed to load ($HTTP_CODE)"
    exit 1
fi

# Test 3: Authentication
echo "3. Authentication..."
AUTH_RESPONSE=$(curl -s -X POST "$PROD_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"token\":\"$AUTH_TOKEN\"}")
    
if echo "$AUTH_RESPONSE" | grep -q "success"; then
    echo "   ✅ Authentication working"
else
    echo "   ❌ Authentication failed"
    echo "   Response: $AUTH_RESPONSE"
fi

# Test 4: Agent List
echo "4. Agent List API..."
AGENTS_RESPONSE=$(curl -s "$PROD_URL/api/agents")
AGENT_COUNT=$(echo "$AGENTS_RESPONSE" | jq -r '.agents | length' 2>/dev/null || echo "0")

if [[ $AGENT_COUNT -gt "20" ]]; then
    echo "   ✅ Agents loaded ($AGENT_COUNT agents)"
else
    echo "   ⚠️  Unexpected agent count: $AGENT_COUNT"
fi

# Test 5: Semantic Search
echo "5. Semantic Search..."
SEARCH_RESPONSE=$(curl -s -X POST "$PROD_URL/api/search" \
    -H "Content-Type: application/json" \
    -d '{"query":"talon deployment production","limit":3}')
    
RESULT_COUNT=$(echo "$SEARCH_RESPONSE" | jq -r '. | length' 2>/dev/null || echo "0")
if [[ $RESULT_COUNT -gt "0" ]]; then
    echo "   ✅ Search functional ($RESULT_COUNT results)"
else
    echo "   ❌ Search not working"
fi

# Test 6: Gateway Connection
echo "6. Gateway Integration..."
SESSIONS_RESPONSE=$(curl -s "$PROD_URL/api/sessions")
if echo "$SESSIONS_RESPONSE" | grep -q "sessions"; then
    echo "   ✅ Gateway connected"
else
    echo "   ⚠️  Gateway connection issue"
fi

echo ""
echo "🎉 Smoke tests complete!"
echo "   View dashboard: $PROD_URL"
echo "   Login token: $AUTH_TOKEN"